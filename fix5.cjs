const fs = require("fs");

// 1. Fix IndustriesShowcase.tsx
let showcase = fs.readFileSync("src/components/site/IndustriesShowcase.tsx", "utf8");
showcase = showcase.replace(
  /to=\{\`\/industry\/\$\{ind\.slug\}\`\}/g,
  'to="/industry/$slug" params={{ slug: ind.slug }}',
);
fs.writeFileSync("src/components/site/IndustriesShowcase.tsx", showcase);

// 2. Hide Description Text from products.ts or rename it
let productsTs = fs.readFileSync("src/lib/content/products.ts", "utf8");
// rename label: "Description Text" to "Short Text Description (Optional)"
productsTs = productsTs.replace(
  /label: "Description Text"/g,
  'label: "ข้อความอธิบายแบบย่อ (Short Text)"',
);
// rename label: "Description HTML" to "Full Description (Rich Text Editor)"
productsTs = productsTs.replace(
  /label: "Description HTML"/g,
  'label: "รายละเอียดแบบเต็ม (Rich Text Editor)"',
);
fs.writeFileSync("src/lib/content/products.ts", productsTs);

console.log("Fixed part 5");
