import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        try {
          const formData = await request.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            return jsonError("No file provided", 400);
          }

          // Ensure bucket exists
          try {
            await supabaseAdmin.storage.createBucket("admin-media", { public: true });
          } catch (e) {
            // Ignore if bucket already exists
          }

          const ext = file.name.split(".").pop() || "png";
          const path = `uploads/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

          const { data, error } = await supabaseAdmin.storage
            .from("admin-media")
            .upload(path, file);

          if (error) {
            console.error("Storage upload error:", error);
            return jsonError("Failed to upload file to storage", 500, error);
          }

          const { data: publicUrlData } = supabaseAdmin.storage
            .from("admin-media")
            .getPublicUrl(path);

          return Response.json({ url: publicUrlData.publicUrl });
        } catch (err) {
          console.error("Upload handler error:", err);
          return jsonError("Internal Server Error", 500, err);
        }
      },
    },
  },
});
