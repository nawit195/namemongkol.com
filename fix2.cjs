const fs = require("fs");

// 1. Fix src/lib/content/articles.ts
let articlesTs = fs.readFileSync("src/lib/content/articles.ts", "utf8");
articlesTs = articlesTs.replace(
  /categoriesResult\.data\?\.map\(\(row\) => \(\{/g,
  "categoriesResult.data?.map((row: any) => ({",
);
fs.writeFileSync("src/lib/content/articles.ts", articlesTs);

// 2. Fix src/routes/admin.index.tsx
let adminIndexTsx = fs.readFileSync("src/routes/admin.index.tsx", "utf8");
adminIndexTsx = adminIndexTsx.replace(
  /editor\.commands\.setContent\(value, false, \{ preserveWhitespace: "full" \} as any\)/g,
  "editor.commands.setContent(value, { emitUpdate: false } as any)",
);
fs.writeFileSync("src/routes/admin.index.tsx", adminIndexTsx);

// 3. Fix components
function replaceLink(file, oldRegex, newStr) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(oldRegex, newStr);
  fs.writeFileSync(file, content);
}
replaceLink(
  "src/components/site/BrandCard.tsx",
  /to=\{\`\/brands\/\$\{slug\}\`\}/g,
  'to="/brands/$slug" params={{ slug }}',
);
replaceLink(
  "src/components/site/CTASection.tsx",
  /to="\/category\/0"/g,
  'to="/category/$id" params={{ id: "0" }}',
);
replaceLink(
  "src/components/site/IndustriesShowcase.tsx",
  /to=\{\`\/industry\/\$\{i\.slug\}\`\}/g,
  'to="/industry/$slug" params={{ slug: i.slug }}',
);
replaceLink(
  "src/components/site/SolutionCard.tsx",
  /to=\{\`\/\$\{slug\}\`\}/g,
  "to={`/${slug}` as any}",
);
replaceLink(
  "src/components/site/SolutionSplitPanels.tsx",
  /to=\{\`\/\$\{s\.slug\}\`\}/g,
  "to={`/${s.slug}` as any}",
);

// 4. Fix product-details.ts duplicate keys
let pdTs = fs.readFileSync("src/data/product-details.ts", "utf8");
const lines = pdTs.split("\n");
const fixedLines = [];
let insideDuplicateKey = false;

for (let i = 0; i < lines.length; i++) {
  // If we are at lines 4-28 which contain the duplicates, skip them
  if (i >= 4 && i <= 28) {
    continue;
  }
  fixedLines.push(lines[i]);
}
fs.writeFileSync("src/data/product-details.ts", fixedLines.join("\n"));

console.log("Fixed part 2");
