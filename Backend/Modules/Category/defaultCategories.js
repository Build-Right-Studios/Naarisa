import { Category } from "../../MongoDB/models.js";

const TILE_IMAGES = "https://ik.imagekit.io/llcblwlng/naarisa/homepage-banners";

// The categories that were hardcoded in the storefront before categories became
// editable. Seeded once, into an empty collection, so the site looks the same on
// first deploy; after that the admin panel owns the list.
const DEFAULT_CATEGORIES = [
  { name: "Short Kurti", label: "Short Kurtis", slug: "short-kurtis", tagline: "Chic, versatile and effortlessly yours.", image: { url: `${TILE_IMAGES}/Short%20Kurtis%20Banner.png` } },
  { name: "Long Kurti", label: "Long Kurtis", slug: "long-kurtis", tagline: "Timeless silhouettes. Effortless elegance.", image: { url: `${TILE_IMAGES}/Long%20Kurtis%20Banner.png` } },
  { name: "Dresses", label: "Dresses", slug: "dresses", tagline: "Flowy silhouettes, timeless prints and elegance in every detail.", image: { url: `${TILE_IMAGES}/Dresses%20Banner.png` } },
  { name: "Kurti Sets", label: "Kurti Sets", slug: "kurti-sets", tagline: "Complete ensembles. Grace in every detail.", image: { url: `${TILE_IMAGES}/Kurti%20Set%20Banner.png` } },
  // The storefront supplies this tile image itself (bundled asset)
  { name: "Co-ord Sets", label: "Co-ord Sets", slug: "co-ord-sets", tagline: "Perfectly matched. Effortlessly put together." },
];

export const ensureDefaultCategories = async () => {
  try {
    if (await Category.exists({})) return;
    await Category.insertMany(DEFAULT_CATEGORIES.map((category, index) => ({ ...category, order: index + 1 })));
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
  } catch (error) {
    console.error("Seeding default categories failed:", error);
  }
};
