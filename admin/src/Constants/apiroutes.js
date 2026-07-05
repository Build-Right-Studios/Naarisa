export const BASE = {
  ROUTE: import.meta.env.VITE_BACKEND_URL
};

export const AUTH = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/auth/signup",
  VERIFY: "/api/auth/verify"
};

export const PRODUCT = {
  GET_PARENT_PRODUCTS: "/api/product/parent-products",
  GET_PRODUCTS: "/api/product/get-products",
  ADD_PRODUCT: "/api/product/add-product",
  ADD_NEW_VARIANT: "/api/variant/add-new-variant",
  GET_ALL: "/api/product/products",
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
  CREATE_SHIPMENT: (orderId) => `/api/shipment/${orderId}/create-shipment`,
  GET_COURIERS: (id) => `/api/shipment/${id}/couriers`,
  ASSIGN_COURIER: (id) => `/api/shipment/${id}/assign-courier`,
  GET_TRACKING: (orderId) => `/api/shipment/tracking/${orderId}`,
  SYNC_TRACKING: (orderId) => `/api/shipment/tracking/${orderId}/sync`,
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
