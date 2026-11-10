import { NamesCategoryPage, categoryMetadata } from '@/components/names/NamesCategoryPage';
export const revalidate = 600;
export const metadata = categoryMetadata('girls', 'english-names');
export default function Page() { return <NamesCategoryPage gender="girls" mode="english-names"/>; }
