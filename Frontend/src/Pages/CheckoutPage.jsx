import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../Store/useCartStore.js";
import useCheckoutStore from "../Store/useCheckoutStore.js";
import api from "../utils/axiosInstance.js";
import { ORDER, PAYMENT, USER } from "../Constants/apiRoutes.js";

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

  const items             = useCartStore((state) => state.items);
  const clearCart         = useCartStore((state) => state.clearCart);
  const { subtotal, discountAmount, appliedCoupon, total } = useCheckoutStore();
  const clearOrderSummary = useCheckoutStore((state) => state.clearOrderSummary);

  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("naarisa-user")) || null; }
    catch { return null; }
  });

  const [form, setForm] = useState(() => {
    const firstName = user?.name?.split(" ")[0] || "";
    const lastName  = user?.name?.split(" ").slice(1).join(" ") || "";
    const phone     = user?.phone || "";
    return { firstName, lastName, street: "", city: "", state: "Maharashtra", pinCode: "", phone, saveInfo: false };
  });
  const [errors,            setErrors]           = useState({});
  const [loading,           setLoading]           = useState(false);
  const [addresses,         setAddresses]         = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm,   setShowAddressForm]   = useState(false);
  const skipCartRedirect = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("naarisa-token");
    if (!token || !user) navigate("/auth?redirect=/checkout");
  }, []);

  useEffect(() => {
    if (skipCartRedirect.current) return;
    if (items.length === 0) navigate("/cart");
  }, [items]);

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
            lastName:  nameParts.slice(1).join(" ") || "",
            street:    defaultAddress.line1    || "",
            city:      defaultAddress.city     || "",
            state:     defaultAddress.state    || "Maharashtra",
            pinCode:   defaultAddress.pincode  || "",
            phone:     defaultAddress.phone    || prev.phone,
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

  const validate = () => {
    if (selectedAddressId && !showAddressForm) return true;
    const e = {};
    if (!form.firstName.trim())                             e.firstName = "Required";
    if (!form.lastName.trim())                              e.lastName  = "Required";
    if (!form.street.trim())                                e.street    = "Required";
    if (!form.city.trim())                                  e.city      = "Required";
    if (!form.state)                                        e.state     = "Required";
    if (!/^\d{6}$/.test(form.pinCode))                     e.pinCode   = "Enter a valid 6-digit PIN";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone  = "Enter a valid 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
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
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          size:      item.size,
          quantity:  item.qty,
        })),
        address: {
          name:    `${form.firstName} ${form.lastName}`.trim(),
          phone:   form.phone.replace(/\s/g, ""),
          line1:   form.street,
          line2:   "",
          city:    form.city,
          state:   form.state,
          pincode: form.pinCode,
          country: "India",
        },
        couponCode: appliedCoupon?.code || null,
      };

      const orderRes = await api.post(ORDER.PLACE, payload);
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key:         keyId,
        amount,
        currency:    currency || "INR",
        name:        "Naarisa",
        description: "Artisanal Craftsmanship",
        order_id:    razorpayOrderId,
        prefill: {
          name:    `${form.firstName} ${form.lastName}`.trim(),
          contact: form.phone.replace(/\s/g, ""),
          email:   user?.email || "",
        },
        theme: { color: "#AB721E" },

        handler: async (response) => {
          try {
            const verifyRes = await api.post(PAYMENT.VERIFY, {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            skipCartRedirect.current = true;
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

      {/* Minimal Header */}
      <div style={{ borderBottom: "1px solid #E8DDD0", backgroundColor: "#F9F3EB", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span onClick={() => navigate("/")} style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontWeight: 400, color: "#1f1b15", cursor: "pointer", letterSpacing: "0.02em" }}>
          Naarisa
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8C7B6B" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B" }}>
            SECURE CHECKOUT
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px] lg:items-start">

          {/* Left — Addresses + Form */}
          <div>

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
                        lastName:  user?.name?.split(" ").slice(1).join(" ") || "",
                        street: "", city: "", state: "Maharashtra", pinCode: "",
                        phone: user?.phone || "", saveInfo: false,
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
                          lastName:  nameParts.slice(1).join(" ") || "",
                          street:    address.line1   || "",
                          city:      address.city    || "",
                          state:     address.state   || "Maharashtra",
                          pinCode:   address.pincode || "",
                          phone:     address.phone   || "",
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
                      <input value={form.firstName} onChange={handleChange("firstName")} placeholder="Enter first name"
                        style={inputStyle(errors.firstName)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.firstName ? "#C4727A" : "#E8DDD0")} />
                    </Field>
                    <Field label="LAST NAME" error={errors.lastName}>
                      <input value={form.lastName} onChange={handleChange("lastName")} placeholder="Enter last name"
                        style={inputStyle(errors.lastName)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.lastName ? "#C4727A" : "#E8DDD0")} />
                    </Field>
                  </div>

                  <Field label="STREET ADDRESS" error={errors.street}>
                    <input value={form.street} onChange={handleChange("street")} placeholder="House number and street name"
                      style={inputStyle(errors.street)}
                      onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                      onBlur={(e) => (e.target.style.borderColor = errors.street ? "#C4727A" : "#E8DDD0")} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="CITY" error={errors.city}>
                      <input value={form.city} onChange={handleChange("city")} placeholder="City"
                        style={inputStyle(errors.city)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.city ? "#C4727A" : "#E8DDD0")} />
                    </Field>
                    <Field label="STATE" error={errors.state}>
                      <select value={form.state} onChange={handleChange("state")}
                        style={{ ...inputStyle(errors.state), appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px", cursor: "pointer" }}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8DDD0")}>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="PIN CODE" error={errors.pinCode}>
                      <input value={form.pinCode} onChange={handleChange("pinCode")} placeholder="6-digit code" maxLength={6}
                        style={inputStyle(errors.pinCode)}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.pinCode ? "#C4727A" : "#E8DDD0")} />
                    </Field>
                  </div>

                  <Field label="PHONE NUMBER" error={errors.phone}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontFamily: "'Jost', sans-serif", fontSize: "14px", color: "#8C7B6B", pointerEvents: "none" }}>+91</span>
                      <input value={form.phone} onChange={handleChange("phone")} placeholder="00000 00000" maxLength={11}
                        style={{ ...inputStyle(errors.phone), paddingLeft: "44px" }}
                        onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                        onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#C4727A" : "#E8DDD0")} />
                    </div>
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