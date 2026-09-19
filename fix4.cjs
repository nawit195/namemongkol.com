const fs = require("fs");

// 1. Fix product-details.ts
const pdTs = `export const productDetails: Record<string, {descriptionText: string; descriptionHtml: string}> = {};
export const productDetailById = (id: string) => productDetails[id];
`;
fs.writeFileSync("src/data/product-details.ts", pdTs);

// 2. Fix IndustriesShowcase.tsx
let content = fs.readFileSync("src/components/site/IndustriesShowcase.tsx", "utf8");
content = content.replace(
  /to=\{\`\/industry\/\$\{i\.slug\}\`\}/g,
  'to="/industry/$slug" params={{ slug: i.slug }}',
);
content = content.replace(
  /to=\{\`\/industry\/\$\{slug\}\`\}/g,
  'to="/industry/$slug" params={{ slug }}',
);
fs.writeFileSync("src/components/site/IndustriesShowcase.tsx", content);

console.log("Fixed part 4");
