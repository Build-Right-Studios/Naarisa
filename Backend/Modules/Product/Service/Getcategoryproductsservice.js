import { Product, Variant } from "../../../MongoDB/models.js";

/**
 * Fetch all active variants for a given category, grouped by product.
 */
export const getCategoryProductsService = async ({
  category,
  sort = "newest",
  page = 1,
  limit = 12,
}) => {
  // ── 1. Find products in category ─────────────────────────────
  const products = await Product.find({
    category: { $regex: new RegExp(`^${category}$`, "i") },
  }).lean();

  if (!products.length) return { products: [], total: 0 };

  const productIds = products.map((p) => p._id);

  // ── 2. Fetch active variants ────────────────────────────────
  const variants = await Variant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  // ── 3. Group variants by productId ──────────────────────────
  const variantMap = {};

  for (const v of variants) {
    const pid = v.productId.toString();
    if (!variantMap[pid]) variantMap[pid] = [];
    variantMap[pid].push(v);
  }

  // ── 4. Build combined product view ──────────────────────────
  let combined = products
    .filter((p) => variantMap[p._id.toString()]?.length)
    .map((p) => {
      const productVariants = variantMap[p._id.toString()];
      const primaryVariant = productVariants?.[0];

      return {
        ...p,
        variants: productVariants,

        // ✅ Variant-driven content (NEW ARCHITECTURE)
        description: primaryVariant?.description || "",
        stylingTips: primaryVariant?.stylingTips || "",
        fabricCare: primaryVariant?.fabricCare || "",
      };
    });

  // ── 5. Sorting ───────────────────────────────────────────────
  combined = sortProducts(combined, sort);

  // ── 6. Pagination ────────────────────────────────────────────
  const total = combined.length;
  const skip = (page - 1) * limit;
  const paginated = combined.slice(skip, skip + limit);

  return { products: paginated, total };
};

// ── SORT HELPERS ───────────────────────────────────────────────
const sortProducts = (products, sort) => {
  switch (sort) {
    case "price_asc":
      return [...products].sort((a, b) => {
        const pa = getEffectivePrice(a);
        const pb = getEffectivePrice(b);
        return pa - pb;
      });

    case "price_desc":
      return [...products].sort((a, b) => {
        const pa = getEffectivePrice(a);
        const pb = getEffectivePrice(b);
        return pb - pa;
      });

    case "discount":
      return [...products].sort((a, b) => {
        return getMaxDiscount(b) - getMaxDiscount(a);
      });

    case "newest":
    default:
      return [...products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  }
};

// ── PRICE HELPERS ──────────────────────────────────────────────
const getEffectivePrice = (product) => {
  const prices = product.variants.map(
    (v) => v.discountPrice ?? product.basePrice
  );

  return Math.min(...prices);
};

const getMaxDiscount = (product) => {
  const base = product.basePrice;

  const discounts = product.variants.map((v) => {
    if (!v.discountPrice) return 0;
    return ((base - v.discountPrice) / base) * 100;
  });

  return Math.max(...discounts);
};