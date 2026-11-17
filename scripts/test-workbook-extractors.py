"""Local fixture test for both read-only extractors; requires openpyxl."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
import openpyxl

with tempfile.TemporaryDirectory(prefix='namemongkol-extract-test-') as directory:
    source = Path(directory) / 'fixture.xlsx'
    workbook = openpyxl.Workbook()
    workbook.remove(workbook.active)
    for label in ['A-B', 'A+']:
        sheet = workbook.create_sheet(label)
        sheet.append([None, 'รายชื่อ', 'เกรด', 'ผลรวมชื่อ', 'วันที่ใช้ได้', 'วิเคราะห์คู่เลข', 'คำอ่าน', 'ความหมาย', 'ชื่อภาษาอังกฤษ'])
        sheet.append([None, ' กานต์\u200b ', 'A+', 19, None, None, 'กาน', 'ที่รัก', 'KANT'])
        sheet.append([None, 'กานต์', 'A+', 19, None, None, 'กาน', 'ที่รัก', 'KANT'])
        sheet.append([123, None, None, None, None, None, None, None, None])
        sheet.append([None, 'ขวัญ', 'A+', 15, None, None, 'ขวัน', 'มิ่งมงคล', 'ภาษาไทย'])
    workbook.save(source)
    workbook.close()
    for script in ['scripts/extract-filtered-names.py', 'scripts/extract-premium-aplus-names.py']:
        output = Path(directory) / (Path(script).stem + '.json')
        subprocess.run([sys.executable, '-X', 'utf8', script, str(source), str(output)], check=True, capture_output=True)
        result = json.loads(output.read_text(encoding='utf-8'))
        assert len(result['records']) == 2
        assert len(result['duplicates']) == 1
        assert len(result['invalidFields']) == 1
        assert result['records'][0]['name'] == 'กานต์'
        assert result['records'][1]['englishName'] == ''
print('PASS: both extractors handle reordered headers, duplicate/blank names, invisible characters and invalid English')
