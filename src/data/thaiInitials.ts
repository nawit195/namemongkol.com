export const THAI_NAME_INITIALS = [
    'ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ',
    'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว',
    'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ',
] as const;

export type ThaiNameInitial = typeof THAI_NAME_INITIALS[number];

export function isThaiNameInitial(value: string): value is ThaiNameInitial {
    return (THAI_NAME_INITIALS as readonly string[]).includes(value);
}
