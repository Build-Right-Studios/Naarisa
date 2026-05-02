import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE, PRODUCT } from "../Constants/apiroutes.js";

const BASE_URL = BASE.ROUTE;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const initialSizes = SIZES.reduce((acc, s) => ({
  ...acc,
  [s]: { enabled: false, stock: 0 },
}), {});

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function AddVariant() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [products, setProducts]     = useState([]);
  const [parentProduct, setParentProduct] = useState("");
  const [sizes, setSizes]           = useState(initialSizes);
  const [colorName, setColorName]   = useState("");
  const [colorHex, setColorHex]     = useState("#7c3aed");
  const [discountPrice, setDiscountPrice] = useState("");
  const [images, setImages]         = useState([]);        // { file, preview }
  const [dragOver, setDragOver]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [toast, setToast]           = useState(null);

  const token = localStorage.getItem("token");
  const width = useWindowWidth();
  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1024;
  const isMonitor = width >= 1440;
  const pagePadding = isMobile ? "24px 16px" : isTablet ? "28px 28px" : isMonitor ? "48px 64px" : "40px 48px";
  const twoCol = !isMobile;

  // Fetch products for the parent product dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch(`${BASE_URL}${PRODUCT.GET_PRODUCTS}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProducts(data.data || data.products || []);
      } catch (e) { console.error(e); }
    };
    fetchProducts();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Image handling ──
  const addImages = (files) => {
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024
    );
    const previews = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...previews].slice(0, 5));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const removeImage = (i) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  // ── Size toggles ──
  const toggleSize = (size) => {
    setSizes((prev) => ({
      ...prev,
      [size]: { ...prev[size], enabled: !prev[size].enabled },
    }));
  };

  const setStock = (size, val) => {
    setSizes((prev) => ({
      ...prev,
      [size]: { ...prev[size], stock: Number(val) },
    }));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setError("");
    if (!parentProduct)   return setError("Please select a parent product.");
    if (!colorName.trim()) return setError("Color name is required.");
    if (images.length === 0) return setError("Please upload at least one image.");

    const enabledSizes = SIZES.filter((s) => sizes[s].enabled);
    if (enabledSizes.length === 0) return setError("Please enable at least one size.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", parentProduct);
      formData.append("colorName", colorName.trim());
      formData.append("colorHex", colorHex);
      if (discountPrice) formData.append("discountPrice", Number(discountPrice));

      const sizeStock = enabledSizes.map((s) => ({ size: s, stock: sizes[s].stock }));
      formData.append("sizes", JSON.stringify(sizeStock));

      images.forEach((img) => formData.append("images", img.file));

      const res  = await fetch(`${BASE_URL}${PRODUCT.ADD_NEW_VARIANT}`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast("Variant submitted successfully!");
        setTimeout(() => navigate("/products"), 1200);
      } else {
        setError(data.message || "Failed to submit variant.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ ...S.page, padding: pagePadding }}>

      {/* Toast */}
      {toast && (
        <div style={{
          ...S.toast,
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          top: isMobile ? 12 : 24,
          right: isMobile ? 12 : 24,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={S.breadcrumb}>
        <span style={S.breadcrumbLink} onClick={() => navigate("/products")}>INVENTORY</span>
        <span style={S.breadcrumbSep}>›</span>
        <span style={S.breadcrumbLink} onClick={() => navigate("/products")}>PRODUCTS</span>
        <span style={S.breadcrumbSep}>›</span>
        <span style={S.breadcrumbCurrent}>NEW VARIANT</span>
      </div>

      <h1 style={{ ...S.title, fontSize: isMobile ? 24 : 32 }}>Add New Variant</h1>
      <p style={S.subtitle}>Define visual and stock parameters for product variations.</p>

      {/* Main grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: twoCol ? "1fr 1fr" : "1fr",
        gap: 20,
        marginTop: 28,
      }}>

        {/* LEFT — Variant Media + Color */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Variant Media */}
          <div style={S.card}>
            <SectionHeader icon={<ImageIcon />} label="VARIANT MEDIA" />

            {/* Drop zone */}
            <div
              style={{
                ...S.dropZone,
                borderColor: dragOver ? "#7c3aed" : "#d1d5db",
                background:  dragOver ? "#f5f3ff" : "#fafafa",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={(e) => addImages(e.target.files)}
              />
              <div style={S.uploadIcon}><UploadIcon /></div>
              <p style={S.dropTitle}>Drop images here</p>
              <p style={S.dropSubtitle}>Supports JPG, PNG, WEBP (Max 5MB)</p>
              <button
                style={S.browseBtn}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse Files
              </button>
            </div>

            {/* Image previews */}
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} style={S.previewWrapper}>
                  <img src={img.preview} alt="" style={S.previewImg} />
                  <button style={S.removeImg} onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
              {images.length < 5 && images.length > 0 && (
                <div style={{ ...S.previewWrapper, ...S.addMoreBtn }}
                  onClick={() => fileRef.current?.click()}>
                  <span style={{ fontSize: 22, color: "#aaa" }}>+</span>
                </div>
              )}
            </div>
          </div>

          {/* Color Profile */}
          <div style={S.card}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>COLOR PROFILE</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  style={{ ...S.input, flex: 1 }}
                  placeholder="e.g. Midnight Purple"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
                <div style={{ position: "relative" }}>
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  />
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 10,
                    background: colorHex,
                    border: "2px solid #e5e7eb",
                    cursor: "pointer",
                  }} />
                </div>
              </div>
            </div>

            <div>
              <label style={S.label}>DISCOUNT PRICE (₹)</label>
              <div style={S.inputWithPrefix}>
                <span style={S.prefix}>₹</span>
                <input
                  style={{ ...S.input, paddingLeft: 28 }}
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                Leave blank to use base product price.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — Product Association + Sizes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={S.card}>
            <SectionHeader icon={<AssocIcon />} label="PRODUCT ASSOCIATION" />

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>SELECT PARENT PRODUCT</label>
              <div style={S.selectWrapper}>
                <select
                  style={S.select}
                  value={parentProduct}
                  onChange={(e) => setParentProduct(e.target.value)}
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <span style={S.selectArrow}>▾</span>
              </div>
            </div>

            <SectionHeader icon={<StockIcon />} label="SIZE & STOCK MANAGEMENT" />

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginTop: 16,
            }}>
              {SIZES.map((size) => {
                const active = sizes[size].enabled;
                return (
                  <div key={size} style={{
                    ...S.sizeCard,
                    borderColor: active ? "#7c3aed" : "#e5e7eb",
                    background:  active ? "#faf5ff" : "#fff",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{size}</span>
                      {/* Custom checkbox */}
                      <div
                        onClick={() => toggleSize(size)}
                        style={{
                          width: 18, height: 18,
                          borderRadius: 4,
                          border: `2px solid ${active ? "#7c3aed" : "#d1d5db"}`,
                          background: active ? "#7c3aed" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        {active && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                      </div>
                    </div>
                    <label style={{ ...S.label, marginBottom: 4 }}>STOCK QTY</label>
                    <input
                      style={{
                        ...S.input,
                        padding: "8px 10px",
                        fontSize: 14,
                        background: active ? "#fff" : "#f5f5f7",
                        color: active ? "#111" : "#aaa",
                      }}
                      type="number"
                      min={0}
                      value={sizes[size].stock}
                      onChange={(e) => setStock(size, e.target.value)}
                      disabled={!active}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit bar */}
          <div style={S.submitBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#7c3aed", fontSize: 16 }}>ℹ</span>
              <span style={{ fontSize: 13, color: "#555" }}>
                All changes are saved as drafts until submission.
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button style={S.discardBtn} onClick={() => navigate("/products")}>Discard</button>
              <button
                style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Variant"}
              </button>
            </div>
          </div>

          {error && <p style={{ ...S.errorText, marginTop: -8 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "#111" }}>
        {label}
      </span>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
function AssocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}
function StockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    background: "#f5f5f7",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  breadcrumbLink: { color: "#888", cursor: "pointer" },
  breadcrumbSep:  { color: "#bbb" },
  breadcrumbCurrent: { color: "#7c3aed" },
  title: {
    fontWeight: 800,
    color: "#111",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "none",
    background: "#f2f2f5",
    fontSize: 14,
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
  },
  selectWrapper: { position: "relative" },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: 14,
    color: "#111",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
  },
  selectArrow: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    fontSize: 12,
    pointerEvents: "none",
  },
  inputWithPrefix: { position: "relative" },
  prefix: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#555",
    fontSize: 14,
    fontWeight: 600,
    pointerEvents: "none",
    zIndex: 1,
  },
  dropZone: {
    border: "2px dashed",
    borderRadius: 12,
    padding: "36px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  uploadIcon: { display: "flex", justifyContent: "center", marginBottom: 12 },
  dropTitle: { fontWeight: 600, fontSize: 15, color: "#111", margin: "0 0 6px" },
  dropSubtitle: { fontSize: 13, color: "#888", margin: "0 0 16px" },
  browseBtn: {
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    color: "#333",
  },
  previewWrapper: {
    position: "relative",
    width: 60, height: 60,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: {
    width: "100%", height: "100%",
    objectFit: "cover",
  },
  removeImg: {
    position: "absolute",
    top: 2, right: 2,
    background: "rgba(0,0,0,0.55)",
    border: "none",
    color: "#fff",
    fontSize: 10,
    borderRadius: "50%",
    width: 16, height: 16,
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 0,
  },
  addMoreBtn: {
    background: "#f9fafb",
    cursor: "pointer",
    border: "1.5px dashed #d1d5db",
  },
  sizeCard: {
    border: "1.5px solid",
    borderRadius: 10,
    padding: "12px",
    transition: "all 0.15s",
  },
  submitBar: {
    background: "#fff",
    borderRadius: 16,
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    flexWrap: "wrap",
    gap: 12,
  },
  discardBtn: {
    background: "none",
    border: "none",
    fontSize: 15,
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
    padding: "10px 4px",
  },
  submitBtn: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    margin: 0,
  },
  toast: {
    position: "fixed",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 2000,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
};