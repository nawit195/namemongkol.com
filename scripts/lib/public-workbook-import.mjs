import { nameKey } from '../import-filtered-names.mjs';

const allowed = new Set(['name', 'gender', 'pronunciation', 'pronunciation_status', 'meaning', 'meaning_status', 'meaning_source', 'english_name', 'english_name_source']);
const quote = value => `'${String(value).replace(/'/gu, "''")}'`;
const block = body => {
    let delimiter = '$workbook_import_guard$';
    while (body.includes(delimiter)) delimiter = delimiter.slice(0, -1) + 'x$';
    return `DO ${delimiter}\n${body}\n${delimiter};`;
};

/** Stage the whole batch and validate every before-value before any writes. */
export function buildPublicWorkbookImportSql(plan, table = 'auspicious_names') {
    if (!['auspicious_names', 'premium_names'].includes(table)) throw new Error('Invalid import table');
    const seen = new Set();
    const changes = plan.changes.map(change => {
        const key = nameKey(change.name);
        if (!key || seen.has(key)) throw new Error('Duplicate or empty import name');
        seen.add(key);
        if (Object.keys(change.patch).some(column => !allowed.has(column))) throw new Error('Unsupported import column');
        return { key, name: change.name, before: change.before, patch: change.patch };
    });
    if (!changes.length) return 'BEGIN;\nCOMMIT;';
    const newColumns = [...new Set(changes.filter(item => !item.before).flatMap(item => Object.keys(item.patch)))];
    const updatedColumns = [...new Set(changes.filter(item => item.before).flatMap(item => Object.keys(item.patch)))];
    // Avoid repeating the workbook/checksum on thousands of rows in the SQL API body.
    const sources = new Set(changes.flatMap(item => ['meaning_source', 'english_name_source'].flatMap(column => column in item.patch ? [item.patch[column]] : [])));
    const commonSource = sources.size === 1 ? [...sources][0] : undefined;
    const compact = changes.map(item => ({
        ...(item.before ? { before: item.before } : {}),
        patch: Object.fromEntries(Object.entries(item.patch).filter(([column]) => commonSource === undefined || !['meaning_source', 'english_name_source'].includes(column))),
    }));
    const restoredPatch = commonSource === undefined ? 'x.patch' : `x.patch
        || CASE WHEN x.patch ? 'meaning' THEN jsonb_build_object('meaning_source',${quote(commonSource)}) ELSE '{}'::jsonb END
        || CASE WHEN x.patch ? 'english_name' THEN jsonb_build_object('english_name_source',${quote(commonSource)}) ELSE '{}'::jsonb END`;
    const sql = ['BEGIN;', "SET LOCAL lock_timeout = '5s';", `LOCK TABLE public.${table} IN SHARE ROW EXCLUSIVE MODE;`,
        `CREATE TEMP TABLE workbook_import_stage ON COMMIT DROP AS SELECT regexp_replace(normalize(coalesce(x.before->>'name',x.patch->>'name'),NFC),'[\\s​‌‍﻿]+','','g') AS key,x.before,${restoredPatch} AS patch FROM jsonb_to_recordset(${quote(JSON.stringify(compact))}::jsonb) AS x(before jsonb,patch jsonb);`,
        `CREATE TEMP TABLE workbook_import_before ON COMMIT DROP AS SELECT id,regexp_replace(normalize(name,NFC),'[\\s​‌‍﻿]+','','g') AS key,to_jsonb(n) AS value FROM public.${table} n;`,
        'CREATE UNIQUE INDEX ON workbook_import_before (key);',
        block(`BEGIN
    IF (SELECT count(*) FROM workbook_import_stage) <> ${changes.length}
       OR EXISTS(SELECT key FROM workbook_import_stage GROUP BY key HAVING count(*)>1)
       OR EXISTS(SELECT 1 FROM workbook_import_stage s LEFT JOIN workbook_import_before b USING(key)
          WHERE (s.before IS NULL AND b.id IS NOT NULL)
             OR (s.before IS NOT NULL AND (b.id IS NULL OR b.value IS DISTINCT FROM s.before)))
    THEN RAISE EXCEPTION 'Workbook import snapshot changed'; END IF;
END`),
    ];
    if (newColumns.length) sql.push(`INSERT INTO public.${table} (${newColumns.join(',')}) SELECT ${newColumns.map(column => `patch->>${quote(column)}`).join(',')} FROM workbook_import_stage WHERE before IS NULL;`);
    if (updatedColumns.length) sql.push(`UPDATE public.${table} n SET ${updatedColumns.map(column => `${column}=CASE WHEN s.patch ? ${quote(column)} THEN s.patch->>${quote(column)} ELSE n.${column} END`).join(',')} FROM workbook_import_stage s WHERE s.before IS NOT NULL AND n.id::text=s.before->>'id';`);
    sql.push('COMMIT;');
    return sql.join('\n');
}
