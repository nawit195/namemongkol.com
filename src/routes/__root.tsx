import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCTABar } from "@/components/layout/MobileCTABar";
import { BackToTop } from "@/components/site/BackToTop";
import { AiSalesChatbot } from "@/components/site/AiSalesChatbot";
import { FloatingSocial } from "@/components/site/FloatingSocial";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { Toaster } from "sonner";
import { getGoogleAnalyticsSettings, getMetaPixelSettings } from "@/lib/runtime-settings.functions";
import { usePageTracking } from "@/hooks/use-page-tracking";

import appCss from "../styles.css?url";

type RootLoaderData = {
  googleAnalyticsId: string;
  analyticsSource: "runtime" | "env" | "missing";
  metaPixelId: string;
  pixelSource: "runtime" | "env" | "hardcoded" | "missing";
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-20">
      <title>ไม่พบหน้าที่ค้นหา | Matrix Intertrade</title>
      <meta name="robots" content="noindex,nofollow" />
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase text-accent">404 Not Found</p>
        <h1 className="mt-3 text-3xl font-bold text-primary md:text-4xl">ไม่พบหน้าที่คุณค้นหา</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          หน้านี้อาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่แล้ว คุณสามารถกลับไปเลือกดูโซลูชันและสินค้าจากหน้าแรกได้
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="/" className="rounded-md bg-gradient-accent px-5 py-2.5 text-sm font-semibold text-white">
            กลับหน้าแรก
          </a>
          <a href="/contactus" className="rounded-md border border-input px-5 py-2.5 text-sm font-semibold">
            ติดต่อเรา
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">เกิดข้อผิดพลาด</h1>
        <p className="mt-2 text-sm text-muted-foreground">ลองรีโหลดหรือกลับสู่หน้าแรก</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-gradient-accent px-4 py-2 text-sm font-medium text-white"
          >
            ลองอีกครั้ง
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm font-medium">
            หน้าแรก
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async (): Promise<RootLoaderData> => {
    const [gaSettings, pixelSettings] = await Promise.all([
      getGoogleAnalyticsSettings(),
      getMetaPixelSettings(),
    ]);
    return {
      googleAnalyticsId: gaSettings.googleAnalyticsId,
      analyticsSource: gaSettings.source,
      metaPixelId: pixelSettings.metaPixelId,
      pixelSource: pixelSettings.source,
    };
  },
  head: ({ loaderData }: { loaderData?: RootLoaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "ตัวแทน AV Solutions ครบวงจรในประเทศไทย — ออกแบบ ติดตั้ง และดูแลระบบภาพ-เสียงระดับองค์กร",
      },
      { property: "og:site_name", content: "Matrix Intertrade" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=Schibsted+Grotesk:wght@400;500;600;700;800;900&display=swap",
      },
    ],
    scripts: [
      // ─── Meta (Facebook) Pixel base code ────────────────────────────────────
      ...(loaderData?.metaPixelId
        ? [
            {
              children: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${loaderData.metaPixelId}');
fbq('track','PageView');`,
            },
          ]
        : []),
      // ─── Google Analytics ────────────────────────────────────────────────────
      ...(loaderData?.googleAnalyticsId
        ? [
            {
              async: true,
              src: `https://www.googletagmanager.com/gtag/js?id=${loaderData.googleAnalyticsId}`,
            },
            {
              children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${loaderData.googleAnalyticsId}');`,
            },
          ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Auto-fire PageView on every SPA route change (initial load is covered by base code)
  usePageTracking();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 xl:pb-0">
              <Outlet />
            </main>
            <Footer />
            <MobileCTABar />
            <BackToTop />
            <AiSalesChatbot />
            <FloatingSocial />
            <Toaster position="top-center" richColors />
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
