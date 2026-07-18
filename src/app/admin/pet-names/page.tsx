'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Database, FileJson, PawPrint, Plus, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import type { PetNameLanguage, PetNameRecord } from '@/types/petName';

const EMPTY_RECORD: PetNameRecord = {
    slug: '', nameTh: '', nameEn: '', pronunciation: '', meaning: '', language: 'thai',
    petTypes: ['dog', 'cat'], genders: ['neutral'], traits: [], styles: [], intents: [],
    syllables: 2, initial: '', meaningScore: 85, pronunciationScore: 85, distinctivenessScore: 80, isActive: true,
};

function splitList(value: string) {
    return value.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
}

function parseImport(text: string): PetNameRecord[] {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) return JSON.parse(trimmed) as PetNameRecord[];

    return trimmed.split(/\r?\n/).slice(1).map((line) => {
        const columns = line.split(',').map((item) => item.trim());
        return {
            slug: columns[0], nameTh: columns[1], nameEn: columns[2] ?? '', pronunciation: columns[3], meaning: columns[4],
            language: (columns[5] || 'thai') as PetNameLanguage,
            petTypes: splitList(columns[6] || 'dog|cat') as PetNameRecord['petTypes'],
            genders: splitList(columns[7] || 'neutral') as PetNameRecord['genders'],
            traits: splitList(columns[8] || ''), styles: splitList(columns[9] || ''), intents: splitList(columns[10] || ''),
            syllables: Number(columns[11] || 2), initial: columns[12] || columns[1]?.charAt(0) || '',
            meaningScore: Number(columns[13] || 85), pronunciationScore: Number(columns[14] || 85),
            distinctivenessScore: Number(columns[15] || 80), isActive: columns[16] !== 'false',
        };
    }).filter((record) => record.slug && record.nameTh);
}

