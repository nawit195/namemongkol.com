import type { AuspiciousNickname } from '@/types/auspiciousNickname';

// Entirely synthetic: paid production records never enter the repository.
export const premiumNicknameFixture: AuspiciousNickname[] = [
    ['ก', 27],
    ['ข', 5],
    ['ค', 2],
    ['ญ', 1],
    ['อ', 3],
].flatMap(([initial, count], group) =>
    Array.from(
        { length: Number(count) },
        (_, index): AuspiciousNickname => ({
            id: `nn_${(group * 100 + index + 1).toString(16).padStart(20, '0')}`,
            name: `${initial}ชื่อทดสอบ${String(index + 1).padStart(2, '0')}`,
            grade: 'A+',
            numerology: index < 2 ? 14 : 24,
            meaning: `ความหมายสำหรับทดสอบ ${initial} ${index + 1}`,
            gender: 'unisex',
            suitableDays:
                index < 2
                    ? ['sunday', 'wednesday', 'thursday', 'friday', 'saturday']
                    : ['monday', 'wednesday_night'],
            pairs: [{ number: '44', status: 'green' }],
        }),
    ),
);
