"""Import the supplied nickname workbook using Python's standard library only.

Usage: python scripts/import-auspicious-nicknames.py path/to/workbook.xlsx
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
DAYS = {
    "อาทิตย์": "sunday", "จันทร์": "monday", "อังคาร": "tuesday",
    "พุธ(กลางวัน)": "wednesday", "พุธ(กลางคืน)": "wednesday_night",
    "พฤหัสบดี": "thursday", "ศุกร์": "friday", "เสาร์": "saturday",
}
GENDERS = {"ชาย": "male", "หญิง": "female", "ชาย/หญิง": "unisex"}


def import_workbook(path):
    records = {}
    source_rows = 0
    with zipfile.ZipFile(path) as archive:
        strings = ["".join(item.itertext()) for item in ET.fromstring(
            archive.read("xl/sharedStrings.xml")).findall("s:si", NS)]
        relationships = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(
            archive.read("xl/_rels/workbook.xml.rels"))}
        sheets = ET.fromstring(archive.read("xl/workbook.xml")).findall("s:sheets/s:sheet", NS)
        for sheet in sheets:
            target = relationships[sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
            target = target.lstrip("/") if target.startswith("/") else "xl/" + target
            for row in ET.fromstring(archive.read(target)).findall("s:sheetData/s:row", NS):
                if row.attrib["r"] == "1":
                    continue
                values = {}
                for cell in row.findall("s:c", NS):
                    value = cell.find("s:v", NS)
                    if value is not None:
                        value = strings[int(value.text)] if cell.attrib.get("t") == "s" else value.text
                        values[re.sub(r"\d", "", cell.attrib["r"])] = value.strip()
                if not values.get("A"):
                    continue
                source_rows += 1
                name = unicodedata.normalize("NFC", values["A"])
                grade = values["B"]
                if grade not in ("A+", "A", "B") or (grade == "A+") != (sheet.attrib["name"] == "A+"):
                    raise ValueError(f"Unexpected grade at {sheet.attrib['name']}:{row.attrib['r']}")
                pair_text = values.get("E", "")
                pairs = re.findall(r"(\d{2})([🟢🟠])", pair_text)
                if re.sub(r"\d{2}[🟢🟠]|[\s-]", "", pair_text):
                    raise ValueError(f"Unknown pair status for {name}")
                record = {
                    "id": "nn_" + hashlib.sha256(name.encode("utf-8")).hexdigest()[:20],
                    "name": name, "grade": grade, "numerology": int(values["C"]),
                    "suitableDays": [DAYS[d.strip()] for d in values["D"].split(",")],
                    "pairs": [{"number": number, "status": "green" if status == "🟢" else "orange"}
                              for number, status in pairs],
                    "meaning": values["F"], "gender": GENDERS[values["G"]],
                }
                if name in records and records[name] != record:
                    raise ValueError(f"Conflicting duplicate: {name}")
                records[name] = record
    ordered = sorted(records.values(), key=lambda record: record["id"])
    digest = hashlib.sha256(json.dumps(ordered, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()[:12]
    return {"version": "nicknames-" + digest, "sourceFile": path.name,
            "sourceRows": source_rows, "duplicatesRemoved": source_rows - len(ordered), "records": ordered}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "src/data/auspiciousNicknames.json")
    parser.add_argument("--private-output", type=Path, default=Path(__file__).resolve().parents[1] / ".local/nicknames-import/aplus.json")
    args = parser.parse_args()
    catalog = import_workbook(args.workbook)
    full = catalog["records"]
    catalog["summary"] = {"total": len(full), "aPlus": sum(r["grade"] == "A+" for r in full), "ab": sum(r["grade"] != "A+" for r in full), "a": sum(r["grade"] == "A" for r in full), "b": sum(r["grade"] == "B" for r in full)}
    private = {"version": catalog["version"], "records": [r for r in full if r["grade"] == "A+"]}
    args.private_output.parent.mkdir(parents=True, exist_ok=True)
    args.private_output.write_text(json.dumps(private, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    catalog["records"] = [r for r in full if r["grade"] != "A+"]
    args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in catalog.items() if key != "records"}, ensure_ascii=False))
    print(f"Imported {len(full)} unique nicknames; {len(catalog['records'])} public records. Paid catalog saved outside source control.")
