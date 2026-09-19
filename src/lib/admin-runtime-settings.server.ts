import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const LINE_CHANNEL_ACCESS_TOKEN_KEY = "LINE_CHANNEL_ACCESS_TOKEN";
export const LINE_GROUP_ID_KEY = "LINE_GROUP_ID";
export const GOOGLE_ANALYTICS_ID_KEY = "GOOGLE_ANALYTICS_ID";
export const META_PIXEL_ID_KEY = "META_PIXEL_ID";

const ADMIN_RUNTIME_SETTINGS_TABLE = "admin_runtime_settings";

export type RuntimeSettingKey =
  | typeof LINE_CHANNEL_ACCESS_TOKEN_KEY
  | typeof LINE_GROUP_ID_KEY
  | typeof GOOGLE_ANALYTICS_ID_KEY
  | typeof META_PIXEL_ID_KEY
  | (string & {});

export type RuntimeSetting = {
  key: string;
  value: string | null;
  is_secret: boolean;
};

export type LineSettings = {
  lineChannelAccessToken: string;
  lineGroupId: string;
  source: "runtime" | "env" | "mixed" | "missing";
};

export type GoogleAnalyticsSettings = {
  googleAnalyticsId: string;
  source: "runtime" | "env" | "missing";
};

export type MetaPixelSettings = {
  metaPixelId: string;
  source: "runtime" | "env" | "hardcoded" | "missing";
};

export function normalizeGoogleAnalyticsId(value: string) {
  return value.trim().toUpperCase();
}

export function isValidGoogleAnalyticsId(value: string) {
  return /^G-[A-Z0-9]+$/.test(normalizeGoogleAnalyticsId(value));
}

export function maskSecret(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const tail = trimmed.slice(-4);
  return `••••${tail}`;
}

export async function loadRuntimeSettings(keys: RuntimeSettingKey[]) {
  try {
    const { data, error } = await supabaseAdmin
      .from(ADMIN_RUNTIME_SETTINGS_TABLE)
      .select("key,value,is_secret")
      .in("key", keys);

    if (error) throw error;

    return new Map(
      (data ?? []).map((row) => [
        String(row.key),
        {
          key: String(row.key),
          value: typeof row.value === "string" ? row.value : null,
          is_secret: row.is_secret === true,
        },
      ]),
    );
  } catch (error) {
    console.warn("[settings] Failed to load runtime settings; falling back to env.", error);
    return new Map<string, RuntimeSetting>();
  }
}

export async function saveRuntimeSettings(settings: RuntimeSetting[]) {
  const rows = settings.map((setting) => ({
    key: setting.key,
    value: setting.value,
    is_secret: setting.is_secret,
  }));

  const { error } = await supabaseAdmin
    .from(ADMIN_RUNTIME_SETTINGS_TABLE)
    .upsert(rows, { onConflict: "key" });

  if (error) throw error;
}

export async function loadLineSettings(): Promise<LineSettings> {
  const settings = await loadRuntimeSettings([LINE_CHANNEL_ACCESS_TOKEN_KEY, LINE_GROUP_ID_KEY]);

  const runtimeToken = settings.get(LINE_CHANNEL_ACCESS_TOKEN_KEY)?.value?.trim() ?? "";
  const runtimeGroupId = settings.get(LINE_GROUP_ID_KEY)?.value?.trim() ?? "";
  const envToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() ?? "";
  const envGroupId = process.env.LINE_GROUP_ID?.trim() ?? "";

  const lineChannelAccessToken = runtimeToken || envToken;
  const lineGroupId = runtimeGroupId || envGroupId;

  let source: LineSettings["source"] = "missing";
  if (runtimeToken && runtimeGroupId) source = "runtime";
  else if (!runtimeToken && !runtimeGroupId && envToken && envGroupId) source = "env";
  else if (lineChannelAccessToken || lineGroupId) source = "mixed";

  return {
    lineChannelAccessToken,
    lineGroupId,
    source,
  };
}

export async function loadGoogleAnalyticsSettings(): Promise<GoogleAnalyticsSettings> {
  const settings = await loadRuntimeSettings([GOOGLE_ANALYTICS_ID_KEY]);

  const runtimeId = normalizeGoogleAnalyticsId(settings.get(GOOGLE_ANALYTICS_ID_KEY)?.value ?? "");
  const envId = normalizeGoogleAnalyticsId(process.env.GOOGLE_ANALYTICS_ID ?? "");

  const googleAnalyticsId = runtimeId || envId;

  return {
    googleAnalyticsId,
    source: runtimeId ? "runtime" : envId ? "env" : "missing",
  };
}

/** Validate that a Meta Pixel ID is a 10–20 digit numeric string. */
export function isValidMetaPixelId(value: string): boolean {
  return /^\d{10,20}$/.test(value.trim());
}

export function normalizeMetaPixelId(value: string): string {
  return value.trim();
}

export async function loadMetaPixelSettings(): Promise<MetaPixelSettings> {
  const { DEFAULT_META_PIXEL_ID } = await import("@/lib/meta-pixel");

  const settings = await loadRuntimeSettings([META_PIXEL_ID_KEY]);

  const runtimeId = normalizeMetaPixelId(settings.get(META_PIXEL_ID_KEY)?.value ?? "");
  const envId = normalizeMetaPixelId(process.env.META_PIXEL_ID ?? "");

  const metaPixelId = runtimeId || envId || DEFAULT_META_PIXEL_ID;

  return {
    metaPixelId,
    source: runtimeId
      ? "runtime"
      : envId
        ? "env"
        : DEFAULT_META_PIXEL_ID
          ? "hardcoded"
          : "missing",
  };
}
