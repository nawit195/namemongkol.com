import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, t } from "@/components/i18n/LanguageProvider";
import { fbqTrack } from "@/lib/meta-pixel";

export function ContactForm() {
  const { lang } = useLanguage();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      company: String(fd.get("company") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      topic: String(fd.get("topic") || ""),
      message: String(fd.get("message") || ""),
    };
    setLoading(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("send failed");
      setDone(true);
      // Fire Meta Pixel Lead event on successful quote request submission
      fbqTrack("Lead");
      toast.success(
        t(
          lang,
          "ส่งคำขอเรียบร้อย ทีมงานจะติดต่อกลับโดยเร็ว",
          "Request sent. Our team will contact you shortly.",
        ),
      );
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast.error(
        t(
          lang,
          "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
          "Failed to send request. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="relative rounded-2xl border border-border bg-card shadow-elev p-8 md:p-10 space-y-6 overflow-hidden"
      onSubmit={onSubmit}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-gold to-brand-red" />

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary">
          {t(lang, "ส่งคำขอใบเสนอราคา", "Request a Quote")}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t(
            lang,
            "กรอกข้อมูลของคุณ เพื่อให้เราติดต่อกลับโดยเร็วที่สุด",
            "Fill out the form below and we will get back to you shortly.",
          )}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={t(lang, "ชื่อ-นามสกุล *", "Full Name *")} htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            placeholder={t(lang, "คุณ...", "Your Name...")}
            className="h-11 rounded-xl bg-card border-border/60 focus:ring-brand-red/20 focus:border-brand-red transition-all"
          />
        </Field>
        <Field label={t(lang, "บริษัท / องค์กร", "Company / Organization")} htmlFor="company">
          <Input
            id="company"
            name="company"
            placeholder={t(lang, "ชื่อองค์กร", "Company Name")}
            className="h-11 rounded-xl bg-card border-border/60 focus:ring-brand-red/20 focus:border-brand-red transition-all"
          />
        </Field>
        <Field label={t(lang, "อีเมล *", "Email *")} htmlFor="email">
          <Input
            id="email"
            name="email"
            required
            type="email"
            placeholder="you@company.com"
            className="h-11 rounded-xl bg-card border-border/60 focus:ring-brand-red/20 focus:border-brand-red transition-all"
          />
        </Field>
        <Field label={t(lang, "โทรศัพท์ *", "Phone *")} htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            required
            placeholder="0xx-xxx-xxxx"
            className="h-11 rounded-xl bg-card border-border/60 focus:ring-brand-red/20 focus:border-brand-red transition-all"
          />
        </Field>
      </div>
      <Field label={t(lang, "หัวข้อที่สนใจ", "Topic of Interest")} htmlFor="topic">
        <select
          id="topic"
          name="topic"
          className="flex h-11 w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
        >
          <option>LED Display</option>
          <option>Interactive Display</option>
          <option>Projector</option>
          <option>Wireless Presentation</option>
          <option>AV Solutions</option>
          <option>{t(lang, "อื่นๆ", "Others")}</option>
        </select>
      </Field>
      <Field label={t(lang, "รายละเอียดความต้องการ", "Details / Requirements")} htmlFor="message">
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder={t(
            lang,
            "กรุณาระบุขนาดพื้นที่ จำนวน และรายละเอียดงาน...",
            "Please specify room size, quantity, and other details...",
          )}
          className="rounded-xl bg-card border-border/60 focus:ring-brand-red/20 focus:border-brand-red transition-all resize-none"
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#901a1e] to-brand-red text-white hover:opacity-95 shadow-md group overflow-hidden relative border-none"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t(lang, "กำลังส่ง...", "Sending...")}
          </>
        ) : done ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" /> {t(lang, "ส่งคำขอเรียบร้อย", "Request Sent")}
          </>
        ) : (
          <>
            <span className="relative z-10 flex items-center gap-2">
              <Send className="h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
              {t(lang, "ส่งคำขอใบเสนอราคา", "Request a Quote")}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </>
        )}
      </Button>

      <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground bg-muted/40 py-2.5 rounded-lg border border-border/40">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
        {t(lang, "ทีมงานจะติดต่อกลับภายใน 1 วันทำการ", "Our team will reply within 1 business day")}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-foreground/80">
        {label}
      </Label>
      {children}
    </div>
  );
}
