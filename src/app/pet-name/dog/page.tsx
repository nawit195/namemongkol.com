import type { Metadata } from 'next';
import { getPublicPetNames } from '@/lib/petNames';
import { siteUrl } from '@/lib/seo';
import { getPetCategoryCopy, PetNameCategoryPage } from '../PetNameCategoryPage';

const copy = getPetCategoryCopy('dog');

export const revalidate = 600;

export const metadata: Metadata = {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `${siteUrl}/pet-name/dog` },
    openGraph: { title: copy.title, description: copy.description, url: `${siteUrl}/pet-name/dog`, siteName: 'NameMongkol', locale: 'th_TH', type: 'website' },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description },
};

export default async function DogNamePage() {
    return <PetNameCategoryPage category="dog" names={await getPublicPetNames()} />;
}