function RecordEditor({ value, onChange, onSave, onClose, saving }: { value: PetNameRecord; onChange: (value: PetNameRecord) => void; onSave: () => void; onClose: () => void; saving: boolean }) {
    const update = <Key extends keyof PetNameRecord>(key: Key, next: PetNameRecord[Key]) => onChange({ ...value, [key]: next });
    const inputClass = 'mt-1.5 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20';
    return (
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-100">{value.id ? `แก้ไข ${value.nameTh}` : 'เพิ่มชื่อใหม่'}</h2><button onClick={onClose} aria-label="ปิดตัวแก้ไข" className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800"><X /></button></div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-300">Slug<input className={inputClass} value={value.slug} onChange={(event) => update('slug', event.target.value)} /></label>
                <label className="text-sm text-slate-300">ชื่อไทย<input className={inputClass} value={value.nameTh} onChange={(event) => update('nameTh', event.target.value)} /></label>
                <label className="text-sm text-slate-300">ชื่ออังกฤษ<input className={inputClass} value={value.nameEn} onChange={(event) => update('nameEn', event.target.value)} /></label>
                <label className="text-sm text-slate-300">คำอ่าน<input className={inputClass} value={value.pronunciation} onChange={(event) => update('pronunciation', event.target.value)} /></label>
                <label className="text-sm text-slate-300">ภาษา<select className={inputClass} value={value.language} onChange={(event) => update('language', event.target.value as PetNameLanguage)}>{['thai', 'english', 'japanese', 'korean', 'international'].map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="text-sm text-slate-300">จำนวนพยางค์<input className={inputClass} type="number" min={1} max={5} value={value.syllables} onChange={(event) => update('syllables', Number(event.target.value))} /></label>
                <label className="text-sm text-slate-300 md:col-span-3">ความหมาย<textarea className={`${inputClass} min-h-24 py-3`} value={value.meaning} onChange={(event) => update('meaning', event.target.value)} /></label>
                <label className="text-sm text-slate-300">ประเภทสัตว์ (คั่นด้วย |)<input className={inputClass} value={value.petTypes.join('|')} onChange={(event) => update('petTypes', splitList(event.target.value) as PetNameRecord['petTypes'])} /></label>
                <label className="text-sm text-slate-300">เพศ (คั่นด้วย |)<input className={inputClass} value={value.genders.join('|')} onChange={(event) => update('genders', splitList(event.target.value) as PetNameRecord['genders'])} /></label>
                <label className="text-sm text-slate-300">อักษรขึ้นต้น<input className={inputClass} value={value.initial} maxLength={2} onChange={(event) => update('initial', event.target.value)} /></label>
                <label className="text-sm text-slate-300">คาแรกเตอร์<input className={inputClass} value={value.traits.join('|')} onChange={(event) => update('traits', splitList(event.target.value))} /></label>
                <label className="text-sm text-slate-300">สไตล์<input className={inputClass} value={value.styles.join('|')} onChange={(event) => update('styles', splitList(event.target.value))} /></label>
                <label className="text-sm text-slate-300">เป้าหมายความหมาย<input className={inputClass} value={value.intents.join('|')} onChange={(event) => update('intents', splitList(event.target.value))} /></label>
                {([['meaningScore', 'คะแนนความหมาย'], ['pronunciationScore', 'คะแนนการออกเสียง'], ['distinctivenessScore', 'คะแนนความโดดเด่น']] as const).map(([key, label]) => <label key={key} className="text-sm text-slate-300">{label}<input className={inputClass} type="number" min={0} max={100} value={value[key]} onChange={(event) => update(key, Number(event.target.value))} /></label>)}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={value.isActive} onChange={(event) => update('isActive', event.target.checked)} /> เผยแพร่</label><button disabled={saving} onClick={onSave} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 disabled:opacity-50"><Save className="h-4 w-4" />บันทึก</button></div>
        </section>
    );
}

export default function AdminPetNamesPage() {
    const [names, setNames] = useState<PetNameRecord[]>([]);
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState<PetNameRecord | null>(null);
    const [importText, setImportText] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [seedCount, setSeedCount] = useState(0);

    const loadNames = useCallback(async () => {
        setLoading(true);
        const response = await fetch('/api/admin/pet-names', { cache: 'no-store' });
        const data = await response.json() as { success: boolean; names?: PetNameRecord[]; seedCount?: number; error?: string };
        if (data.success) {
            setNames(data.names ?? []);
            setSeedCount(data.seedCount ?? 0);
        } else setMessage(data.error ?? 'โหลดข้อมูลไม่สำเร็จ');
        setLoading(false);
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void loadNames(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadNames]);
    const filtered = useMemo(() => names.filter((name) => `${name.nameTh}${name.nameEn}${name.meaning}`.toLowerCase().includes(query.toLowerCase())), [names, query]);

    const send = async (method: string, body: unknown) => {
        setSaving(true); setMessage('');
        const response = await fetch('/api/admin/pet-names', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json() as { success: boolean; error?: string; saved?: number };
        setSaving(false);
        if (!data.success) { setMessage(data.error ?? 'บันทึกไม่สำเร็จ'); return false; }
        setMessage(data.saved ? `บันทึก ${data.saved} รายการแล้ว` : 'บันทึกเรียบร้อย');
        await loadNames();
        return true;
    };

    const saveEditing = async () => {
        if (!editing) return;
        const success = editing.id ? await send('PATCH', { id: editing.id, record: editing }) : await send('POST', { records: [editing] });
        if (success) setEditing(null);
    };

    const importRecords = async () => {
        try {
            const records = parseImport(importText);
            if (!records.length) { setMessage('ไม่พบข้อมูลสำหรับนำเข้า'); return; }
            if (await send('POST', { records })) setImportText('');
        } catch { setMessage('รูปแบบ JSON/CSV ไม่ถูกต้อง'); }
    };

    const remove = async (record: PetNameRecord) => {
        if (!record.id || !window.confirm(`ลบชื่อ ${record.nameTh} ใช่หรือไม่?`)) return;
        await send('DELETE', { id: record.id });
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
            <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-emerald-400">PET NAME DATABASE</p><h1 className="mt-1 text-2xl font-bold text-slate-100 sm:text-3xl">จัดการชื่อสัตว์เลี้ยงมงคล</h1><p className="mt-2 text-sm text-slate-400">ข้อมูลที่เผยแพร่จะอัปเดตในหน้า public หลัง cache ถูกล้าง</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setEditing({ ...EMPTY_RECORD })} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-slate-950"><Plus className="h-4 w-4" />เพิ่มชื่อ</button><button disabled={saving} onClick={() => send('POST', { action: 'seed' })} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-500/50 px-4 text-sm font-bold text-amber-300"><Database className="h-4 w-4" />โหลด {seedCount ? seedCount.toLocaleString('th-TH') : '—'} ชื่อตั้งต้น</button><button onClick={loadNames} aria-label="รีเฟรชข้อมูล" className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 text-slate-300"><RefreshCw className="h-4 w-4" /></button></div></header>

            {message ? <div role="status" className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">{message}</div> : null}
            {editing ? <RecordEditor value={editing} onChange={setEditing} onSave={saveEditing} onClose={() => setEditing(null)} saving={saving} /> : null}

            <section className="rounded-xl border border-slate-700 bg-slate-900 p-5"><div className="flex items-center gap-2 text-slate-100"><FileJson className="h-5 w-5 text-amber-400" /><h2 className="font-bold">นำเข้า JSON หรือ CSV</h2></div><p className="mt-2 text-xs leading-6 text-slate-400">CSV header: slug,nameTh,nameEn,pronunciation,meaning,language,petTypes,genders,traits,styles,intents,syllables,initial,meaningScore,pronunciationScore,distinctivenessScore,isActive โดยข้อมูลหลายค่าใช้ | คั่น</p><textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder='วาง JSON array หรือ CSV ที่นี่' className="mt-4 min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-emerald-400 focus:outline-none" /><button disabled={saving || !importText.trim()} onClick={importRecords} className="mt-3 min-h-11 rounded-lg bg-slate-700 px-4 text-sm font-bold text-slate-100 disabled:opacity-50">ตรวจสอบและนำเข้า</button></section>

            <section className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 p-4"><div className="flex items-center gap-2"><PawPrint className="h-5 w-5 text-emerald-400" /><strong className="text-slate-100">ทั้งหมด {names.length.toLocaleString('th-TH')} ชื่อ</strong></div><label className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อหรือความหมาย" className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none" /></label></div>
                {loading ? <div className="p-10 text-center text-slate-400">กำลังโหลดข้อมูล...</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-950/60 text-xs text-slate-400"><tr><th className="px-4 py-3">ชื่อ</th><th className="px-4 py-3">ภาษา</th><th className="px-4 py-3">ประเภท</th><th className="px-4 py-3">คะแนน</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead><tbody className="divide-y divide-slate-800">{filtered.map((record) => <tr key={record.id ?? record.slug} className="text-slate-300 hover:bg-slate-800/40"><td className="px-4 py-3"><strong className="text-slate-100">{record.nameTh}</strong><span className="ml-2 text-xs text-slate-500">{record.nameEn}</span></td><td className="px-4 py-3">{record.language}</td><td className="px-4 py-3">{record.petTypes.join(', ')}</td><td className="px-4 py-3 font-mono">{record.meaningScore}/{record.pronunciationScore}/{record.distinctivenessScore}</td><td className="px-4 py-3"><button disabled={!record.id} onClick={() => record.id && send('PATCH', { id: record.id, record: { ...record, isActive: !record.isActive } })} className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{record.isActive ? 'เผยแพร่' : 'ปิด'}</button></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => setEditing(record)} className="min-h-9 rounded-lg border border-slate-700 px-3 text-xs font-bold hover:border-emerald-400">แก้ไข</button><button onClick={() => remove(record)} aria-label={`ลบ ${record.nameTh}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-rose-400 hover:border-rose-400"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
            </section>
        </div>
    );
}
