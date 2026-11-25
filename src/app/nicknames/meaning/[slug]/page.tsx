import React from 'react';
import { notFound } from 'next/navigation';
import { getNicknameCollection, nicknameCollectionMetadata } from '@/lib/nicknameCollections';
import NicknameCollectionPage from '../../NicknameCollectionPage';

export const revalidate = 600;
export const dynamicParams = false;
export function generateStaticParams() { return [{ slug: 'light' }, { slug: 'happiness' }]; }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const collection = getNicknameCollection(`meaning/${slug}`);
    if (!collection) notFound();
    return nicknameCollectionMetadata(collection);
}
export default async function Page({ params }: Props) {
    const { slug } = await params;
    return <NicknameCollectionPage collectionKey={`meaning/${slug}`} />;
}
