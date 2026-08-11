from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

from pythainlp.transliterate import pronunciate


EXPECTED_HEADERS = ["ชื่อมงคล", "คำอ่าน", "ความหมาย"]
THAI_MARKS = "\u0e31\u0e34-\u0e3a\u0e47-\u0e4e"
STRUCTURAL_RULES = {
    "invalid_vowel_sequence": re.compile(f"ะ[{THAI_MARKS}]"),
    "detached_leading_vowel": re.compile(r"(^|-)[เแโใไ]-"),
    "detached_thai_mark": re.compile(f"(^|-)[{THAI_MARKS}]"),
    "dangling_separator": re.compile(r"(^-|-$|--+)"),
    "unsupported_character": re.compile(r"[^ก-๙-]"),
}

# W2P cannot resolve these uncommon spellings. Keep overrides explicit so they
# remain auditable instead of silently patching model output.
PRONUNCIATION_OVERRIDES = {
    "มนนัทธ์": "มน-นัด",
    "ใฮธิน": "ไฮ-ทิน",
}


def normalize(value: str) -> str:
    return unicodedata.normalize("NFC", value.strip())


def pronunciation_issues(value: str) -> list[str]:
    if not value:
        return ["blank"]
    return [name for name, pattern in STRUCTURAL_RULES.items() if pattern.search(value)]


def letter_length(value: str) -> int:
    return len(re.sub(f"[{THAI_MARKS}]", "", value))


def segment_compound(name: str, lexicon: set[str]) -> list[str]:
    """Split a compound only when every part is another known name/root."""
    candidates: list[list[str]] = []

    def visit(offset: int, parts: list[str]) -> None:
        if len(parts) > 4:
            return
        if offset == len(name):
            if len(parts) >= 2:
                candidates.append(parts)
            return
        for end in range(offset + 1, len(name) + 1):
            part = name[offset:end]
            if part == name or part not in lexicon or letter_length(part) < 2:
                continue
            if re.match(f"^[{THAI_MARKS}]", part):
                continue
            visit(end, [*parts, part])

    visit(0, [])
    if not candidates:
        return [name]
    return min(
        candidates,
        key=lambda parts: (len(parts), -min(letter_length(part) for part in parts), -sum(letter_length(part) ** 2 for part in parts)),
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Thai readings for the auspicious-name CSV.")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    parser.add_argument("--review", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    with args.input.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        if reader.fieldnames != EXPECTED_HEADERS:
            raise ValueError(f"CSV headers must be exactly {EXPECTED_HEADERS}; received {reader.fieldnames}")
        rows = list(reader)

    unique_names = {normalize(row["ชื่อมงคล"]) for row in rows}
    root_lexicon = {name for name in unique_names if 2 <= letter_length(name) <= 8}
    cache: dict[str, str] = {}
    segments_by_name: dict[str, list[str]] = {}
    token_cache: dict[str, str] = {}
    generated_rows: list[dict[str, str]] = []
    changed = 0
    issue_counts: Counter[str] = Counter()
    issue_samples: list[dict[str, object]] = []
    category_counts: Counter[str] = Counter()

    for row_number, row in enumerate(rows, start=2):
        name = normalize(row["ชื่อมงคล"])
        meaning = normalize(row["ความหมาย"])
        previous = normalize(row["คำอ่าน"])
        if not name or not meaning:
            raise ValueError(f"Row {row_number} has a blank name or meaning")

        if name not in cache:
            parts = segment_compound(name, root_lexicon)
            segments_by_name[name] = parts
            readings = []
            for part in parts:
                if part not in token_cache:
                    token_cache[part] = normalize(pronunciate(part, engine="w2p"))
                readings.append(token_cache[part])
            cache[name] = PRONUNCIATION_OVERRIDES.get(name) or "-".join(readings)
        reading = cache[name]
        issues = pronunciation_issues(reading)
        for issue in issues:
            issue_counts[issue] += 1
        if issues and len(issue_samples) < 30:
            issue_samples.append({"row": row_number, "name": name, "pronunciation": reading, "issues": issues})
        if reading != previous:
            changed += 1
        category_counts[name[0]] += 1
        generated_rows.append({"ชื่อมงคล": name, "คำอ่าน": reading, "ความหมาย": meaning})

    if issue_counts:
        raise ValueError(f"Generated readings failed structural validation: {dict(issue_counts)}; samples={issue_samples}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8-sig", newline="") as target:
        writer = csv.DictWriter(target, fieldnames=EXPECTED_HEADERS, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(generated_rows)

    duplicate_rows = len(generated_rows) - len(cache)
    original_by_name = {}
    for row in rows:
        original_by_name[normalize(row["ชื่อมงคล"])] = normalize(row["คำอ่าน"])
    review_records = []
    for name in sorted(cache):
        reading = cache[name]
        parts = segments_by_name[name]
        if name == "มนนัทธ์":
            confidence, source, note = "high", "editorial-override", "ตรวจเทียบแหล่งคำอ่านชื่อไทย: มน-นัด"
        elif name == "ใฮธิน":
            confidence, source, note = "low", "editorial-review-required", "ชื่อประดิษฐ์ผิดรูปมาตรฐาน ควรยืนยันเสียงอ่านกับผู้ตั้งชื่อ"
        elif original_by_name[name] == reading:
            confidence, source, note = "high", "csv+pythainlp-consensus", "คำอ่านเดิมตรงกับ Thai W2P"
        elif len(parts) >= 2:
            confidence, source = "high", "pythainlp-segmented-known-roots"
            note = "แยกรากจากชื่อที่มีในฐาน: " + " + ".join(parts)
        else:
            confidence, source, note = "medium", "pythainlp-w2p-draft", "คำอ่านจาก Thai W2P รอตรวจชื่อเฉพาะโดยผู้ดูแล"
        review_records.append({
            "name": name,
            "pronunciation": reading,
            "confidence": confidence,
            "source": source,
            "note": note,
        })
    confidence_counts = Counter(record["confidence"] for record in review_records)
    report = {
        "sourceRows": len(rows),
        "uniqueNames": len(cache),
        "duplicateRows": duplicate_rows,
        "changedReadings": changed,
        "unchangedReadings": len(rows) - changed,
        "structuralIssues": dict(issue_counts),
        "confidence": dict(confidence_counts),
        "categoryCounts": dict(sorted(category_counts.items())),
        "samples": generated_rows[:20],
        "engine": "PyThaiNLP w2p",
        "compoundSegmentation": "Known-name longest segmentation (2-4 roots, 2-8 Thai letters per root)",
        "overrides": PRONUNCIATION_OVERRIDES,
        "note": "Proper names can have owner-defined readings; generated readings follow the Thai W2P model and still benefit from editorial review.",
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.review:
        args.review.parent.mkdir(parents=True, exist_ok=True)
        args.review.write_text(json.dumps(review_records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=True))


if __name__ == "__main__":
    main()
