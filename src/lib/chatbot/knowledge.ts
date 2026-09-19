import { articles } from "@/data/articles";
import { brandImages } from "@/data/brand-images";
import { productDetails } from "@/data/product-details";
import { products, type Product } from "@/data/products";
import { brands, solutions } from "@/data/site";
import { solutionImages } from "@/data/solution-images";

import { loadProductListContent } from "@/lib/content/products";
import { loadCompanyProfile, loadSiteContent } from "@/lib/content/site";
import { loadArticleListContent } from "@/lib/content/articles";
import { companyPhoneDisplay, type SiteCompanyProfile } from "@/lib/company-profile";

export type ChatbotResultType = "product" | "solution" | "brand" | "article";

export type ChatbotResult = {
  id: string;
  type: ChatbotResultType;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  price?: string;
  href: string;
  cta: string;
};

export type ChatbotAnswer = {
  answer: string;
  results: ChatbotResult[];
  source: "fallback" | "openai";
};

type KnowledgeRecord = ChatbotResult & {
  searchText: string;
  priority: number;
};

const CONTACT_COPY = "ทีม Matrix ช่วยดูหน้างาน ออกแบบระบบ และจัดใบเสนอราคาให้เหมาะกับงบประมาณได้";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&quot;|&#39;/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value: string, length = 180) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length).trim()}...`;
}

