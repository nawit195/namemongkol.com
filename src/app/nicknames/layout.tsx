import type { ReactNode } from 'react';
import { NamingProvider } from '@/components/names/NamingProvider';

export default function NicknamesLayout({ children }: { children: ReactNode }) {
    return (
        <NamingProvider compact showFavoriteBar={false}>
            {children}
        </NamingProvider>
    );
}
