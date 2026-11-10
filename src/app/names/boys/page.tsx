import { NamesCategoryPage, categoryMetadata } from '@/components/names/NamesCategoryPage';
export const revalidate = 600;
export const metadata = categoryMetadata('boys', 'given');
export default function Page() { return <NamesCategoryPage gender="boys" mode="given"/>; }
