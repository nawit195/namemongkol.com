import { NamesCategoryPage, categoryMetadata } from '@/components/names/NamesCategoryPage';
export const revalidate = 600;
export const metadata = categoryMetadata('girls', 'given');
export default function Page() { return <NamesCategoryPage gender="girls" mode="given"/>; }
