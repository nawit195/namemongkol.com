import { describe, expect, it } from 'vitest';
import {
  consumePremiumSurnamePrefill,
  savePremiumSurnamePrefill,
} from './premiumAnalysisPrefill';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('premium analysis surname prefill', () => {
  it('trims and collapses whitespace before saving', () => {
    const storage = new MemoryStorage();

    savePremiumSurnamePrefill(storage, '  ใจดี   มงคล\n ');

    expect(consumePremiumSurnamePrefill(storage)).toBe('ใจดี มงคล');
  });

  it('consumes the saved surname only once', () => {
    const storage = new MemoryStorage();

    savePremiumSurnamePrefill(storage, 'ใจดี');

    expect(consumePremiumSurnamePrefill(storage)).toBe('ใจดี');
    expect(consumePremiumSurnamePrefill(storage)).toBe('');
  });

  it('returns an empty string when no surname was saved', () => {
    expect(consumePremiumSurnamePrefill(new MemoryStorage())).toBe('');
  });

  it('fails safely when storage access throws', () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error('storage unavailable');
      },
      setItem: () => {
        throw new Error('storage unavailable');
      },
      removeItem: () => {
        throw new Error('storage unavailable');
      },
    };

    expect(() => savePremiumSurnamePrefill(unavailableStorage, 'ใจดี')).not.toThrow();
    expect(consumePremiumSurnamePrefill(unavailableStorage)).toBe('');
  });
});
