export const BASE = {
  ROUTE: import.meta.env.VITE_BACKEND_URL,
};

export const AUTH = {
  SEND_OTP:   "/api/auth/send-otp",
  VERIFY_OTP: "/api/auth/verify-otp",
};

export const BANNER = {
  GET_ACTIVE: "/api/banners/get-active-banners",
};

export const PRODUCT = {
  GET_ALL:      "/api/product/products",
  GET_PRODUCTS: "/api/product/get-products",
  NEW_ARRIVALS: "/api/product/new-arrivals",
  BEST_SELLERS: "/api/product/best-sellers",
  GET_BY_SLUG:  (slug) => `/api/product/${slug}`,
  BY_CATEGORY:  (category) => `/api/product/category/${category}?`,
  SEARCH_PRODUCTS: "/api/product/search",
};

export const COUPON = {
  GET_WEBSITE: "/api/coupons/website-coupons",
};

export const ORDER = {
  PLACE:      "/api/order/place-order",   // POST — isUser protected
  MY_ORDERS:  "/api/user/orders",         // GET  — isUser protected
  BY_ID:      (id) => `/api/user/orders/${id}`,
  GET_TRACKING: (orderId) => `/api/shipment/tracking/${orderId}`,
};

export const PAYMENT = {
  VERIFY: "/api/payment/verify-payment",  // POST — isUser protected
};

export const USER = {
  PROFILE:       "/api/user/profile",
  ADDRESSES:     "/api/user/addresses",
  ADDRESS_BY_ID: (id) => `/api/user/addresses/${id}`,
  SET_DEFAULT:   (id) => `/api/user/addresses/${id}/set-default`,
  ORDERS:        "/api/user/orders",
  WISHLIST:      "/api/user/wishlist",
  WISHLIST_ITEM: (id) => `/api/user/wishlist/${id}`,
};

export const CONTACT = {
  SEND_MAIL: "/api/contact/contact-mail",
};