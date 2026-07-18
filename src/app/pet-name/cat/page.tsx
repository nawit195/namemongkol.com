import type { Metadata } from 'next';
import { getPublicPetNames } from '@/lib/petNames';
import { siteUrl } from '@/lib/seo';
import { getPetCategoryCopy, PetNameCategoryPage } from '../PetNameCategoryPage';

const copy = getPetCategoryCopy('cat');

export const revalidate = 600;

export const metadata: Metadata = {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `${siteUrl}/pet-name/cat` },
    openGraph: { title: copy.title, description: copy.description, url: `${siteUrl}/pet-name/cat`, siteName: 'NameMongkol', locale: 'th_TH', type: 'website' },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description },
};

export default async function CatNamePage() {
    return <PetNameCategoryPage category="cat" names={await getPublicPetNames()} />;
}
