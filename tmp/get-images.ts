import { products } from "../src/data/products";

const firstImages = {};
for (const p of products) {
  if (!firstImages[p.brandSlug] && p.image) {
    firstImages[p.brandSlug] = p.image;
  }
}
console.log(JSON.stringify(firstImages, null, 2));
