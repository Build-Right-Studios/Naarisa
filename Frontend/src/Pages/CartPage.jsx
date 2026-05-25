import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE, COUPON } from "../Constants/apiroutes.js";

// ── Trash Icon ────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// ── Tag Icon ──────────────────────────────────────────────────────────────────
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Check Icon ────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Shield Icon ───────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── Truck Icon ────────────────────────────────────────────────────────────────
const TruckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
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
          {/* Code row */}
          <div className="flex items-center gap-2 mb-1">
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#1f1b15",
                backgroundColor: "#F5E6D0",
                padding: "2px 8px",
              }}
            >
              {coupon.code}
            </span>
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                color: "#2D6B5A",
                letterSpacing: "0.08em",
              }}
            >
              {discountLabel}
            </span>
          </div>

          {/* Savings text */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "12px",
              color: "#4A3728",
              fontWeight: 400,
              marginBottom: "2px",
            }}
          >
            {savingsText}
          </p>

          {/* Min order / cap info */}
          {coupon.minOrderValue > 0 && (
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                color: isEligible ? "#8C7B6B" : "#C4727A",
                fontWeight: 400,
              }}
            >
              {isEligible
                ? `Min. order ₹${coupon.minOrderValue.toLocaleString("en-IN")} ✓`
                : `Min. order ₹${coupon.minOrderValue.toLocaleString("en-IN")} required`}
            </p>
          )}
        </div>

        {/* Apply / Applied button */}
        <button
          onClick={() => isEligible && onApply(coupon)}
          disabled={!isEligible}
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "7px 14px",
            flexShrink: 0,
            cursor: isEligible ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            backgroundColor: isApplied ? "#2B2112" : "transparent",
            color: isApplied ? "#F5E6D0" : "#AB721E",
            border: isApplied ? "1px solid #2B2112" : "1px solid #AB721E",
          }}
        >
          {isApplied ? (
            <span className="flex items-center gap-1.5">
              <CheckIcon /> APPLIED
            </span>
          ) : (
            "APPLY"
          )}
        </button>
      </div>
    </div>
  );
};

// ── Cart Item ─────────────────────────────────────────────────────────────────
const CartItem = ({ item, onRemove, onQtyChange }) => {
  return (
    <div
      style={{
        border: "1px solid #E8DDD0",
        backgroundColor: "#fff",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div
          style={{
            width: "90px",
            aspectRatio: "3/4",
            flexShrink: 0,
            overflow: "hidden",
            backgroundColor: "#F5E6D0",
          }}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", color: "#8C7B6B", letterSpacing: "0.1em" }}>
                NAARISA
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: "17px",
                fontWeight: 400,
                color: "#1f1b15",
                lineHeight: 1.3,
                marginBottom: "4px",
              }}
            >
              {item.name}
            </h3>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "12px",
                color: "#8C7B6B",
                letterSpacing: "0.04em",
              }}
            >
              Color: {item.color} | Size: {item.size}
            </p>
          </div>

          {/* Price + Controls */}
          <div className="flex items-end justify-between mt-3 flex-wrap gap-2">
            {/* Qty */}
            <div
              className="flex items-center"
              style={{ border: "1px solid #E8DDD0", backgroundColor: "#F9F3EB" }}
            >
              <button
                onClick={() => onQtyChange(item.id, item.qty - 1)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "16px",
                  color: "#1f1b15",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                −
              </button>
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1f1b15",
                  width: "28px",
                  textAlign: "center",
                }}
              >
                {item.qty}
              </span>
              <button
                onClick={() => onQtyChange(item.id, item.qty + 1)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "16px",
                  color: "#1f1b15",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>

            {/* Price + Remove */}
            <div className="flex items-center gap-4">
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1f1b15",
                }}
              >
                ₹{(item.price * item.qty).toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => onRemove(item.id)}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#8C7B6B",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#C4727A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8C7B6B")}
              >
                <TrashIcon /> REMOVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Empty Cart ────────────────────────────────────────────────────────────────
const EmptyCart = ({ navigate }) => (
  <div
    style={{
      backgroundColor: "#F9F3EB",
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      padding: "60px 20px",
    }}
  >
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
    </svg>
    <div style={{ textAlign: "center" }}>
      <h2
        style={{
          fontFamily: "'EB Garamond', serif",
          fontSize: "26px",
          fontWeight: 400,
          color: "#1f1b15",
          marginBottom: "8px",
        }}
      >
        Your cart is empty
      </h2>
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "14px",
          color: "#8C7B6B",
          fontWeight: 300,
        }}
      >
        Discover our handcrafted collections
      </p>
    </div>
    <button
      onClick={() => navigate("/products")}
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        padding: "14px 32px",
        backgroundColor: "#2B2112",
        color: "#F5E6D0",
        border: "none",
        cursor: "pointer",
        marginTop: "8px",
      }}
    >
      EXPLORE COLLECTION
    </button>
  </div>
);

