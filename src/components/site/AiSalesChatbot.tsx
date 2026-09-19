import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ExternalLink, Loader2, MessageCircle, Phone, Send, Sparkles, X } from "lucide-react";

import chatbotCircle from "@/assets/chatbot-circle.png";
import { cn } from "@/lib/utils";

type ChatbotResult = {
  id: string;
  type: "product" | "solution" | "brand" | "article";
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  price?: string;
  href: string;
  cta: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  results?: ChatbotResult[];
  source?: "fallback" | "openai";
};

const quickPrompts = [
  "แนะนำจอ LED สำหรับห้องประชุม",
  "ช่วยเลือก Interactive Display สำหรับโรงเรียน",
  "ขอใบเสนอราคา Persona",
  "มีงบประมาณจำกัด ควรเริ่มจากโซลูชันไหน",
];

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "สวัสดีครับ ผมคือ AI ผู้ช่วยฝ่ายขาย Matrix บอกประเภทงาน ขนาดห้อง หรือสินค้าที่สนใจได้เลย ผมจะช่วยค้นข้อมูลจากเว็บไซต์และคัดตัวเลือกให้ครับ",
};

function ProductResultCard({ item }: { item: ChatbotResult }) {
  return (
    <a
      href={item.href}
      className="group flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-red-200 hover:bg-red-50/40"
    >
      {item.image ? (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <img
            src={item.image}
            alt=""
            className={cn(
              "h-full w-full",
              item.type === "product" ? "object-contain p-1" : "object-cover",
            )}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <MessageCircle className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-950">{item.title}</p>
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{item.subtitle}</p>
        {item.price ? (
          <p className="mt-1 text-xs font-bold text-red-600">{item.price}</p>
        ) : (
          <p className="mt-1 text-xs font-bold text-sky-700">{item.cta}</p>
        )}
      </div>
    </a>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-600 text-white">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn("max-w-[88%] sm:max-w-[82%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-br-md bg-slate-950 text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800",
          )}
        >
          <p className="whitespace-pre-line break-words">{message.text}</p>
        </div>
        {!isUser && message.results?.length ? (
          <div className="mt-2 grid gap-2">
            {message.results.slice(0, 3).map((item) => (
              <ProductResultCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AiSalesChatbot() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  const compactHistory = useMemo(
    () =>
      messages
        .slice(-6)
        .map((message) => `${message.role === "user" ? "Customer" : "Assistant"}: ${message.text}`),
    [messages],
  );

  if (!mounted) return null;

  async function submitMessage(nextMessage = input.trim()) {
    const text = nextMessage.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/public/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: compactHistory }),
      });

      if (!response.ok) throw new Error(`Chatbot failed: ${response.status}`);
      const data = (await response.json()) as {
        answer: string;
        results: ChatbotResult[];
        source: "fallback" | "openai";
      };

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.answer,
          results: data.results,
          source: data.source,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "ขออภัยครับ ระบบแชตกำลังขัดข้องชั่วคราว กดคุยกับฝ่ายขายทาง LINE หรือโทรหาเราได้เลย ทีมงานพร้อมช่วยเลือกสินค้าให้ครับ",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-[4.75rem] left-3 z-50 sm:bottom-20 sm:left-4 xl:bottom-6">
        <button
          type="button"
          aria-label="เปิด AI ผู้ช่วยฝ่ายขาย"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="ai-chatbot-button group relative grid h-10 w-10 place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-red-300 sm:h-12 sm:w-12"
        >
          <span className="ai-chatbot-button__halo" aria-hidden="true" />
          <span className="ai-chatbot-button__pulse" aria-hidden="true" />
          <img
            src={chatbotCircle}
            alt=""
            className="relative h-full w-full rounded-full object-cover"
            draggable={false}
          />
          <span className="ai-chatbot-button__shine" aria-hidden="true" />
          {open ? (
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-slate-950 text-white shadow-sm sm:h-5 sm:w-5">
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </span>
          ) : (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.85)] sm:h-3.5 sm:w-3.5 sm:shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
          )}
        </button>
      </div>

      <section
        role="dialog"
        aria-label="AI ผู้ช่วยฝ่ายขาย Matrix"
        className={cn(
          "fixed z-50 overflow-hidden border border-slate-200 bg-slate-50 shadow-2xl transition-all duration-300",
          "bottom-24 left-3 right-3 max-h-[calc(100dvh-7.5rem)] max-w-[calc(100vw-1.5rem)] rounded-2xl",
          "md:bottom-24 md:left-5 md:right-auto md:h-[min(720px,calc(100dvh-7rem))] md:w-[430px]",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="relative overflow-hidden bg-slate-950 px-4 py-4 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(248,113,113,0.45),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.28),transparent_32%)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-600 shadow-[0_10px_22px_rgba(220,38,38,0.38)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">AI ผู้ช่วยฝ่ายขาย</p>
                  <p className="line-clamp-2 text-xs text-slate-300">
                    ค้นสินค้าและโซลูชันจากเว็บไซต์ Matrix
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="ปิดแชต"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-4">
              {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}

              {messages.length === 1 && (
                <div className="grid gap-2">
                  <p className="text-xs font-bold text-slate-500">ลองถามเรื่องนี้ได้เลย</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => submitMessage(prompt)}
                        className="min-h-10 rounded-full border border-red-100 bg-white px-3 py-2 text-left text-xs font-bold leading-snug text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  กำลังค้นข้อมูลจากเว็บไซต์...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
              <a
                href="/contactus"
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-black leading-snug text-white transition hover:bg-red-700"
              >
                ขอใบเสนอราคา <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://lin.ee/hMrlrvH"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#06C755] px-3 py-2 text-center text-xs font-black leading-snug text-white transition hover:brightness-95"
              >
                คุย LINE <Phone className="h-3.5 w-3.5" />
              </a>
            </div>
            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage();
              }}
            >
              <label className="sr-only" htmlFor="ai-sales-chatbot-input">
                พิมพ์คำถามถึง AI ผู้ช่วยฝ่ายขาย
              </label>
              <textarea
                id="ai-sales-chatbot-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitMessage();
                  }
                }}
                rows={1}
                placeholder="พิมพ์สินค้าหรือหน้างานที่ต้องการ..."
                className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-600 text-white shadow-[0_8px_18px_rgba(220,38,38,0.28)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="ส่งข้อความ"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
              AI อ้างอิงข้อมูลจากเว็บไซต์ หากต้องการราคาสุดท้ายให้ทีมขายยืนยันอีกครั้ง
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
