const fs = require("fs");

let indexTsx = fs.readFileSync("src/routes/index.tsx", "utf8");
indexTsx = indexTsx.replace(
  /to=\{\`\/brands\/\$\{b\.slug\}\`\}/g,
  'to={"/brands/$slug"} params={{ slug: b.slug }}',
);
fs.writeFileSync("src/routes/index.tsx", indexTsx);

let productTsx = fs.readFileSync("src/routes/product.$id.tsx", "utf8");
productTsx = productTsx.replace(
  /head: \(\{ loaderData, params \}\) => \{/g,
  "head: (ctx: any) => {\n    const { loaderData, params } = ctx;",
);
productTsx = productTsx.replace(
  /const \{ product: p, relatedProducts: related \} = Route\.useLoaderData\(\);/g,
  "const { product: p, relatedProducts: related } = Route.useLoaderData() as any;",
);
productTsx = productTsx.replace(/related\.map\(\(r\) => \(/g, "related.map((r: any) => (");
fs.writeFileSync("src/routes/product.$id.tsx", productTsx);

let industrySlugTsx = fs.readFileSync("src/routes/industry.$slug.tsx", "utf8");
industrySlugTsx = industrySlugTsx.replace(
  /to="\/category\/237068"/g,
  'to="/category/$id" params={{ id: "237068" }}',
);
industrySlugTsx = industrySlugTsx.replace(
  /to="\/category\/237677"/g,
  'to="/category/$id" params={{ id: "237677" }}',
);
fs.writeFileSync("src/routes/industry.$slug.tsx", industrySlugTsx);

console.log("Fixed files!");
