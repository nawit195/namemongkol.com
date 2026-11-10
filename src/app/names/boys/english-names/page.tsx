import { NamesCategoryPage, categoryMetadata } from '@/components/names/NamesCategoryPage';
export const revalidate = 600;
export const metadata = categoryMetadata('boys', 'english-names');
export default function Page() { return <NamesCategoryPage gender="boys" mode="english-names"/>; }
