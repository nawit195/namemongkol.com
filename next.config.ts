import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import withBundleAnalyzer from '@next/bundle-analyzer';

// Derive Supabase host at build time so Next/Image allows the correct domain in each env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const remotePatterns: RemotePattern[] = [
  // Supabase storage public URLs
  ...(supabaseHost ? [{ protocol: 'https' as const, hostname: supabaseHost }] : []),
  // Legacy CDN bucket
  {
    protocol: 'https',
    hostname: 'img5.pic.in.th',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    // Let Next/Vercel serve responsive image variants for mobile LCP and below-the-fold media.
    // Components can still opt out per image when an external source should be served directly.
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],  // avif first for ~30% smaller payloads on mobile
    minimumCacheTTL: 2592000,          // Cache 30 days — prevents re-transformation on every request
    qualities: [50, 75],                   // Keep variants tight to reduce image transformation/cache usage
    deviceSizes: [640, 750, 1080, 1920],  // Reduced set — covers mobile to desktop efficiently
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'canvas-confetti', 'date-fns', 'sweetalert2'],
  },
  async redirects() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayRedirects = days.map((day) => ({
      source: '/wallpapers',
      has: [{ type: 'query' as const, key: 'day', value: day }],
      destination: `/wallpapers/day/${day}`,
      permanent: true,
    }));
    const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const zodiacRedirects = zodiacSigns.map((sign) => ({
      source: '/wallpapers',
      has: [{ type: 'query' as const, key: 'zodiac', value: sign }],
      destination: `/wallpapers/zodiac/${sign}`,
      permanent: true,
    }));
    return [
      {
        source: '/names/girls/by-birthday/monday',
        destination: '/articles/monday-girl-names-2569-no-sara',
        permanent: true,
      },
      {
        source: '/articles/100-auspicious-boy-names-2569',
        destination: '/articles/naming-tips-2026-year-of-horse',
        permanent: true,
      },
      {
        source: '/articles/auspicious-boy-names-2569',
        destination: '/articles/naming-tips-2026-year-of-horse',
        permanent: true,
      },
      {
        source: '/articles/check-kalakini-letters-7-days',
        destination: '/articles/forbidden-letters-kalakini',
        permanent: true,
      },
      {
        source: '/articles/lucky-names-by-birthday-2569',
        destination: '/articles/auspicious-names-by-birthday-2026',
        permanent: true,
      },
      {
        source: '/articles/700-auspicious-names-by-birthday-2569',
        destination: '/articles/auspicious-names-by-birthday-2026',
        permanent: true,
      },
      {
        source: '/articles/lucky-colors-by-day',
        destination: '/articles/auspicious-colors-2569-guide',
        permanent: true,
      },
      {
        source: '/articles/numerology-guide',
        destination: '/articles/numerology-0-9-power-guide',
        permanent: true,
      },
      ...dayRedirects,
      ...zodiacRedirects,
      {
        source: '/wallpapers',
        has: [{ type: 'query' as const, key: 'tab', value: 'custom' }],
        destination: '/wallpapers/custom',
        permanent: true,
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);
