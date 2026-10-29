const PREMIUM_SURNAME_PREFILL_KEY = 'namemongkol:premium-analysis:surname';

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const normalizeSurname = (surname: string) => surname.trim().replace(/\s+/g, ' ');

export function savePremiumSurnamePrefill(
  storage: SessionStorageLike,
  surname: string,
): void {
  try {
    const normalizedSurname = normalizeSurname(surname);

    if (!normalizedSurname) {
      storage.removeItem(PREMIUM_SURNAME_PREFILL_KEY);
      return;
    }

    storage.setItem(PREMIUM_SURNAME_PREFILL_KEY, normalizedSurname);
  } catch {
    // Storage can be unavailable in hardened privacy modes. Navigation must still work.
  }
}

export function consumePremiumSurnamePrefill(storage: SessionStorageLike): string {
  try {
    const surname = storage.getItem(PREMIUM_SURNAME_PREFILL_KEY) ?? '';
    storage.removeItem(PREMIUM_SURNAME_PREFILL_KEY);
    return normalizeSurname(surname);
  } catch {
    return '';
  }
}
