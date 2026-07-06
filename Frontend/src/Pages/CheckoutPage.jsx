import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../Store/useCartStore.js";
import useCheckoutStore from "../Store/useCheckoutStore.js";
import api from "../utils/axiosInstance.js";
import axios from "axios";
import { ORDER, PAYMENT, USER, BASE, COUPON } from "../Constants/apiRoutes.js";

// ── Indian States ─────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Coupon Card ───────────────────────────────────────────────────────────────
const CouponCard = ({ coupon, onApply, appliedCode, subtotal }) => {
  const isApplied = appliedCode === coupon.code;
  const isEligible = subtotal >= (coupon.minOrderValue || 0);

  const discountLabel =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue.toLocaleString("en-IN")} OFF`;

  const savingsText =
    coupon.discountType === "percentage"
      ? coupon.maxDiscountAmount
        ? `Save up to ₹${coupon.maxDiscountAmount.toLocaleString("en-IN")}`
        : `Save ${coupon.discountValue}% on your order`
      : `Save ₹${coupon.discountValue.toLocaleString("en-IN")} on your order`;

  return (
    <div
      style={{
        border: isApplied ? "1.5px solid #AB721E" : "1px solid #E8DDD0",
        backgroundColor: isApplied ? "#FDF8F1" : "#fff",
        padding: "14px 16px",
        marginBottom: "10px",
        transition: "all 0.2s",
        opacity: isEligible ? 1 : 0.55,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "#1f1b15", backgroundColor: "#F5E6D0", padding: "2px 8px" }}>
              {coupon.code}
            </span>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, color: "#2D6B5A", letterSpacing: "0.08em" }}>
              {discountLabel}
            </span>
          </div>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#4A3728", fontWeight: 400, marginBottom: "2px" }}>
            {savingsText}
          </p>
          {coupon.minOrderValue > 0 && (
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: isEligible ? "#8C7B6B" : "#C4727A", fontWeight: 400 }}>
              {isEligible
                ? `Min. order ₹${coupon.minOrderValue.toLocaleString("en-IN")} ✓`
                : `Min. order ₹${coupon.minOrderValue.toLocaleString("en-IN")} required`}
            </p>
          )}
        </div>
        <button
          onClick={() => isEligible && onApply(coupon)}
          disabled={!isEligible}
          style={{
            fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
            padding: "7px 14px", flexShrink: 0,
            cursor: isEligible ? "pointer" : "not-allowed", transition: "all 0.2s",
            backgroundColor: isApplied ? "#2B2112" : "transparent",
            color: isApplied ? "#F5E6D0" : "#AB721E",
            border: isApplied ? "1px solid #2B2112" : "1px solid #AB721E",
          }}
        >
          {isApplied ? <span className="flex items-center gap-1.5"><CheckIcon /> APPLIED</span> : "APPLY"}
        </button>
      </div>
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B" }}>
      {label}
    </label>
    {children}
    {error && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#C4727A", marginTop: "-2px" }}>{error}</p>}
  </div>
);

const inputStyle = (hasError) => ({
  width: "100%", padding: "12px 14px",
  fontFamily: "'Jost', sans-serif", fontSize: "14px", color: "#1f1b15",
  backgroundColor: "#FDF8F1",
  border: hasError ? "1px solid #C4727A" : "1px solid #E8DDD0",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
});

// ── Order Summary Sidebar ─────────────────────────────────────────────────────
const OrderSummary = ({ items, subtotal, discountAmount, appliedCoupon, total, onComplete, loading }) => (
  <div style={{ backgroundColor: "#F5E6D0", border: "1px solid #E8DDD0", padding: "28px", position: "sticky", top: "24px" }}>
    <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontWeight: 400, color: "#1f1b15", marginBottom: "20px" }}>
      Order Summary
    </h2>

    {/* Items */}
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ width: "60px", aspectRatio: "3/4", flexShrink: 0, overflow: "hidden", backgroundColor: "#E8DDD0" }}>
            {item.image
              ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "8px", color: "#8C7B6B", letterSpacing: "0.1em" }}>N</span>
              </div>
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "15px", color: "#1f1b15", lineHeight: 1.3, marginBottom: "2px" }}>{item.name}</p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B" }}>{item.color} / {item.size}{item.qty > 1 ? ` × ${item.qty}` : ""}</p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "14px", fontWeight: 600, color: "#AB721E", marginTop: "4px" }}>
              ₹{(item.price * item.qty).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Pricing rows */}
    <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {[
        { label: "Subtotal", value: `₹${subtotal.toLocaleString("en-IN")}`, accent: false },
        { label: "Shipping", value: "FREE", accent: true },
        ...(appliedCoupon
          ? [{ label: `Discount (${appliedCoupon.code})`, value: `− ₹${Math.round(discountAmount).toLocaleString("en-IN")}`, accent: true }]
          : []),
      ].map(({ label, value, accent }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#4A3728" }}>{label}</span>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 600, color: accent ? "#2D6B5A" : "#1f1b15" }}>{value}</span>
        </div>
      ))}
    </div>

    {/* Total */}
    <div style={{ borderTop: "1px solid #C4A882", margin: "16px 0", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", fontWeight: 500, color: "#1f1b15" }}>Total</span>
      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "26px", fontWeight: 500, color: "#1f1b15" }}>₹{total.toLocaleString("en-IN")}</span>
    </div>

    <button
      onClick={onComplete}
      disabled={loading}
      style={{ width: "100%", padding: "15px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", backgroundColor: loading ? "#C4A882" : "#AB721E", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "background 0.2s", marginBottom: "12px" }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#8B6914"; }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#AB721E"; }}
    >
      {loading ? "PROCESSING..." : "COMPLETE ORDER"}
      {!loading && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      )}
    </button>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8C7B6B" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", letterSpacing: "0.1em" }}>100% ENCRYPTED & SECURE</span>
    </div>
  </div>
);

// ── Main Checkout Page ────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const { subtotal: initialSubtotal } = useCheckoutStore();
  const clearOrderSummary = useCheckoutStore((state) => state.clearOrderSummary);

  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("naarisa-user")) || null; }
    catch { return null; }
  });

  // ── Coupon State ──────────────────────────────────────────────────────────
  const [websiteCoupons, setWebsiteCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponsLoading, setCouponsLoading] = useState(true);

  // ── Address Form State ────────────────────────────────────────────────────
  const [form, setForm] = useState(() => {
    const firstName = user?.name?.split(" ")[0] || "";
    const lastName = user?.name?.split(" ").slice(1).join(" ") || "";
    const phone = user?.phone || "";
    const email = user?.email || "";
    return { firstName, lastName, email, street: "", city: "", state: "Maharashtra", pinCode: "", phone, saveInfo: false };
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const skipCartRedirect = useRef(false);

  // ── Refs for scroll-to-error ──────────────────────────────────────────────
  const fieldRefs = useRef({});
  // Order matters — this is the order we check for the *first* error
  const FIELD_ORDER = ["firstName", "lastName", "street", "city", "state", "pinCode", "phone", "email"];

  const scrollToFirstError = (errorObj) => {
    const firstKey = FIELD_ORDER.find((key) => errorObj[key]);
    const el = firstKey && fieldRefs.current[firstKey];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Small delay so focus happens after the scroll settles
      setTimeout(() => el.focus({ preventScroll: true }), 300);
    }
  };

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscountAmount ?? Infinity)
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0;

  const total = subtotal - discountAmount;

  // ── Fetch Coupons ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${BASE.ROUTE}${COUPON.GET_WEBSITE}`);
        if (res.data.success) setWebsiteCoupons(res.data.coupons);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      } finally {
        setCouponsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // ── Drop coupon if cart no longer meets minimum order value
  useEffect(() => {
    if (appliedCoupon && subtotal < (appliedCoupon.minOrderValue || 0)) {
      setAppliedCoupon(null);
    }
  }, [items]);

  // ── Auth Check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("naarisa-token");
    if (!token || !user) navigate("/auth?redirect=/checkout");
  }, []);

  useEffect(() => {
    if (skipCartRedirect.current) return;
    if (items.length === 0) navigate("/cart");
  }, [items]);

  // ── Fetch Addresses ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get(USER.ADDRESSES);
        const activeAddresses = res.data?.data || [];
        setAddresses(activeAddresses);

        if (activeAddresses.length > 0) {
          const defaultAddress = activeAddresses.find((a) => a.isDefault) || activeAddresses[0];
          setSelectedAddressId(defaultAddress._id);
          setShowAddressForm(false);
          const nameParts = defaultAddress.name?.split(" ") || [];
          setForm((prev) => ({
            ...prev,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            street: defaultAddress.line1 || "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "Maharashtra",
            pinCode: defaultAddress.pincode || "",
            phone: defaultAddress.phone || prev.phone,
            email: defaultAddress.email || ""
          }));
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
        setShowAddressForm(true);
      }
    };
    fetchAddresses();
  }, []);

  // ── Coupon Handlers ───────────────────────────────────────────────────────
  const handleApplyCoupon = (coupon) => {
    if (appliedCoupon?.code === coupon.code) {
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(coupon);
      setManualCode("");
      setCouponError("");
    }
  };

  const handleManualApply = () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    const match = websiteCoupons.find((c) => c.code === code);
    if (!match) { setCouponError("Invalid or expired coupon code."); return; }
    if (subtotal < (match.minOrderValue || 0)) {
      setCouponError(`Min. order value ₹${match.minOrderValue.toLocaleString("en-IN")} required.`);
      return;
    }
    setAppliedCoupon(match);
    setCouponError("");
    setManualCode("");
  };

  // ── Address Validation ────────────────────────────────────────────────────
  const validate = () => {
    if (selectedAddressId && !showAddressForm) return true;
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state) e.state = "Required";
    if (!/^\d{6}$/.test(form.pinCode)) e.pinCode = "Enter a valid 6-digit PIN";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email";
    }

    setErrors(e);

    if (Object.keys(e).length > 0) {
      scrollToFirstError(e);
      return false;
    }
    return true;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCompleteOrder = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // Save address if user chose "Save this information for next time"
      if (showAddressForm && form.saveInfo) {
        try {
          const saveRes = await api.post(USER.ADDRESSES, {
            label: "Home",
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email.toLowerCase().trim(),
            phone: form.phone.replace(/\s/g, ""),
            line1: form.street,
            line2: "",
            city: form.city,
            state: form.state,
            pincode: form.pinCode,
            country: "India",
          });

          if (saveRes.data.success) {
            setAddresses(saveRes.data.data);

            const savedAddress =
              saveRes.data.data.find(
                (a) =>
                  a.phone === form.phone.replace(/\s/g, "") &&
                  a.line1 === form.street &&
                  a.pincode === form.pinCode
              ) || saveRes.data.data.at(-1);

            if (savedAddress) {
              setSelectedAddressId(savedAddress._id);
            }
          }
        } catch (err) {
          console.error("Failed to save address:", err);
          // Don't stop checkout if saving address fails.
        }
      }
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          size: item.size,
          quantity: item.qty,
        })),
        address: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone.replace(/\s/g, ""),
          email: form.email.toLowerCase().trim(),
          line1: form.street,
          line2: "",
          city: form.city,
          state: form.state,
          pincode: form.pinCode,
          country: "India",
        },
        couponCode: appliedCoupon?.code || null,
      };

      const orderRes = await api.post(ORDER.PLACE, payload);
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "Naarisa",
        description: "Artisanal Craftsmanship",
        order_id: razorpayOrderId,
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          contact: form.phone.replace(/\s/g, ""),
          email: user?.email || "",
        },
        theme: { color: "#AB721E" },

        handler: async (response) => {
          try {
            const verifyRes = await api.post(PAYMENT.VERIFY, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customOrderId: orderRes.data.customOrderId,
              userEmail: form.email || user?.email
            });
            skipCartRedirect.current = true;
            console.log(verifyRes.data)
            clearCart();
            clearOrderSummary();
            navigate(`/order-success/${verifyRes.data.orderId}`);
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setLoading(false);
            alert("Payment received but verification failed. Please contact support.");
          }
        },

        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        setLoading(false);
        alert(`Payment failed: ${response.error?.description || "Please try again."}`);
      });
      rzp.open();

    } catch (err) {
      console.error("Order creation failed:", err);
      setLoading(false);
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      {/* Body */}
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px] lg:items-start">

          {/* Left — Coupons + Addresses + Form */}
          <div>

            {/* Offers & Coupons Section */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", padding: "20px", marginBottom: "24px" }}>
              <div className="flex items-center gap-2 mb-4">
                <TagIcon />
                <h2 style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: "#1f1b15" }}>
                  OFFERS & COUPONS
                </h2>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  value={manualCode}
                  onChange={(e) => { setManualCode(e.target.value.toUpperCase()); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleManualApply()}
                  placeholder="Enter coupon code"
                  style={{ flex: 1, padding: "10px 12px", fontFamily: "'Jost', sans-serif", fontSize: "13px", letterSpacing: "0.06em", color: "#1f1b15", backgroundColor: "#F9F3EB", border: couponError ? "1px solid #C4727A" : "1px solid #E8DDD0", outline: "none" }}
                />
                <button
                  onClick={handleManualApply}
                  style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", padding: "10px 16px", backgroundColor: "#2B2112", color: "#F5E6D0", border: "none", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#AB721E")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2B2112")}
                >
                  APPLY
                </button>
              </div>

              {couponError && (
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4727A", marginBottom: "12px", marginTop: "-8px" }}>
                  {couponError}
                </p>
              )}

              {appliedCoupon && (
                <div style={{ backgroundColor: "#F0FAF4", border: "1px solid #2D6B5A", padding: "10px 14px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#2D6B5A" }}><CheckIcon /></span>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 700, color: "#2D6B5A", letterSpacing: "0.08em" }}>
                      {appliedCoupon.code} — saving ₹{Math.round(discountAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#C4727A", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    REMOVE
                  </button>
                </div>
              )}

              {couponsLoading ? (
                <div style={{ padding: "12px 0" }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{ height: "70px", backgroundColor: "#F5E6D0", marginBottom: "10px", borderRadius: "2px" }} />
                  ))}
                </div>
              ) : websiteCoupons.length > 0 ? (
                <div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", letterSpacing: "0.06em", marginBottom: "10px" }}>
                    Available offers
                  </p>
                  {websiteCoupons.map((coupon) => (
                    <CouponCard key={coupon.code} coupon={coupon} onApply={handleApplyCoupon} appliedCode={appliedCoupon?.code} subtotal={subtotal} />
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B", fontStyle: "italic" }}>
                  No active offers available right now.
                </p>
              )}
            </div>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", padding: "24px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontWeight: 400, color: "#1f1b15" }}>
                    Saved Addresses
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(null);
                      setShowAddressForm(true);
                      setErrors({});
                      setForm({
                        firstName: user?.name?.split(" ")[0] || "",
                        lastName: user?.name?.split(" ").slice(1).join(" ") || "",
                        street: "", city: "", state: "Maharashtra", pinCode: "",
                        phone: user?.phone || "", saveInfo: false,
                        email: user?.email || ""
                      });
                    }}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "#AB721E", fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}
                  >
                    + Add New Address
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => {
                        setSelectedAddressId(address._id);
                        setShowAddressForm(false);
                        setErrors({});
                        const nameParts = address.name?.split(" ") || [];
                        setForm((prev) => ({
                          ...prev,
                          firstName: nameParts[0] || "",
                          lastName: nameParts.slice(1).join(" ") || "",
                          street: address.line1 || "",
                          city: address.city || "",
                          state: address.state || "Maharashtra",
                          pinCode: address.pincode || "",
                          phone: address.phone || "",
                          email: address.email || ""
                        }));
                      }}
                      style={{
                        border: selectedAddressId === address._id ? "2px solid #AB721E" : "1px solid #E8DDD0",
                        padding: "14px", cursor: "pointer",
                        backgroundColor: selectedAddressId === address._id ? "#FFF8ED" : "#fff",
                        transition: "border-color 0.2s, background-color 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1f1b15", marginBottom: "4px" }}>
                          {address.name}
                          {address.isDefault && (
                            <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#AB721E", backgroundColor: "#FFF0D6", padding: "2px 6px" }}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {selectedAddressId === address._id && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#AB721E" stroke="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                          </svg>
                        )}
                      </div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#4A3728" }}>
                        {address.line1}, {address.city}, {address.state} – {address.pincode}
                      </div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#8C7B6B", marginTop: "4px" }}>
                        +91 {address.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New / Manual Address Form */}
            {(showAddressForm || addresses.length === 0) && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2B2112", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 700, color: "#F5E6D0" }}>1</span>
                  </div>
                  <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: "24px", fontWeight: 400, color: "#1f1b15" }}>
                    {addresses.length > 0 ? "New Address" : "Shipping Address"}
                  </h1>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        if (!selectedAddressId && addresses.length > 0) {
                          const first = addresses.find((a) => a.isDefault) || addresses[0];
                          setSelectedAddressId(first._id);
                        }
                      }}
                      style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "#8C7B6B", fontFamily: "'Jost', sans-serif", fontSize: "12px", letterSpacing: "0.08em" }}
                    >
                      ← Use saved address
                    </button>
                  )}
                </div>

                <div style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="FIRST NAME" error={errors.firstName}>
                      <input
                        ref={(el) => (fieldRefs.current.firstName = el)}
                        value={form.firstName}
                        onChange={handleChange("firstName")}
                        placeholder="Enter first name"
                        style={inputStyle(errors.firstName)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.firstName ? "#C4727A" : "#E8DDD0")}
                      />
                    </Field>
                    <Field label="LAST NAME" error={errors.lastName}>
                      <input
                        ref={(el) => (fieldRefs.current.lastName = el)}
                        value={form.lastName}
                        onChange={handleChange("lastName")}
                        placeholder="Enter last name"
                        style={inputStyle(errors.lastName)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.lastName ? "#C4727A" : "#E8DDD0")}
                      />
                    </Field>
                  </div>

                  <Field label="STREET ADDRESS" error={errors.street}>
                    <input
                      ref={(el) => (fieldRefs.current.street = el)}
                      value={form.street}
                      onChange={handleChange("street")}
                      placeholder="House number and street name"
                      style={inputStyle(errors.street)}
                      onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                      onBlur={(e) => (e.target.style.borderColor = errors.street ? "#C4727A" : "#E8DDD0")}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="CITY" error={errors.city}>
                      <input
                        ref={(el) => (fieldRefs.current.city = el)}
                        value={form.city}
                        onChange={handleChange("city")}
                        placeholder="City"
                        style={inputStyle(errors.city)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.city ? "#C4727A" : "#E8DDD0")}
                      />
                    </Field>
                    <Field label="STATE" error={errors.state}>
                      <select
                        ref={(el) => (fieldRefs.current.state = el)}
                        value={form.state}
                        onChange={handleChange("state")}
                        style={{ ...inputStyle(errors.state), appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px", cursor: "pointer" }}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8DDD0")}
                      >
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="PIN CODE" error={errors.pinCode}>
                      <input
                        ref={(el) => (fieldRefs.current.pinCode = el)}
                        value={form.pinCode}
                        onChange={handleChange("pinCode")}
                        placeholder="6-digit code"
                        maxLength={6}
                        style={inputStyle(errors.pinCode)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.pinCode ? "#C4727A" : "#E8DDD0")}
                      />
                    </Field>
                  </div>

                  <Field label="PHONE NUMBER" error={errors.phone}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontFamily: "'Jost', sans-serif", fontSize: "14px", color: "#8C7B6B", pointerEvents: "none" }}>+91</span>
                      <input
                        ref={(el) => (fieldRefs.current.phone = el)}
                        value={form.phone}
                        onChange={handleChange("phone")}
                        placeholder="00000 00000"
                        maxLength={11}
                        style={{ ...inputStyle(errors.phone), paddingLeft: "44px" }}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#C4727A" : "#E8DDD0")}
                      />
                    </div>
                  </Field>

                  <Field label="EMAIL ADDRESS (FOR NOTIFICATIONS)" error={errors.email}>
                    <input
                      ref={(el) => (fieldRefs.current.email = el)}
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="your@email.com"
                      type="email"
                      style={inputStyle(errors.email)}
                      onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                      onBlur={(e) => (e.target.style.borderColor = errors.email ? "#C4727A" : "#E8DDD0")}
                    />
                  </Field>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <div
                      style={{ width: "18px", height: "18px", flexShrink: 0, border: form.saveInfo ? "none" : "1.5px solid #C4A882", backgroundColor: form.saveInfo ? "#2B2112" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                      onClick={() => setForm((p) => ({ ...p, saveInfo: !p.saveInfo }))}
                    >
                      {form.saveInfo && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F5E6D0" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#4A3728", userSelect: "none" }}>
                      Save this information for next time
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Right — Order Summary */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            discountAmount={discountAmount}
            appliedCoupon={appliedCoupon}
            total={total}
            onComplete={handleCompleteOrder}
            loading={loading}
          />
        </div>
      </div>

      {/* Sticky Complete Order — Mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{ backgroundColor: "#F9F3EB", borderTop: "1px solid #E8DDD0", padding: "12px 16px", boxShadow: "0 -4px 20px rgba(43,33,18,0.08)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B" }}>Total</span>
          <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", color: "#1f1b15" }}>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <button
          onClick={handleCompleteOrder}
          disabled={loading}
          style={{ width: "100%", padding: "14px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", backgroundColor: loading ? "#C4A882" : "#AB721E", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          {loading ? "PROCESSING..." : "COMPLETE ORDER →"}
        </button>
      </div>

    </div>
  );
};

export default CheckoutPage;