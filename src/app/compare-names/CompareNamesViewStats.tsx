'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import styles from './comparison.module.css';

const VIEWED_KEY = 'namemongkol:compare-names:viewed';
let viewTrackingStarted = false;

function getStorageItem(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Privacy modes may disable storage; statistics must not interrupt the page.
  }
}

function getSessionId() {
  const existing = getStorageItem('nm_sid');
  if (existing) return existing;

  const next = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  setStorageItem('nm_sid', next);
  return next;
}

function formatCount(value: number | null) {
  return value === null ? '—' : new Intl.NumberFormat('th-TH').format(value);
}

export function CompareNamesViewStats() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const shouldTrack = !viewTrackingStarted && !getStorageItem(VIEWED_KEY);
    viewTrackingStarted = true;

    async function loadAndTrack() {
      try {
        const response = await fetch('/api/public/compare-names-views');
        if (response.ok) {
          const payload = await response.json() as { count?: number };
          if (mounted && typeof payload.count === 'number') setCount(payload.count);
        }

        if (!shouldTrack) return;

        const trackResponse = await fetch('/api/analytics/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: 'view',
            button_key: 'compare_names.page.view',
            page_path: '/compare-names',
            user_id: null,
            session_id: getSessionId(),
            referrer: document.referrer,
            metadata: {},
          }),
          keepalive: true,
        });

        if (!trackResponse.ok) return;
        setStorageItem(VIEWED_KEY, '1');
        if (mounted) setCount((current) => current === null ? 1 : current + 1);
      } catch {
        // A statistics failure must never interrupt name comparison.
      }
    }

    void loadAndTrack();
    return () => { mounted = false; };
  }, []);

  const label = `เข้าชม ${formatCount(count)} ครั้ง ใน 24 ชม.ล่าสุด`;

  return (
    <span className={styles.viewStats} aria-live="polite" aria-label={label} title={label}>
      <Eye size={13} aria-hidden="true" />
      <span>24 ชม.</span>
      <strong>{formatCount(count)}</strong>
      <span>ครั้ง</span>
    </span>
  );
}
