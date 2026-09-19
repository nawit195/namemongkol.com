import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  LINE_CHANNEL_ACCESS_TOKEN_KEY,
  LINE_GROUP_ID_KEY,
  loadLineSettings,
} from "@/lib/admin-runtime-settings.server";

const Schema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().default(""),
  email: z.string().email().max(200),
  phone: z.string().min(1).max(50),
  topic: z.string().max(100).optional().default(""),
  message: z.string().max(5000).optional().default(""),
});

const TO_EMAIL = "matrixintertrade2026@gmail.com";

type ContactSubmission = z.infer<typeof Schema>;

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatLineQuoteMessage(d: ContactSubmission, nowTh: string) {
  return [
    "คำขอใบเสนอราคาใหม่จากเว็บไซต์",
    `วันที่/เวลา: ${nowTh}`,
    `ชื่อ-นามสกุล: ${d.name}`,
    `บริษัท / องค์กร: ${d.company || "-"}`,
    `อีเมล: ${d.email}`,
    `โทรศัพท์: ${d.phone}`,
    `หัวข้อที่สนใจ: ${d.topic || "-"}`,
    "รายละเอียด:",
    d.message || "-",
  ].join("\n");
}

function formatEmailHtml(d: ContactSubmission, nowTh: string) {
  return `
    <h2>คำขอใบเสนอราคาใหม่จากเว็บไซต์</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      <tr><td><b>วันที่/เวลา</b></td><td>${escapeHtml(nowTh)}</td></tr>
      <tr><td><b>ชื่อ-นามสกุล</b></td><td>${escapeHtml(d.name)}</td></tr>
      <tr><td><b>บริษัท / องค์กร</b></td><td>${escapeHtml(d.company || "-")}</td></tr>
      <tr><td><b>อีเมล</b></td><td>${escapeHtml(d.email)}</td></tr>
      <tr><td><b>โทรศัพท์</b></td><td>${escapeHtml(d.phone)}</td></tr>
      <tr><td><b>หัวข้อที่สนใจ</b></td><td>${escapeHtml(d.topic || "-")}</td></tr>
      <tr><td valign="top"><b>รายละเอียด</b></td><td><pre style="white-space:pre-wrap;margin:0;font-family:inherit">${escapeHtml(d.message || "-")}</pre></td></tr>
    </table>
  `;
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const d = parsed.data;

        // 1. Insert into Supabase FIRST, so we never lose data.
        const { error: dbError } = await supabaseAdmin.from("contact_submissions").insert([
          {
            name: d.name,
            company: d.company,
            email: d.email,
            phone: d.phone,
            topic: d.topic,
            message: d.message,
          },
        ]);

        if (dbError) {
          console.error("Supabase insert error:", dbError);
          // If the table doesn't exist, this will fail. We log it and continue.
        }

        const nowTh = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

        // 2. Send email if Resend is configured.
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.warn("RESEND_API_KEY is not set. Skipping email notification.");
        } else {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: "Matrix Intertrade <noreply@matrixintertrade.com>",
              to: [TO_EMAIL, "nattee.pao@gmail.com"],
              reply_to: d.email,
              subject: `[คำขอใบเสนอราคา] ${d.name}${d.topic ? " - " + d.topic : ""}`,
              html: formatEmailHtml(d, nowTh),
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error("Resend error:", res.status, errText);
            return Response.json({ error: "Failed to send email" }, { status: 502 });
          }
        }

        // 3. Push notification to LINE group.
        const lineSettings = await loadLineSettings();
        const lineChannelAccessToken = lineSettings.lineChannelAccessToken;
        const lineGroupId = lineSettings.lineGroupId;

        if (!lineChannelAccessToken || !lineGroupId) {
          const missing = [
            ...(!lineChannelAccessToken ? [LINE_CHANNEL_ACCESS_TOKEN_KEY] : []),
            ...(!lineGroupId ? [LINE_GROUP_ID_KEY] : []),
          ];
          console.error(`Missing LINE setting(s): ${missing.join(", ")}`);
          return Response.json({ ok: true, warning: "LINE notification skipped", missing });
        }

        const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lineChannelAccessToken}`,
          },
          body: JSON.stringify({
            to: lineGroupId,
            messages: [{ type: "text", text: formatLineQuoteMessage(d, nowTh) }],
          }),
        });

        if (!lineRes.ok) {
          const errText = await lineRes.text();
          console.error("LINE push error:", lineRes.status, errText);
          return Response.json({
            ok: true,
            warning: "LINE notification failed",
            lineStatus: lineRes.status,
          });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
