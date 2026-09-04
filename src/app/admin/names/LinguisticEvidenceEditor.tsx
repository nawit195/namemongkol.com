'use client';

export type EvidenceValue = {
    roots?: string[];
    sources?: Array<{ title: string; url: string }>;
    note?: string;
    method?: string;
};

export default function LinguisticEvidenceEditor({ value, onChange }: {
    value: EvidenceValue | null;
    onChange: (value: EvidenceValue) => void;
}) {
    const evidence = value ?? {};
    const firstSource = evidence.sources?.[0] ?? { title: '', url: '' };
    const inputClass = 'min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20';
    return (
        <div className="mt-3 grid gap-2 border-t border-slate-800 pt-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-400">
                รากศัพท์ (คั่นด้วยจุลภาค)
                <input
                    value={(evidence.roots ?? []).join(', ')}
                    onChange={(event) => onChange({ ...evidence, roots: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
                    className={`${inputClass} mt-1`}
                />
            </label>
            <label className="text-xs font-semibold text-slate-400">
                ชื่อแหล่งอ้างอิง
                <input value={firstSource.title} onChange={(event) => onChange({ ...evidence, sources: [{ ...firstSource, title: event.target.value }] })} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs font-semibold text-slate-400 sm:col-span-2">
                URL แหล่งอ้างอิง
                <input value={firstSource.url} onChange={(event) => onChange({ ...evidence, sources: [{ ...firstSource, url: event.target.value }] })} placeholder="https://dictionary.orst.go.th/" className={`${inputClass} mt-1`} />
            </label>
        </div>
    );
}
