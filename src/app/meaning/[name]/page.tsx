import { notFound } from 'next/navigation';
import { getNameMeaningModel } from '@/lib/nameMeaningCatalog';
import { nameMeaningMetadata } from '@/lib/nameMeaning';
import MeaningDetail from '../MeaningDetail';

export const revalidate = 600;
type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props) {
    const model = await getNameMeaningModel((await params).name);
    if (!model) notFound();
    return nameMeaningMetadata(model);
}

export default async function MeaningPage({ params }: Props) {
    const model = await getNameMeaningModel((await params).name);
    if (!model) notFound();
    return <MeaningDetail model={model} />;
}
