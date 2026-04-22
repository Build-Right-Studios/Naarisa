export const BASE = {
  ROUTE: "http://localhost:5000",
};

export const AUTH = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/auth/signup",
};

export const PRODUCT = {
  GET_PRODUCTS: "/api/product/get-products",
  ADD_PRODUCT: "/api/product/add-product",
  ADD_NEW_VARIANT: "/api/product/add-new-variant",
  GET_SINGLE_PRODUCT: (id) => `/api/product/${id}`,
};

export const VARIANT = {
  DEACTIVATE: (id) => `/api/variant/${id}/deactivate`,
  UPDATE: (id) => `/api/variant/${id}`,
};

export const COUPON = {
  ADD: "/api/coupons/add-coupon",
  GET: "/api/coupons/get-coupon",
  DELETE: (id) => `/api/coupons/${id}`,
};