function formatPrice(price: string) {
  const numeric = Number(price.replace(/,/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return "ติดต่อทีมขายเพื่อขอราคา";
  return `฿${numeric.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function productToRecord(product: Product): KnowledgeRecord {
  const detail = productDetails[product.id]?.descriptionText ?? "";
  const price = formatPrice(product.price);
  return {
    id: product.id,
    type: "product",
    title: product.name,
    subtitle: `${product.brand} • ${price}`,
    description: excerpt(detail || `${product.brand} product for AV solution projects.`),
    image: product.image,
    price,
    href: `/product/${product.slug ?? product.id}`,
    cta: "ดูสินค้า",
    priority: 4,
    searchText: normalizeText(
      `${product.name} ${product.brand} ${product.brandSlug} ${product.brandCategoryId} ${price} ${detail}`,
    ),
  };
}

let cachedKnowledge: KnowledgeRecord[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function buildKnowledge(): Promise<KnowledgeRecord[]> {
  if (cachedKnowledge && Date.now() - lastCacheTime < CACHE_TTL) {
    return cachedKnowledge;
  }

  const [productContent, siteContent, articleContent] = await Promise.all([
    loadProductListContent(),
    loadSiteContent(),
    loadArticleListContent(),
  ]);

  const productRecords = productContent.products.map(productToRecord);

  const solutionRecords: KnowledgeRecord[] = siteContent.solutions.map((solution) => ({
    id: solution.slug,
    type: "solution",
    title: solution.title,
    subtitle: "Solution",
    description: solution.desc,
    image: solutionImages[solution.slug],
    href: `/${solution.slug}`,
    cta: "ดูโซลูชัน",
    priority: 3,
    searchText: normalizeText(`${solution.title} ${solution.slug} ${solution.desc}`),
  }));

  const brandRecords: KnowledgeRecord[] = siteContent.brands.map((brand) => ({
    id: brand.slug,
    type: "brand",
    title: brand.name,
    subtitle: brand.category,
    description: brand.desc,
    image: brandImages[brand.slug],
    href: `/brands/${brand.slug}`,
    cta: "ดูแบรนด์",
    priority: 2,
    searchText: normalizeText(`${brand.name} ${brand.slug} ${brand.category} ${brand.desc}`),
  }));

  const articleRecords: KnowledgeRecord[] = articleContent.articles.slice(0, 48).map((article) => ({
    id: String(article.id),
    type: "article",
    title: article.title,
    subtitle: `${article.category} • ${article.readMin} นาที`,
    description: article.excerpt,
    href: `/blog/${article.slug}`,
    cta: "อ่านบทความ",
    priority: 1,
    searchText: normalizeText(`${article.title} ${article.category} ${article.excerpt}`),
  }));

  cachedKnowledge = [...productRecords, ...solutionRecords, ...brandRecords, ...articleRecords];
  lastCacheTime = Date.now();
  return cachedKnowledge;
}

const segmenter =
  typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("th", { granularity: "word" })
    : null;

function tokenize(text: string): string[] {
  if (!text) return [];
  if (segmenter) {
    return Array.from(segmenter.segment(text))
      .filter((s) => s.isWordLike)
      .map((s) => s.segment);
  }
  return text.split(" ").filter(Boolean);
}

function scoreRecord(record: KnowledgeRecord, query: string, terms: string[]) {
  let score = 0;
  const title = normalizeText(record.title);
  const subtitle = normalizeText(record.subtitle);
  const wantsArticle =
    query.includes("บทความ") ||
    query.includes("case") ||
    query.includes("อ่าน") ||
    query.includes("ความรู้");

  if (title.includes(query)) score += 28;
  if (subtitle.includes(query)) score += 12;
  if (record.searchText.includes(query)) score += 10;

  for (const term of terms) {
    if (term.length < 2) continue;
    if (title.includes(term)) score += 14;
    if (subtitle.includes(term)) score += 8;
    if (record.searchText.includes(term)) score += 3;
  }

  if (query.includes("ราคา") || query.includes("งบ") || query.includes("quote")) {
    score += record.type === "product" ? 6 : 0;
  }
  if (query.includes("ห้องประชุม") || query.includes("meeting")) {
    score += /interactive|wireless|projector|kramer|persona|av solutions/i.test(record.searchText)
      ? 8
      : 0;
  }
  if (query.includes("led")) {
    score += /led|unilumin/i.test(record.searchText) ? 12 : 0;
  }
  if (query.includes("แนะนำ") || query.includes("สินค้า") || query.includes("เสนอราคา")) {
    if (record.type === "product") score += 12;
    if (record.type === "solution") score += 8;
  }
  if (record.type === "article" && !wantsArticle) score -= 12;
  if (record.type === "product") score += 6;
  if (record.type === "solution") score += 4;

  return score + record.priority;
}

export async function searchKnowledge(message: string, limit = 5): Promise<ChatbotResult[]> {
  const query = normalizeText(message);
  if (!query) return [];

  const terms = tokenize(query);
  const knowledge = await buildKnowledge();
  return knowledge
    .map((record) => ({ record, score: scoreRecord(record, query, terms) }))
    .filter((item) => item.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ record }) => {
      const { searchText: _searchText, priority: _priority, ...result } = record;
      return result;
    });
}

function buildFallbackAnswer(message: string, results: ChatbotResult[]) {
  if (!results.length) {
    return [
      "ตอนนี้ผมยังไม่พบสินค้าหรือบทความที่ตรงกับคำถามนี้แบบชัดเจนครับ",
      CONTACT_COPY,
      "กดปุ่มขอใบเสนอราคาหรือคุย LINE ได้เลย ทีมขายจะช่วยแนะนำรุ่นที่เหมาะกับหน้างานจริงให้ครับ",
    ].join("\n\n");
  }

  const productCount = results.filter((item) => item.type === "product").length;
  const top = results[0];
  const intro =
    productCount > 0
      ? "จากข้อมูลสินค้าในเว็บ ผมคัดตัวเลือกที่น่าจะเกี่ยวข้องให้ครับ"
      : "จากข้อมูลในเว็บ ผมเจอหัวข้อที่ช่วยเริ่มเลือกโซลูชันได้ครับ";
  const lines = results
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.title} (${item.subtitle})`)
    .join("\n");

  const priceNote =
    top?.price && top.price !== "ติดต่อทีมขายเพื่อขอราคา"
      ? `ตัวเลือกแรกมีราคาอ้างอิง ${top.price}`
      : "หลายรายการต้องให้ทีมขายประเมินราคาให้ตรงกับขนาดงานและเงื่อนไขติดตั้ง";

  return [
    intro,
    lines,
    priceNote,
    "ถ้าบอกประเภทห้อง ขนาดพื้นที่ จำนวนจอ หรือช่วงงบประมาณเพิ่มเติม ผมจะช่วยคัดรุ่นให้แคบลงได้ครับ",
  ].join("\n\n");
}

function buildContext(results: ChatbotResult[]) {
  return results
    .map((item, index) =>
      [
        `#${index + 1}`,
        `type: ${item.type}`,
        `title: ${item.title}`,
        `subtitle: ${item.subtitle}`,
        `price: ${item.price ?? "not provided"}`,
        `description: ${item.description}`,
        `url: ${item.href}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function extractOpenAIText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const direct = (payload as { output_text?: unknown }).output_text;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  const chunks: string[] = [];
  for (const item of output) {
    const content = (item as { content?: unknown })?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      const text = (part as { text?: unknown })?.text;
      if (typeof text === "string") chunks.push(text);
    }
  }
  return chunks.join("").trim() || null;
}

async function askOpenAI(
  message: string,
  history: string[],
  results: ChatbotResult[],
  companyProfile: SiteCompanyProfile,
) {
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
      messages: [
        {
          role: "system",
          content: [
            "You are an expert B2B AV Solutions sales consultant for Matrix Intertrade (matrixintertrade.com).",
            "Your goal is to assist clients, recommend AV products based ONLY on the provided context, and ultimately qualify leads for the sales team.",
            "Answer in polite and professional Thai. Use formal but friendly tone.",
            "Do NOT invent prices, specs, warranty terms, or products not in the context.",
            "If a product price is missing or 0, inform the user to contact sales for a custom project quotation.",
            `Contact info: Tel ${companyPhoneDisplay(companyProfile)}, Email ${companyProfile.publicEmail}`,
            "CRITICAL: Always end your response with ONE follow-up question to qualify the lead (e.g., ask about their room size, number of attendees, specific use case, or budget).",
            "Format nicely with bullet points if listing multiple items or specs.",
          ].join("\n"),
        },
        ...history.map((msg) => ({
          role: msg.startsWith("You:") ? "user" : "assistant",
          content: msg,
        })),
        {
          role: "user",
          content: [
            `Website context:\n${buildContext(results) || "No matching website context."}`,
            `Customer question:\n${message}`,
          ].join("\n\n"),
        },
      ],
      max_tokens: 520,
    }),
  });

  if (!response.ok) {
    console.error("OpenAI chatbot error:", response.status, await response.text());
    return null;
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || extractOpenAIText(payload);
}

export async function answerChatbot(
  message: string,
  history: string[] = [],
): Promise<ChatbotAnswer> {
  const [results, companyProfile] = await Promise.all([
    searchKnowledge(message, 5),
    loadCompanyProfile(),
  ]);
  const fallback = buildFallbackAnswer(message, results);

  try {
    const aiAnswer = await askOpenAI(message, history, results, companyProfile);
    if (aiAnswer) {
      return { answer: aiAnswer, results, source: "openai" };
    }
  } catch (error) {
    console.error("Chatbot AI fallback:", error);
  }

  return { answer: fallback, results, source: "fallback" };
}
