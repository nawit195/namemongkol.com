import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';

export const metadata: Metadata = {
    alternates: {
        canonical: `${siteUrl}/dev-pricing-demo`,
    },
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default function DevPricingDemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}
