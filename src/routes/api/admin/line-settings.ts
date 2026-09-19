import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  LINE_CHANNEL_ACCESS_TOKEN_KEY,
  LINE_GROUP_ID_KEY,
  loadLineSettings,
  loadRuntimeSettings,
  maskSecret,
  saveRuntimeSettings,
  type RuntimeSetting,
} from "@/lib/admin-runtime-settings.server";

const SaveSchema = z.object({
  action: z.literal("save").optional().default("save"),
  lineChannelAccessToken: z.string().max(5000).optional().default(""),
  lineGroupId: z.string().max(500).optional().default(""),
});

const TestSchema = z.object({
  action: z.literal("test"),
});

const PostSchema = z.union([TestSchema, SaveSchema]);

function jsonError(message: string, status: number, details?: unknown) {
  return Response.json({ error: message, details }, { status });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { response: jsonError("Unauthorized: missing Bearer token", 401) };
  }

  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  const email = user?.email?.toLowerCase();
  const adminEmails = getAdminEmails();

  if (error || !email) {
    return { response: jsonError("Unauthorized: invalid session", 401) };
  }

  if (!adminEmails.includes(email)) {
    return { response: jsonError("Forbidden: this user is not an admin", 403) };
  }

  return { email };
}

async function lineSettingsPayload() {
  const runtimeSettings = await loadRuntimeSettings([
    LINE_CHANNEL_ACCESS_TOKEN_KEY,
    LINE_GROUP_ID_KEY,
  ]);
  const mergedSettings = await loadLineSettings();
  const runtimeToken = runtimeSettings.get(LINE_CHANNEL_ACCESS_TOKEN_KEY)?.value?.trim() ?? "";
  const envToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() ?? "";
  const runtimeGroupId = runtimeSettings.get(LINE_GROUP_ID_KEY)?.value?.trim() ?? "";

  return {
    ok: true,
    source: mergedSettings.source,
    tokenConfigured: Boolean(mergedSettings.lineChannelAccessToken),
    tokenSource: runtimeToken ? "runtime" : envToken ? "env" : "missing",
    maskedToken: runtimeToken ? maskSecret(runtimeToken) : envToken ? maskSecret(envToken) : "",
    lineGroupId: runtimeGroupId || process.env.LINE_GROUP_ID?.trim() || "",
    groupIdSource: runtimeGroupId ? "runtime" : process.env.LINE_GROUP_ID ? "env" : "missing",
  };
}

async function sendLineTestMessage() {
  const settings = await loadLineSettings();
  const missing = [
    ...(!settings.lineChannelAccessToken ? [LINE_CHANNEL_ACCESS_TOKEN_KEY] : []),
    ...(!settings.lineGroupId ? [LINE_GROUP_ID_KEY] : []),
  ];

  if (missing.length > 0) {
    return jsonError("LINE settings are incomplete.", 400, { missing });
  }

  const nowTh = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.lineChannelAccessToken}`,
    },
    body: JSON.stringify({
      to: settings.lineGroupId,
      messages: [
        {
          type: "text",
          text: `Matrix Intertrade admin LINE test\nTime: ${nowTh}\nSource: ${settings.source}`,
        },
      ],
    }),
  });

  if (!lineRes.ok) {
    const details = await lineRes.text();
    return jsonError("LINE test message failed.", 502, {
      lineStatus: lineRes.status,
      details,
    });
  }

  return Response.json({ ok: true, message: "LINE test message sent." });
}

export const Route = createFileRoute("/api/admin/line-settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        return Response.json(await lineSettingsPayload());
      },
      POST: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON body", 400);
        }

        const parsed = PostSchema.safeParse(body);
        if (!parsed.success) {
          return jsonError("Invalid LINE settings payload", 400, parsed.error.flatten());
        }

        if (parsed.data.action === "test") {
          return sendLineTestMessage();
        }

        const rows: RuntimeSetting[] = [
          {
            key: LINE_GROUP_ID_KEY,
            value: parsed.data.lineGroupId.trim(),
            is_secret: false,
          },
        ];

        const nextToken = parsed.data.lineChannelAccessToken.trim();
        if (nextToken) {
          rows.push({
            key: LINE_CHANNEL_ACCESS_TOKEN_KEY,
            value: nextToken,
            is_secret: true,
          });
        }

        try {
          await saveRuntimeSettings(rows);
        } catch (error) {
          return jsonError("Failed to save LINE settings.", 500, error);
        }

        return Response.json(await lineSettingsPayload());
      },
    },
  },
});
