import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  GOOGLE_ANALYTICS_ID_KEY,
  META_PIXEL_ID_KEY,
  isValidGoogleAnalyticsId,
  isValidMetaPixelId,
  loadGoogleAnalyticsSettings,
  loadMetaPixelSettings,
  loadRuntimeSettings,
  normalizeGoogleAnalyticsId,
  normalizeMetaPixelId,
  saveRuntimeSettings,
  type RuntimeSetting,
} from "@/lib/admin-runtime-settings.server";

const SaveSchema = z.object({
  action: z.literal("save").optional().default("save"),
  googleAnalyticsId: z.string().max(100).optional().default(""),
  metaPixelId: z.string().max(30).optional().default(""),
});

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

async function trackingSettingsPayload() {
  // ─── Google Analytics ──────────────────────────────────────
  const runtimeSettings = await loadRuntimeSettings([GOOGLE_ANALYTICS_ID_KEY, META_PIXEL_ID_KEY]);
  const mergedGaSettings = await loadGoogleAnalyticsSettings();
  const runtimeGaId = normalizeGoogleAnalyticsId(
    runtimeSettings.get(GOOGLE_ANALYTICS_ID_KEY)?.value ?? "",
  );
  const envGaId = normalizeGoogleAnalyticsId(process.env.GOOGLE_ANALYTICS_ID ?? "");
  const googleAnalyticsId = runtimeGaId || envGaId;

  // ─── Meta Pixel ────────────────────────────────────────────
  const mergedPixelSettings = await loadMetaPixelSettings();

  return {
    ok: true,
    // Google Analytics
    source: mergedGaSettings.source,
    configured: Boolean(googleAnalyticsId),
    googleAnalyticsId,
    idSource: runtimeGaId ? "runtime" : envGaId ? "env" : "missing",
    // Meta Pixel
    metaPixelId: mergedPixelSettings.metaPixelId,
    pixelConfigured: Boolean(mergedPixelSettings.metaPixelId),
    pixelIdSource: mergedPixelSettings.source,
  };
}

export const Route = createFileRoute("/api/admin/tracking-settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        return Response.json(await trackingSettingsPayload());
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

        const parsed = SaveSchema.safeParse(body);
        if (!parsed.success) {
          return jsonError("Invalid tracking settings payload", 400, parsed.error.flatten());
        }

        // Validate Google Analytics ID
        const nextGaId = normalizeGoogleAnalyticsId(parsed.data.googleAnalyticsId);
        if (nextGaId && !isValidGoogleAnalyticsId(nextGaId)) {
          return jsonError("Google Analytics ID must use the format G-XXXX.", 400);
        }

        // Validate Meta Pixel ID
        const nextPixelId = normalizeMetaPixelId(parsed.data.metaPixelId);
        if (nextPixelId && !isValidMetaPixelId(nextPixelId)) {
          return jsonError(
            "Meta Pixel ID must be a numeric string (10-20 digits), e.g. 1578638136531199.",
            400,
          );
        }

        const rows: RuntimeSetting[] = [
          {
            key: GOOGLE_ANALYTICS_ID_KEY,
            value: nextGaId,
            is_secret: false,
          },
          {
            key: META_PIXEL_ID_KEY,
            value: nextPixelId,
            is_secret: false,
          },
        ];

        try {
          await saveRuntimeSettings(rows);
        } catch (error) {
          return jsonError("Failed to save tracking settings.", 500, error);
        }

        return Response.json(await trackingSettingsPayload());
      },
    },
  },
});
