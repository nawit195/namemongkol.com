'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { NameSuggestion } from '@/lib/nameSuggestions';
import { scheduleNameSuggestions, type SuggestionSearchState } from '@/lib/nameSuggestionSearch';
import styles from './comparison.module.css';

type Props = {
  value: string;
  number: number;
  error?: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
};

export function NameInput({ value, number, error, onChange, onRemove }: Props) {
  const id = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [response, setResponse] = useState<SuggestionSearchState | null>(null);
  const query = value.trim();
  const current = response?.query === query ? response : null;
  const suggestions = current?.status === 'ready' ? current.data : [];
  const showPopup = open && query.length >= 2;

  useEffect(() => {
    if (active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  useEffect(() => {
    if (!open || query.length < 2) return;
    return scheduleNameSuggestions(query, state => {
      setResponse(state);
      if (state.status === 'loading') setActive(-1);
    });
  }, [open, query]);

  function choose(item: NameSuggestion) {
    onChange(item.name);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div className={styles.nameField} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <div className={styles.labelRow}>
        <label htmlFor={id}>ชื่อที่ {number}</label>
        {onRemove && <button type="button" className={styles.remove} onClick={onRemove} aria-label={`ลบชื่อที่ ${number}`}><X size={16} aria-hidden="true" /></button>}
      </div>
      <div className={styles.searchInput}>
        <Search size={18} aria-hidden="true" />
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPopup}
          aria-controls={`${id}-list`}
          aria-activedescendant={showPopup && active >= 0 && active < suggestions.length ? `${id}-option-${active}` : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          maxLength={100}
          value={value}
          placeholder="ค้นหาหรือพิมพ์ชื่อ"
          onFocus={() => setOpen(true)}
          onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); }}
          onKeyDown={event => {
            if (event.key === 'Escape') { setOpen(false); setActive(-1); return; }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              if (suggestions.length) setActive(index => event.key === 'ArrowDown' ? (index + 1) % suggestions.length : (index <= 0 ? suggestions.length - 1 : index - 1));
            }
            if (event.key === 'Enter' && showPopup && suggestions[active]) {
              event.preventDefault();
              choose(suggestions[active]);
            }
          }}
        />
      </div>
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
      {showPopup && (
        <div className={styles.popup}>
          <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label={`ชื่อแนะนำสำหรับชื่อที่ ${number}`}>
            {suggestions.map((item, index) => (
              <li key={item.name} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
                onPointerDown={event => event.preventDefault()} onClick={() => choose(item)}
                className={active === index ? styles.activeOption : undefined}>
                <span className={styles.optionName}>{item.name}</span>
                {item.pronunciation && <span className={styles.optionReading}>{item.pronunciation}{item.pronunciationStatus && item.pronunciationStatus !== 'approved' ? ' · รอยืนยันคำอ่าน' : ''}</span>}
                {item.meaning && <span className={styles.optionMeaning}>{item.meaning}{item.meaningStatus && item.meaningStatus !== 'approved' ? ' · อยู่ระหว่างตรวจรากศัพท์' : ''}</span>}
              </li>
            ))}
          </ul>
          <p role="status" className={styles.searchStatus}>
            {!current || current.status === 'loading' ? 'กำลังค้นหาชื่อ…' : current.status === 'error' ? 'ค้นหาไม่ได้ในขณะนี้ ใช้ชื่อที่พิมพ์เองได้เลย' : !suggestions.length ? 'ไม่พบในฐานข้อมูล ใช้ชื่อที่พิมพ์เองได้เลย' : 'เลือกชื่อ หรือใช้ชื่อที่พิมพ์เอง'}
          </p>
        </div>
      )}
    </div>
  );
}
