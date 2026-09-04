import { premiumInitialThoNames, premiumInitialThoNamesRaw } from './premiumInitialThoNames';
import { premiumInitialChoNames, premiumInitialChoNamesRaw } from './premiumInitialChoNames';
import { premiumNamesRaw } from './premiumNamesRaw';

export const premiumSearchNamesRaw = [premiumNamesRaw, premiumInitialThoNamesRaw, premiumInitialChoNamesRaw].join('\n');
export const premiumSearchNameDetails = [...premiumInitialThoNames, ...premiumInitialChoNames];
