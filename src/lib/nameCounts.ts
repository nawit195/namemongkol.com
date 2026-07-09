export function formatThaiCount(value: number | null | undefined) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return null;
    }

    return value.toLocaleString('th-TH');
}

export function getLiveNameCountLabel(value: number | null | undefined, fallback = 'อัปเดตจากฐานข้อมูล') {
    const formatted = formatThaiCount(value);
    return formatted ? `${formatted} ชื่อ` : fallback;
}

export function countRawNameLines(rawData: string) {
    return new Set(
        rawData
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith('//')),
    ).size;
}
