// Remove only the column explicitly reported as absent. Keep publication/review
// fields that exist, rather than dropping them together with unrelated fields.
const OPTIONAL_COLUMNS = ['english_name_draft', 'english_name_status', 'english_name_source', 'english_name_reading', 'english_name', 'publication_status', 'pronunciation_variants', 'pronunciation_draft', 'pronunciation_status', 'meaning_status', 'pronunciation'];
export function missingNameColumn(error: { message: string; code?: string; details?: string }, excluded: readonly string[]) {
    const message = `${error.message} ${error.details ?? ''}`;
    if (!/does not exist|could not find|not found|schema cache/i.test(message)) return undefined;
    return OPTIONAL_COLUMNS.find(column => !excluded.includes(column) && new RegExp(`\\b${column}\\b`, 'i').test(message));
}
export function nameColumns(columns: string, excluded: readonly string[]) {
    return columns.split(',').map(value => value.trim()).filter(value => !excluded.includes(value)).join(', ');
}
