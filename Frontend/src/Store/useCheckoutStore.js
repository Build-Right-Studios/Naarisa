import { create } from "zustand";
import { persist } from "zustand/middleware";

// Holds the finalised order total from CartPage so CheckoutPage
// can read it without recomputing coupon logic.
const useCheckoutStore = create(
  persist(
    (set) => ({
      // Set by CartPage before navigating to /checkout
      subtotal:       0,
      discountAmount: 0,
      appliedCoupon:  null,  // full coupon object or null
      gst:            0,
      total:          0,

      setOrderSummary: ({ subtotal, discountAmount, appliedCoupon, gst, total }) =>
        set({ subtotal, discountAmount, appliedCoupon, gst, total }),

      clearOrderSummary: () =>
        set({ subtotal: 0, discountAmount: 0, appliedCoupon: null, gst: 0, total: 0 }),
    }),
    { name: "naarisa-checkout" }
  )
);

export default useCheckoutStore;