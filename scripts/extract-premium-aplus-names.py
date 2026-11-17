"""Read only sheet A+; run with bundled Python (openpyxl). Never modifies Excel."""
import sys, json, hashlib, unicodedata
from pathlib import Path
import openpyxl

source, output = map(Path, sys.argv[1:3])
workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
sheet = workbook['A+']
headers = [c.value for c in sheet[1]]
required = ['รายชื่อ', 'คำอ่าน', 'ความหมาย', 'ชื่อภาษาอังกฤษ']
assert all(headers.count(label) == 1 for label in required), 'Unexpected or ambiguous headers'
columns = {label: headers.index(label) for label in required}
def clean(value):
    return unicodedata.normalize('NFC', str(value or '')).translate(dict.fromkeys(map(ord, '\u200b\u200c\u200d\ufeff'))).strip()
records, corrections, duplicates, invalid_fields = [], [], [], []
by_name = {}
for row, values in enumerate(sheet.iter_rows(min_row=2, values_only=True), 2):
    if not values[columns['รายชื่อ']]:
        continue
    name, pronunciation, meaning, english = (clean(values[columns[label]]) for label in required)
    key = ''.join(name.split())
    if name == 'ขันธ์' and english == 'ขันธ์':
        corrections.append({'row': row, 'from': english, 'to': '', 'reason': 'Thai text in English column'})
        english = ''
    if english and not all(ord(c) < 128 for c in english):
        invalid_fields.append({'row': row, 'name': name, 'field': 'englishName', 'value': english})
        english = ''
    item = dict(row=row, name=name, pronunciation=pronunciation, meaning=meaning, englishName=english)
    if key in by_name:
        previous = by_name[key]
        conflicts = [field for field in ['pronunciation', 'meaning', 'englishName'] if previous[field] and item[field] and previous[field] != item[field]]
        duplicates.append({'row': row, 'firstRow': previous['row'], 'name': name, 'conflictingFields': conflicts})
        for field in ['pronunciation', 'meaning', 'englishName']:
            if field in conflicts:
                previous[field] = ''
                previous.setdefault('conflictingFields', []).append(field)
            elif field not in previous.get('conflictingFields', []) and not previous[field]:
                previous[field] = item[field]
        continue
    by_name[key] = item
    records.append(item)
last_row = max([item['row'] for item in records] + [item['row'] for item in duplicates], default=1)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({'sourceFile': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'sheet': 'A+', 'range': f'A1:{openpyxl.utils.get_column_letter(sheet.max_column)}{last_row}', 'corrections': corrections, 'duplicates': duplicates, 'invalidFields': invalid_fields, 'records': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'records': len(records), 'duplicateRows': len(duplicates), 'conflictingDuplicates': sum(bool(x['conflictingFields']) for x in duplicates), 'invalidFields': len(invalid_fields), 'corrections': len(corrections), 'lastRow': last_row}))
