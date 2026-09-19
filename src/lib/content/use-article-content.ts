import { startTransition, useEffect, useState } from "react";
import { fallbackArticleListContent, loadArticleListContent } from "@/lib/content/articles";

export function useArticleContent() {
  const [content, setContent] = useState(fallbackArticleListContent);

  useEffect(() => {
    let isCurrent = true;

    loadArticleListContent().then((nextContent) => {
      if (!isCurrent) return;
      startTransition(() => setContent(nextContent));
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  return content;
}
