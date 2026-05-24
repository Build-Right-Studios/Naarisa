export const BASE = {
  ROUTE: import.meta.env.VITE_BACKEND_URL
};

export const BANNER = {
  GET_ACTIVE: "/api/banners/get-active-banners",
};

export const PRODUCT = {
  GET_ALL:        "/api/product/products",
  GET_PRODUCTS:   "/api/product/get-products",
  NEW_ARRIVALS:   "/api/product/new-arrivals",
  BEST_SELLERS:   "/api/product/best-sellers",
  GET_BY_SLUG:    (slug) => `/api/product/${slug}`,
};