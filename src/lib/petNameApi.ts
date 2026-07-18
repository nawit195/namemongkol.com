import { z } from 'zod';

const petNameFiltersSchema = z.object({
    petType: z.enum(['dog', 'cat', 'other', 'all']),
    gender: z.enum(['male', 'female', 'neutral', 'all']),
    traits: z.array(z.string().trim().min(1).max(40)).max(10),
    language: z.enum(['thai', 'english', 'japanese', 'korean', 'international', 'all']),
    style: z.string().trim().min(1).max(40),
    syllables: z.union([z.literal('all'), z.number().int().min(1).max(5)]),
    initial: z.string().trim().max(2),
    excludedLetters: z.string().trim().max(20),
    intents: z.array(z.string().trim().min(1).max(40)).max(10),
});

export const petNameQuerySchema = z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('search'), filters: petNameFiltersSchema }),
    z.object({ mode: z.literal('analysis'), filters: petNameFiltersSchema, name: z.string().trim().min(1).max(100) }),
]);

export const petNameUnlockSchema = z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('search'), filters: petNameFiltersSchema, fingerprint: z.string().min(8).max(100) }),
    z.object({ mode: z.literal('analysis'), filters: petNameFiltersSchema, name: z.string().trim().min(1).max(100), fingerprint: z.string().min(8).max(100) }),
]);

export type PetNameQueryInput = z.infer<typeof petNameQuerySchema>;
export type PetNameUnlockInput = z.infer<typeof petNameUnlockSchema>;
