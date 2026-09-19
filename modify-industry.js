const fs = require("fs");
let content = fs.readFileSync("src/routes/industry.$slug.tsx", "utf8");

// 1. Add payload parsing to IndustryPage
content = content.replace(
  /const industryImage = ind\.imageUrl \?\? INDUSTRY_IMAGE_FALLBACKS\[ind\.slug\];/,
  `const industryImage = ind.imageUrl ?? INDUSTRY_IMAGE_FALLBACKS[ind.slug];
  let payload: any = {};
  if (ind.payload) {
    try { payload = typeof ind.payload === "string" ? JSON.parse(ind.payload) : ind.payload; } catch (e) {}
  }`
);

content = content.replace(
  /\{ind\.slug === "education" && <EducationContent \/>\}/,
  `{ind.slug === "education" && <EducationContent payload={payload} />}`
);
content = content.replace(
  /\{ind\.slug === "hotel" && <HotelContent \/>\}/,
  `{ind.slug === "hotel" && <HotelContent payload={payload} />}`
);
content = content.replace(
  /\{ind\.slug === "corporate" && <CorporateContent \/>\}/,
  `{ind.slug === "corporate" && <CorporateContent payload={payload} />}`
);
content = content.replace(
  /\{ind\.slug === "video-conference" && <VideoConferenceContent \/>\}/,
  `{ind.slug === "video-conference" && <VideoConferenceContent payload={payload} />}`
);

// EducationContent products
// (Wait, the signature was already changed successfully in my previous chunk replace)
content = content.replace(
  /\{EDU_PRODUCTS\.map\(\(p\) => \(/,
  `{(typeof payload?.products !== "undefined" && payload.products.length > 0 ? payload.products : EDU_PRODUCTS).map((p: any) => (`
);
content = content.replace(
  /\{p\.desc\}/,
  `{p.descTH ? t(lang, p.descTH, p.descEN || "") : p.desc}`
);


// HotelContent
content = content.replace(
  /function HotelContent\(\) \{/,
  `function HotelContent({ payload }: { payload?: any }) {`
);
content = content.replace(
  /\{HOTEL_PRODUCTS\.map\(\(p\) => \(/,
  `{(typeof payload?.products !== "undefined" && payload.products.length > 0 ? payload.products : HOTEL_PRODUCTS).map((p: any) => (`
);


// CorporateContent
content = content.replace(
  /function CorporateContent\(\) \{/,
  `function CorporateContent({ payload }: { payload?: any }) {`
);
content = content.replace(
  /\{CORP_PRODUCTS\.map\(\(p\) => \(/,
  `{(typeof payload?.products !== "undefined" && payload.products.length > 0 ? payload.products : CORP_PRODUCTS).map((p: any) => (`
);


// VideoConferenceContent
content = content.replace(
  /function VideoConferenceContent\(\) \{/,
  `function VideoConferenceContent({ payload }: { payload?: any }) {`
);
content = content.replace(
  /\{VC_PRODUCTS\.map\(\(p\) => \(/,
  `{(typeof payload?.products !== "undefined" && payload.products.length > 0 ? payload.products : VC_PRODUCTS).map((p: any) => (`
);


fs.writeFileSync("src/routes/industry.$slug.tsx", content);
console.log("Done");
