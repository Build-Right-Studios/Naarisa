const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "red kurta" → every word must match the product name, category, tags or colour.
// `productField` is where the joined Product sits in the pipeline ("product" / "productId").
// User input is escaped, so it is matched literally (no regex injection).
export const buildSearchConditions = (query, productField) => {
  const words = String(query ?? "").trim().slice(0, 100).split(/\s+/).filter(Boolean).slice(0, 6);

  return words.map((word) => {
    const pattern = new RegExp(escapeRegex(word), "i");
    return {
      $or: [
        { [`${productField}.name`]: pattern },
        { [`${productField}.category`]: pattern },
        { [`${productField}.tags`]: pattern },
        { "color.name": pattern },
      ],
    };
  });
};
