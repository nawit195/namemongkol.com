import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { makeUniqueSlug, slugifySeoKeyword } from "@/lib/seo-slugs";

const SlugSuggestSchema = z.object({
  kind: z.enum(["products", "articles", "projects"]),
  sourceText: z.string().trim().min(1).max(400),
  context: z
    .object({
      brand: z.string().optional(),
      category: z.string().optional(),
      productId: z.string().optional(),
      articleId: z.union([z.string(), z.number()]).optional(),
      urlKeyword: z.string().optional(),
    })
    .optional()
    .default({}),
  existingSlugs: z.array(z.string().max(220)).max(2000).optional().default([]),
});

type SlugSuggestInput = z.infer<typeof SlugSuggestSchema>;

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

function fallbackPhrase(input: SlugSuggestInput) {
  const keyword = input.context.urlKeyword?.trim();
  if (keyword) return keyword;

  if (input.kind === "products") {
    const productId = input.context.productId?.trim() || "product";
    const brand = input.context.brand?.trim() || "matrix";
    const sourceSlug = slugifySeoKeyword(input.sourceText, "");
    return sourceSlug ? `${brand} ${input.sourceText}` : `${brand} product ${productId}`;
  }

  if (input.kind === "projects") {
    const category = input.context.category?.trim() || "project";
    const sourceSlug = slugifySeoKeyword(input.sourceText, "");
    return sourceSlug ? input.sourceText : `${category} project`;
  }

  const articleId = String(input.context.articleId ?? "").trim() || "article";
  const category = input.context.category?.trim() || "article";
  const sourceSlug = slugifySeoKeyword(input.sourceText, "");
  return sourceSlug ? input.sourceText : `${category} guide ${articleId}`;
}

function parseOpenAIJson(value: string) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const jsonText = fenced ?? trimmed;

  try {
    const parsed = JSON.parse(jsonText) as { englishTitle?: unknown; slugBase?: unknown };
    return {
      englishTitle: typeof parsed.englishTitle === "string" ? parsed.englishTitle.trim() : "",
      slugBase: typeof parsed.slugBase === "string" ? parsed.slugBase.trim() : "",
    };
  } catch {
    return { englishTitle: trimmed, slugBase: trimmed };
  }
}

async function suggestWithGoogleTranslate(sourceText: string) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=t&q=${encodeURIComponent(sourceText)}`,
    );
    if (res.ok) {
      const data = await res.json();
      const translatedText = data?.[0]?.[0]?.[0];
      if (typeof translatedText === "string" && translatedText.trim()) {
        return translatedText.trim();
      }
    }
  } catch (e) {
    console.warn("Google Translate fallback failed", e);
  }
  return null;
}

async function suggestWithOpenAI(input: SlugSuggestInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 160,
      messages: [
        {
          role: "system",
          content: [
            "You generate concise English SEO URL slug source text for a Thai B2B AV website.",
            "Translate Thai titles to natural English keywords.",
            "Remove brand fluff and generic filler, but keep product model names, AV terms, sizes, and brand names.",
            "Return only compact JSON with keys englishTitle and slugBase.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            kind: input.kind,
            sourceText: input.sourceText,
            context: input.context,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("OpenAI slug suggestion error:", response.status, await response.text());
    return null;
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) return null;

  const parsed = parseOpenAIJson(content);
  const phrase = parsed.slugBase || parsed.englishTitle;
  if (!phrase) return null;

  return {
    englishTitle: parsed.englishTitle || phrase,
    slug: makeUniqueSlug(
      phrase,
      input.existingSlugs,
      input.kind === "products" ? "product" : input.kind === "projects" ? "project" : "article",
    ),
  };
}

export const Route = createFileRoute("/api/admin/slug-suggest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = await requireAdmin(request);
        if ("response" in admin) return admin.response;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON body", 400);
        }

        const parsed = SlugSuggestSchema.safeParse(body);
        if (!parsed.success) {
          return jsonError("Invalid slug suggestion payload", 400, parsed.error.flatten());
        }

        const input = parsed.data;
        const openAISuggestion = await suggestWithOpenAI(input);
        if (openAISuggestion) {
          return Response.json({ ...openAISuggestion, source: "openai" });
        }

        const translated = await suggestWithGoogleTranslate(input.sourceText);
        const phrase = translated || fallbackPhrase(input);

        return Response.json({
          englishTitle: translated ? phrase : slugifySeoKeyword(phrase, phrase),
          slug: makeUniqueSlug(
            phrase,
            input.existingSlugs,
            input.kind === "products"
              ? "product"
              : input.kind === "projects"
                ? "project"
                : "article",
          ),
          source: "local-fallback",
        });
      },
    },
  },
});
