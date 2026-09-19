const fs = require("fs");
let pdTs = fs.readFileSync("src/data/product-details.ts", "utf8");
const lines = pdTs.split("\n");

for (let i = 0; i < lines.length; i++) {
  if (
    lines[i].trim().endsWith('",') &&
    !lines[i].includes("descriptionHtml") &&
    !lines[i].includes('": {')
  ) {
    // If a line ends with ", but the string didn't start on this line (it's part of a multiline string),
    // wait, descriptionText starts with `descriptionText:\n "....`
    // It's a multiline string using `"`? No, TS doesn't support multiline strings with `"` unless there's a `\` at the end.
    // The previous view_file showed:
    // 1341:     descriptionText:
    // 1342:       "PORTS1 RS... PRODUCT DIMENSIONSUS:&nbsp;16.20cm x 2.30cm x 11.43cm (6.38",

    // Ah! It's all on ONE line! The string starts with `"PORTS1...` and ends with `(6.38",`

    // Let's just fix any line that matches a dimension ending in `",`
    lines[i] = lines[i].replace(/\(6\.38",/g, '(6.38\\",');
    lines[i] = lines[i].replace(/\(2\.75",/g, '(2.75\\",');
    lines[i] = lines[i].replace(/\(3\.39",/g, '(3.39\\",');
    lines[i] = lines[i].replace(/\(7\.48",/g, '(7.48\\",');
    lines[i] = lines[i].replace(/\(8\.46",/g, '(8.46\\",');
    lines[i] = lines[i].replace(/\(5\.65",/g, '(5.65\\",');
    lines[i] = lines[i].replace(/\(1\.02",/g, '(1.02\\",');
    lines[i] = lines[i].replace(/\(1\.54",/g, '(1.54\\",');
    lines[i] = lines[i].replace(/\(1\.37",/g, '(1.37\\",');
    lines[i] = lines[i].replace(/\(4\.72",/g, '(4.72\\",');
    lines[i] = lines[i].replace(/\(8\.35",/g, '(8.35\\",');
    lines[i] = lines[i].replace(/\(2\.44",/g, '(2.44\\",');
    lines[i] = lines[i].replace(/\(4\.21",/g, '(4.21\\",');
    lines[i] = lines[i].replace(/\(1\.06",/g, '(1.06\\",');
    lines[i] = lines[i].replace(/\(8\.43",/g, '(8.43\\",');
    lines[i] = lines[i].replace(/\(1\.70",/g, '(1.70\\",');
    lines[i] = lines[i].replace(/\(1\.7",/g, '(1.7\\",');

    // Better yet, just use a regex to fix ANY unescaped quote at the end of the line before a comma:
    // If the line starts with spaces, followed by a double quote, and ends with a double quote and comma,
    // but contains OTHER double quotes in the middle, they need escaping.
    // However, the error is specifically that the closing quote is NOT the end of the string, it's just an unescaped quote, and the comma is parsed as being outside the string!
    // Let's just fix it by replacing ALL lines that have `",` at the end where it should be `\",` or closing quote.
    // Wait, `descriptionText: "....",` is VALID. The problem is `descriptionText: "..... (6.38",`. This is missing the actual closing quote of the string!
    // So the scraper did: `descriptionText: "..... (6.38",` because it was `..... (6.38"` in the DB, and the scraper did `descriptionText: "${db_value}",` without escaping!
    // So `db_value` ends with `"`. Thus `"${db_value}",` becomes `"..... (6.38"",` ?? No, it becomes `"..... (6.38",`. Wait. If `db_value` was `..... (6.38`, then it would be `"..... (6.38",`. That IS a valid string!
    // Let's look at the error again.
    // `src/data/product-details.ts(1351,3): error TS1109: Expression expected.`
  }
}

// Actually, let's just use JSON.stringify to see what the scraper did.
// The easiest fix is to replace ANY `",\n` with `",\n`? No.
// Let's run a regex:
pdTs = pdTs.replace(/(\(\d+\.\d+)",/g, '$1\\"",');
pdTs = pdTs.replace(/DIMENSIONS19",/g, 'DIMENSIONS19\\"",');
fs.writeFileSync("src/data/product-details.ts", pdTs);
console.log("Fixed quotes");
