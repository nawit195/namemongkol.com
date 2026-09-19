import { startTransition, useEffect, useState } from "react";
import { fallbackSiteContent, loadSiteContent, type SiteContent } from "@/lib/content/site";

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(fallbackSiteContent);

  useEffect(() => {
    let isCurrent = true;

    loadSiteContent().then((nextContent) => {
      if (!isCurrent) return;
      startTransition(() => setContent(nextContent));
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  return content;
}
