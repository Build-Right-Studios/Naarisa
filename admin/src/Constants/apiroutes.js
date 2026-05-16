export const BASE = {
  ROUTE: "http://localhost:5000",
  // ROUTE: "https://naarisa.onrender.com"
};

export const AUTH = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/auth/signup",
};

export const PRODUCT = {
  GET_PRODUCTS: "/api/product/get-products",
  ADD_PRODUCT: "/api/product/add-product",
  ADD_NEW_VARIANT: "/api/variant/add-new-variant",
  GET_ALL: "/api/product/products",
  // GET_SINGLE_PRODUCT: (id) => `/api/product/${id}`,
};

export const VARIANT = {
  GET_BY_ID:   (id) => `/api/variant/${id}`,
  UPDATE: (id) => `/api/variant/${id}`,
  DEACTIVATE: (id) => `/api/variant/${id}/deactivate`,
};

export const COUPON = {
  ADD: "/api/coupons/add-coupon",
  GET: "/api/coupons/get-coupon",
  DELETE: (id) => `/api/coupons/${id}`,
};

export const ORDER = {
  ACTIVE:    "/api/order/active",
  DELIVERED: "/api/order/delivered",
  BY_ID:     (id) => `/api/order/${id}`,
};

export const BANNER = {
  ADD: "/api/banners/upload",
  GET: "/api/banners/get-banners",
  DELETE: (id) => `/api/banners/${id}`,
}

export const ADMIN_USERS = {
  GET_ALL:  "/api/user",
  GET_BY_ID: (id) => `/api/user/${id}`,
  EXPORT: "/api/user/export-users",
};
