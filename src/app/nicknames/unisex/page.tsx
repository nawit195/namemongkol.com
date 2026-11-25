import React from 'react';
import { getNicknameCollection, nicknameCollectionMetadata } from '@/lib/nicknameCollections';
import NicknameCollectionPage from '../NicknameCollectionPage';

export const revalidate = 600;
export const metadata = nicknameCollectionMetadata(getNicknameCollection('unisex')!);
export default function Page() { return <NicknameCollectionPage collectionKey="unisex" />; }
