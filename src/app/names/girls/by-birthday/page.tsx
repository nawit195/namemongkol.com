import { NamesCategoryPage, categoryMetadata } from '@/components/names/NamesCategoryPage';
export const revalidate = 600;
export const metadata = categoryMetadata('girls', 'by-birthday');
export default function Page() { return <NamesCategoryPage gender="girls" mode="by-birthday"/>; }
