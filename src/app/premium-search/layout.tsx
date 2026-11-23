import type { ReactNode } from 'react';
import { NamingProvider } from '@/components/names/NamingProvider';

export default function PremiumSearchLayout({ children }: { children: ReactNode }) {
    return <NamingProvider compact>{children}</NamingProvider>;
}
