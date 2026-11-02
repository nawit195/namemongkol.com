import { premiumSearchNameDetails, premiumSearchNamesRaw } from '@/data/premiumSearchNames';
import {
    mergePremiumNameSources,
    type PremiumNameData,
    type PremiumNameDetailInput,
} from '@/utils/premiumDataParser';

export function buildPremiumNameCatalog(
    remoteDetails: PremiumNameDetailInput[] = [],
): PremiumNameData[] {
    const remoteNamesRaw = remoteDetails.map((detail) => detail.name).join('\n');
    return mergePremiumNameSources(
        remoteNamesRaw,
        premiumSearchNameDetails,
        remoteDetails,
    );
}

export const fallbackPremiumNameCatalog = mergePremiumNameSources(
    premiumSearchNamesRaw,
    premiumSearchNameDetails,
);
