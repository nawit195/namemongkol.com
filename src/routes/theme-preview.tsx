import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Star,
  Heart,
  Bell,
  Search,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/theme-preview")({
  head: () => ({
    meta: [
      { title: "Theme Preview — Contrast Checker" },
      { name: "description", content: "ตรวจสอบสี ไอคอน และข้อความในโหมด Light / Dark" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ThemePreviewPage,
});

const tokens: { name: string; bg: string; fg: string }[] = [
  { name: "background / foreground", bg: "bg-background", fg: "text-foreground" },
  { name: "card / card-foreground", bg: "bg-card", fg: "text-card-foreground" },
  { name: "muted / muted-foreground", bg: "bg-muted", fg: "text-muted-foreground" },
  { name: "primary / primary-foreground", bg: "bg-primary", fg: "text-primary-foreground" },
  { name: "secondary / secondary-foreground", bg: "bg-secondary", fg: "text-secondary-foreground" },
  { name: "accent / accent-foreground", bg: "bg-accent", fg: "text-accent-foreground" },
  {
    name: "destructive / destructive-foreground",
    bg: "bg-destructive",
    fg: "text-destructive-foreground",
  },
  { name: "popover / popover-foreground", bg: "bg-popover", fg: "text-popover-foreground" },
];

const swatchIcons = [
  Star,
  Heart,
  Bell,
  Search,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Check,
  ArrowRight,
];

function ThemePreviewPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Contrast QA
            </div>
            <h1 className="text-lg font-bold">Theme Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              ← กลับหน้าแรก
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:px-6">
        {/* Tokens */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Design Tokens</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tokens.map((t) => (
              <div
                key={t.name}
                className={`${t.bg} ${t.fg} rounded-xl border border-border p-4 shadow-sm`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {t.name}
                </div>
                <div className="mt-2 text-base font-semibold">Aa — ทดสอบ ก ข ค ง</div>
                <div className="mt-1 text-xs opacity-80">
                  The quick brown fox jumps over the lazy dog 0123456789
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-xl font-bold">Typography</h2>
          <div className="space-y-2">
            <p className="text-4xl font-black tracking-tight">Heading 1 — หัวข้อใหญ่</p>
            <p className="text-3xl font-bold">Heading 2 — หัวข้อรอง</p>
            <p className="text-2xl font-semibold">Heading 3 — หัวข้อย่อย</p>
            <p className="text-base">
              Body — ข้อความปกติ เนื้อหาทั่วไปในเว็บไซต์ Matrix Intertrade
            </p>
            <p className="text-sm text-muted-foreground">Muted — ข้อความรอง / คำอธิบายเพิ่มเติม</p>
            <p className="text-xs text-muted-foreground/70">
              Tiny — ข้อความเล็กสุด เช่น caption / meta
            </p>
            <p>
              <a className="text-accent underline underline-offset-4 hover:opacity-80" href="#">
                Inline link — ลิงก์ภายในข้อความ
              </a>
            </p>
          </div>
        </section>

        {/* Buttons */}
        <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-xl font-bold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button className="bg-accent text-accent-foreground hover:opacity-90">Accent</Button>
          </div>
        </section>

        {/* Icons */}
        <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-xl font-bold">Icons</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SwatchRow
              label="on background"
              boxClass="bg-background border-border"
              iconClass="text-foreground"
            />
            <SwatchRow
              label="on card"
              boxClass="bg-card border-border"
              iconClass="text-card-foreground"
            />
            <SwatchRow
              label="on muted"
              boxClass="bg-muted border-border"
              iconClass="text-muted-foreground"
            />
            <SwatchRow
              label="on primary"
              boxClass="bg-primary border-transparent"
              iconClass="text-primary-foreground"
            />
            <SwatchRow
              label="on accent"
              boxClass="bg-accent border-transparent"
              iconClass="text-accent-foreground"
            />
            <SwatchRow
              label="on destructive"
              boxClass="bg-destructive border-transparent"
              iconClass="text-destructive-foreground"
            />
          </div>
        </section>

        {/* Status / Alerts */}
        <section className="rounded-2xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="mb-4 text-xl font-bold">Status</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Alert
              icon={CheckCircle2}
              className="border-green-500/30 bg-green-500/10 text-foreground"
              iconClass="text-green-500"
              title="Success"
              body="บันทึกข้อมูลเรียบร้อยแล้ว"
            />
            <Alert
              icon={Info}
              className="border-sky-500/30 bg-sky-500/10 text-foreground"
              iconClass="text-sky-500"
              title="Info"
              body="ข้อมูลเพิ่มเติมสำหรับผู้ใช้งาน"
            />
            <Alert
              icon={AlertTriangle}
              className="border-amber-500/30 bg-amber-500/10 text-foreground"
              iconClass="text-amber-500"
              title="Warning"
              body="กรุณาตรวจสอบก่อนยืนยัน"
            />
            <Alert
              icon={XCircle}
              className="border-destructive/30 bg-destructive/10 text-foreground"
              iconClass="text-destructive"
              title="Error"
              body="เกิดข้อผิดพลาด กรุณาลองใหม่"
            />
          </div>
        </section>

        {/* Brand surfaces */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Brand Surfaces</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-navy p-6 text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                bg-navy
              </div>
              <p className="mt-2 text-lg font-bold">หัวข้อบนพื้นน้ำเงินเข้ม</p>
              <p className="text-sm text-white/80">ข้อความรองพร้อมไอคอน</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {swatchIcons.slice(0, 8).map((I, i) => (
                  <I key={i} className="h-5 w-5 text-white" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-accent p-6 text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                bg-gradient-accent
              </div>
              <p className="mt-2 text-lg font-bold">หัวข้อบนแอ็คเซนต์</p>
              <p className="text-sm text-white/85">ข้อความรองพร้อมไอคอน</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {swatchIcons.slice(0, 8).map((I, i) => (
                  <I key={i} className="h-5 w-5 text-white" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <p className="pt-4 text-center text-xs text-muted-foreground">
          เคล็ดลับ: บุ๊กมาร์กหน้านี้ไว้ใช้ตรวจ contrast บนทุก deploy — กดปุ่ม Theme
          ขวาบนเพื่อสลับโหมด
        </p>
      </div>
    </main>
  );
}

function SwatchRow({
  label,
  boxClass,
  iconClass,
}: {
  label: string;
  boxClass: string;
  iconClass: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${boxClass}`}>
      <div
        className={`mb-3 text-[10px] font-bold uppercase tracking-wider opacity-70 ${iconClass}`}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {swatchIcons.map((I, i) => (
          <I key={i} className={`h-5 w-5 ${iconClass}`} />
        ))}
      </div>
    </div>
  );
}

function Alert({
  icon: Icon,
  title,
  body,
  className,
  iconClass,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  className: string;
  iconClass: string;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${className}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-sm opacity-80">{body}</div>
      </div>
    </div>
  );
}
