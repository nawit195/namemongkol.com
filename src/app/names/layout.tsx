import type { ReactNode } from 'react';
import { NamingProvider } from '@/components/names/NamingProvider';
export default function NamesLayout({ children }: { children: ReactNode }) { return <NamingProvider>{children}</NamingProvider>; }
