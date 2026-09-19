import { createServerFn } from "@tanstack/react-start";

export const getGoogleAnalyticsSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { isValidGoogleAnalyticsId, loadGoogleAnalyticsSettings } =
    await import("@/lib/admin-runtime-settings.server");
  const settings = await loadGoogleAnalyticsSettings();

  return {
    googleAnalyticsId: isValidGoogleAnalyticsId(settings.googleAnalyticsId)
      ? settings.googleAnalyticsId
      : "",
    source: settings.source,
  };
});

export const getMetaPixelSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { isValidMetaPixelId, loadMetaPixelSettings } =
    await import("@/lib/admin-runtime-settings.server");
  const settings = await loadMetaPixelSettings();

  return {
    metaPixelId: isValidMetaPixelId(settings.metaPixelId) ? settings.metaPixelId : "",
    source: settings.source,
  };
});