// ── Main Cart Page ────────────────────────────────────────────────────────────
const CartPage = () => {
  const navigate = useNavigate();

  // ── State ──
  const [cartItems, setCartItems] = useState([
    // Placeholder items — replace with real cart state/context
    {
      id: "1",
      name: "Amber Silk Handloom Saree",
      color: "Heritage Gold",
      size: "OS",
      price: 18500,
      qty: 1,
      image: null,
    },
    {
      id: "2",
      name: "Breathable Linen Tunic",
      color: "Sandalwood",
      size: "M",
      price: 4200,
      qty: 1,
      image: null,
    },
    {
      id: "3",
      name: "Temple Motif Leather Clutch",
      color: "Ebony Gold",
      size: "One Size",
      price: 7500,
      qty: 1,
      image: null,
    },
  ]);

  const [websiteCoupons, setWebsiteCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponsLoading, setCouponsLoading] = useState(true);

  // ── Fetch website coupons ──
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

  // ── Handlers ──
  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    if (appliedCoupon) setAppliedCoupon(null);
  };

  const handleQtyChange = (id, newQty) => {
    if (newQty < 1) return handleRemove(id);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
    // Re-validate coupon eligibility on qty change
    if (appliedCoupon) {
      const newSubtotal = cartItems.reduce((sum, item) =>
        sum + (item.id === id ? item.price * newQty : item.price * item.qty), 0
      );
      if (newSubtotal < (appliedCoupon.minOrderValue || 0)) {
        setAppliedCoupon(null);
      }
    }
  };

  const handleApplyCoupon = (coupon) => {
    if (appliedCoupon?.code === coupon.code) {
      setAppliedCoupon(null); // toggle off
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
    if (!match) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }
    if (subtotal < (match.minOrderValue || 0)) {
      setCouponError(`Min. order value ₹${match.minOrderValue.toLocaleString("en-IN")} required.`);
      return;
    }
    setAppliedCoupon(match);
    setCouponError("");
    setManualCode("");
  };

  // ── Calculations ──
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min(
          (subtotal * appliedCoupon.discountValue) / 100,
          appliedCoupon.maxDiscountAmount ?? Infinity
        )
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0;

  const afterDiscount = subtotal - discountAmount;
  const gst = Math.round(afterDiscount * 0.12);
  const total = afterDiscount + gst;

  if (cartItems.length === 0) return <EmptyCart navigate={navigate} />;

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }} className="pb-28 lg:pb-0">

      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-[1200px] px-4 pt-5 sm:px-6 md:px-10 xl:px-12">
        <p
          className="text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
        >
          <span className="cursor-pointer hover:text-[#C47B1E] transition-colors" onClick={() => navigate("/")}>
            Home
          </span>
          <span className="mx-2">/</span>
          <span style={{ color: "#1f1b15" }}>Your Cart</span>
        </p>
      </div>

      {/* ── Header ── */}
      <div className="mx-auto max-w-[1200px] px-4 pt-4 pb-6 sm:px-6 md:px-10 xl:px-12">
        <h1
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 400,
            color: "#1f1b15",
          }}
        >
          Your Cart{" "}
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#8C7B6B",
              letterSpacing: "0.04em",
            }}
          >
            ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
          </span>
        </h1>
      </div>

      {/* ── Main Grid ── */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">

          {/* ══ LEFT — Cart Items ══ */}
          <div>
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onQtyChange={handleQtyChange}
              />
            ))}

            {/* Continue shopping */}
            <button
              onClick={() => navigate("/products")}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#8C7B6B",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1f1b15")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8C7B6B")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              CONTINUE SHOPPING
            </button>
          </div>

          {/* ══ RIGHT — Summary Panel ══ */}
          <div className="lg:sticky lg:top-24">

            {/* ── Available Coupons ── */}
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E8DDD0",
                padding: "20px",
                marginBottom: "12px",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TagIcon />
                <h2
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    color: "#1f1b15",
                  }}
                >
                  OFFERS & COUPONS
                </h2>
              </div>

              {/* Manual input */}
              <div className="flex gap-2 mb-4">
                <input
                  value={manualCode}
                  onChange={(e) => { setManualCode(e.target.value.toUpperCase()); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleManualApply()}
                  placeholder="Enter coupon code"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "13px",
                    letterSpacing: "0.06em",
                    color: "#1f1b15",
                    backgroundColor: "#F9F3EB",
                    border: couponError ? "1px solid #C4727A" : "1px solid #E8DDD0",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleManualApply}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    padding: "10px 16px",
                    backgroundColor: "#2B2112",
                    color: "#F5E6D0",
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#AB721E")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2B2112")}
                >
                  APPLY
                </button>
              </div>

              {couponError && (
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "12px",
                    color: "#C4727A",
                    marginBottom: "12px",
                    marginTop: "-8px",
                  }}
                >
                  {couponError}
                </p>
              )}

              {/* Applied coupon remove */}
              {appliedCoupon && (
                <div
                  style={{
                    backgroundColor: "#F0FAF4",
                    border: "1px solid #2D6B5A",
                    padding: "10px 14px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#2D6B5A" }}><CheckIcon /></span>
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#2D6B5A",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {appliedCoupon.code} applied — saving ₹{Math.round(discountAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#C4727A",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              )}

              {/* Available coupon list */}
              {couponsLoading ? (
                <div style={{ padding: "12px 0" }}>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: "70px",
                        backgroundColor: "#F5E6D0",
                        marginBottom: "10px",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  ))}
                </div>
              ) : websiteCoupons.length > 0 ? (
                <div>
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "11px",
                      color: "#8C7B6B",
                      letterSpacing: "0.06em",
                      marginBottom: "10px",
                    }}
                  >
                    Available offers
                  </p>
                  {websiteCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon.code}
                      coupon={coupon}
                      onApply={handleApplyCoupon}
                      appliedCode={appliedCoupon?.code}
                      subtotal={subtotal}
                    />
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "12px",
                    color: "#8C7B6B",
                    fontStyle: "italic",
                  }}
                >
                  No active offers available right now.
                </p>
              )}
            </div>

            {/* ── Order Summary ── */}
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E8DDD0",
                padding: "20px",
                marginBottom: "12px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  color: "#1f1b15",
                  marginBottom: "16px",
                }}
              >
                ORDER SUMMARY
              </h2>

              {/* Line items */}
              {[
                { label: `Subtotal (${cartItems.length} items)`, value: `₹${subtotal.toLocaleString("en-IN")}`, accent: false },
                { label: "Shipping", value: "FREE", accent: true },
                ...(appliedCoupon
                  ? [{ label: `Discount (${appliedCoupon.code})`, value: `− ₹${Math.round(discountAmount).toLocaleString("en-IN")}`, accent: true }]
                  : []),
                { label: "Estimated Tax (12% GST)", value: `₹${gst.toLocaleString("en-IN")}`, accent: false },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "13px",
                      color: "#4A3728",
                      fontWeight: 400,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: accent ? "#2D6B5A" : "#1f1b15",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

              {/* Divider */}
              <div style={{ borderTop: "1px solid #E8DDD0", margin: "16px 0" }} />

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#1f1b15",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: "24px",
                    fontWeight: 500,
                    color: "#1f1b15",
                  }}
                >
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {appliedCoupon && (
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "12px",
                    color: "#2D6B5A",
                    fontWeight: 600,
                    textAlign: "right",
                    marginTop: "6px",
                  }}
                >
                  You save ₹{(subtotal + gst - total + Math.round(discountAmount * 0.12)).toLocaleString("en-IN")} on this order
                </p>
              )}
            </div>

            {/* ── Checkout Button — Desktop ── */}
            <div className="hidden lg:block">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 transition-all duration-300"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  backgroundColor: "#AB721E",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B6914")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#AB721E")}
              >
                PROCEED TO CHECKOUT
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {/* Trust badges */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "14px",
                  padding: "14px 16px",
                  backgroundColor: "#F9F3EB",
                  border: "1px solid #E8DDD0",
                }}
              >
                {[
                  { icon: <ShieldIcon />, text: "Secure Encrypted Payments" },
                  { icon: <TruckIcon />, text: "Artisanal Delivery tracked worldwide" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#8C7B6B" }}>{icon}</span>
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "12px",
                        color: "#4A3728",
                        fontWeight: 400,
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Sticky Checkout Bar — Mobile ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          backgroundColor: "#F9F3EB",
          borderTop: "1px solid #E8DDD0",
          padding: "12px 16px",
          boxShadow: "0 -4px 20px rgba(43,33,18,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B" }}>
            Total
          </span>
          <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", color: "#1f1b15" }}>
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          style={{
            width: "100%",
            padding: "14px",
            fontFamily: "'Jost', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            backgroundColor: "#AB721E",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          PROCEED TO CHECKOUT
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

    </div>
  );
};

export default CartPage;