export const productDetails: Record<string, { descriptionText: string; descriptionHtml: string }> =
  {};
export const productDetailById = (id: string) => productDetails[id];
