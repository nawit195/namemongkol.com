"""Read only sheet A+; run with bundled Python (openpyxl). Never modifies Excel."""
import sys, json, hashlib, unicodedata
from pathlib import Path
import openpyxl

source, output = map(Path, sys.argv[1:3])
workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
sheet = workbook['A+']
headers = [c.value for c in sheet[1]]
assert headers == ['รายชื่อ', 'เกรด', 'ผลรวมชื่อ', 'วันที่ใช้ได้', 'วิเคราะห์คู่เลข', 'คำอ่าน', 'ความหมาย', 'ชื่อภาษาอังกฤษ']
def clean(value):
    return unicodedata.normalize('NFC', str(value or '')).translate(dict.fromkeys(map(ord, '\u200b\u200c\u200d\ufeff'))).strip()
records, corrections, seen = [], [], set()
for row, values in enumerate(sheet.iter_rows(min_row=2, values_only=True), 2):
    if not values[0]:
        continue
    name, pronunciation, meaning, english = map(clean, [values[0], values[5], values[6], values[7]])
    key = ''.join(name.split())
    assert key not in seen, f'Duplicate name at row {row}'
    seen.add(key)
    if name == 'ขันธ์' and english == 'ขันธ์':
        corrections.append({'row': row, 'from': english, 'to': '', 'reason': 'Thai text in English column'})
        english = ''
    assert not english or all(ord(c) < 128 for c in english), f'Invalid English at row {row}'
    records.append(dict(row=row, name=name, pronunciation=pronunciation, meaning=meaning, englishName=english))
assert len(records) == 531
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({'sourceFile': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'sheet': 'A+', 'corrections': corrections, 'records': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'records': len(records), 'corrections': len(corrections)}))
