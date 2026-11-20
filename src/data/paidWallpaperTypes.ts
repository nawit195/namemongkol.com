export type PaidWallpaperCollection = 'horses' | 'finance';

export interface PaidWallpaperProduct {
    id: string;
    name: string;
    preview: string;
    device: 'mobile' | 'desktop';
    width: number;
    height: number;
    bytes: number;
    cost: number;
    description: string;
    auspiciousMeaning: string;
    alt: string;
    downloadFilename: string;
    palette: string;
}
