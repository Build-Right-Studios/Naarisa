import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { BASE, PRODUCT } from "../../Constants/apiroutes.js";

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

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextarea({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    bullets: false,
  });

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const syncContent = () => {
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      bullets: document.queryCommandState("insertUnorderedList"),
    });
  };

  const exec = (cmd) => {
    editorRef.current?.focus();
    if (cmd === "bullets") {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const li = (container.nodeType === 3 ? container.parentNode : container).closest?.("li");
      if (li) {
        const ul = li.closest("ul");
        if (ul) {
          const fragment = document.createDocumentFragment();
          ul.querySelectorAll("li").forEach((item, i) => {
            if (i > 0) fragment.appendChild(document.createElement("br"));
            fragment.appendChild(document.createTextNode(item.textContent));
          });
          ul.replaceWith(fragment);
        }
      } else {
        document.execCommand("insertUnorderedList", false, null);
      }
    } else {
      document.execCommand(cmd, false, null);
    }
    syncContent();
  };

  const toolbarBtns = [
    { key: "bold", cmd: "bold", label: "B", extraStyle: { fontWeight: 700 } },
    { key: "italic", cmd: "italic", label: "I", extraStyle: { fontStyle: "italic" } },
    { key: "underline", cmd: "underline", label: "U", extraStyle: { textDecoration: "underline" } },
    {
      key: "bullets", cmd: "bullets", extraStyle: {},
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="4" cy="7" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="17" r="1.5" fill="currentColor" stroke="none" />
          <line x1="9" y1="7" x2="21" y2="7" />
          <line x1="9" y1="12" x2="21" y2="12" />
          <line x1="9" y1="17" x2="21" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div style={S.richWrapper}>
      <div style={S.toolbar}>
        {toolbarBtns.map(({ key, cmd, label, icon, extraStyle }) => {
          const isActive = activeFormats[key];
          return (
            <button
              key={key}
              type="button"
              title={key}
              onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
              style={{
                ...S.toolbarBtn,
                ...extraStyle,
                background: isActive ? "#ede9fe" : "none",
                borderColor: isActive ? "#7c3aed" : "transparent",
                color: isActive ? "#7c3aed" : "#333",
              }}
            >
              {icon || label}
            </button>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        data-placeholder={placeholder}
        style={S.richEditor}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddVariant() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [parentProduct, setParentProduct] = useState("");
  const [sizes, setSizes] = useState(initialSizes);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#7c3aed");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");
  const stylingTips = "";
  const [fabricCare, setFabricCare] = useState("");
  const [returnExchange, setReturnExchange] = useState("");
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const productSearchRef = useRef(null);

  const token = localStorage.getItem("token");
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isMonitor = width >= 1440;
  const pagePadding = isMobile ? "24px 16px" : isTablet ? "28px 28px" : isMonitor ? "48px 64px" : "40px 48px";
  const twoCol = !isMobile;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}${PRODUCT.GET_PARENT_PRODUCTS}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log(data)
        if (data.success) setProducts(data.data || data.products || []);
      } catch (e) { console.error(e); }
    };
    fetchProducts();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addImages = (files) => {
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 10 * 1024 * 1024
    );
    const previews = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...previews].slice(0, 8));
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

  const handleSubmit = async () => {
    setError("");
    if (!parentProduct) return setError("Please select a parent product.");
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
      formData.append("description", description);
      formData.append("stylingTips", "");
      formData.append("fabricCare", fabricCare);
      formData.append("returnExchange", returnExchange);
      formData.append("isBestSeller", isBestSeller);
      formData.append("isNewArrival", isNewArrival);

      const sizeStock = enabledSizes.map((s) => ({ size: s, stock: sizes[s].stock }));
      formData.append("sizes", JSON.stringify(sizeStock));

      images.forEach((img) => formData.append("images", img.file));

      const res = await fetch(`${BASE_URL}${PRODUCT.ADD_NEW_VARIANT}`, {
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

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

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Variant Media */}
          <div style={S.card}>
            <SectionHeader icon={<ImageIcon />} label="VARIANT MEDIA" />
            <div
              style={{
                ...S.dropZone,
                borderColor: dragOver ? "#7c3aed" : "#d1d5db",
                background: dragOver ? "#f5f3ff" : "#fafafa",
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
              <p style={S.dropSubtitle}>Supports JPG, PNG, WEBP (Max 10MB)</p>
              <button
                style={S.browseBtn}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse Files
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} style={S.previewWrapper}>
                  <img src={img.preview} alt="" style={S.previewImg} />
                  <button style={S.removeImg} onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
              {images.length < 8 && images.length > 0 && (
                <div
                  style={{ ...S.previewWrapper, ...S.addMoreBtn }}
                  onClick={() => fileRef.current?.click()}
                >
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
                    style={{
                      opacity: 0,
                      position: "absolute",
                      inset: 0,
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                    }}
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

          {/* Product Visibility */}
          <div style={S.card}>
            <SectionHeader icon={<StockIcon />} label="PRODUCT VISIBILITY" />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <label style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  style={S.checkbox}
                />
                <span>
                  <strong>Best Seller</strong>
                  <div style={S.checkboxHint}>
                    Show this variant in Best Sellers section.
                  </div>
                </span>
              </label>

              <label style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  style={S.checkbox}
                />
                <span>
                  <strong>New Arrival</strong>
                  <div style={S.checkboxHint}>
                    Show this variant in New Arrivals section.
                  </div>
                </span>
              </label>

            </div>
          </div>

          {/* Description */}
          <div style={S.card}>
            <SectionHeader icon={<EditIcon />} label="DESCRIPTION" />
            <RichTextarea
              value={description}
              onChange={setDescription}
              placeholder="Briefly describe the product's aesthetic and fit..."
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Product Association + Sizes */}
          <div style={{ marginBottom: 24, position: "relative" }}>
            <label style={S.label}>SELECT PARENT PRODUCT</label>

            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", color: "#9ca3af",
                fontSize: 16, pointerEvents: "none", zIndex: 1,
              }}>
                🔍
              </span>
              <input
                ref={productSearchRef}
                style={{ ...S.input, paddingLeft: 36 }}
                placeholder="Search products…"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductDropdownOpen(true);
                  if (!e.target.value) setParentProduct("");
                }}
                onFocus={() => setProductDropdownOpen(true)}
                onBlur={() => setTimeout(() => setProductDropdownOpen(false), 150)}
              />
              {parentProduct && (
                <button
                  style={{
                    position: "absolute", right: 10, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setParentProduct("");
                    setProductSearch("");
                    productSearchRef.current?.focus();
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {productDropdownOpen && filteredProducts.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                zIndex: 100, background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 10, marginTop: 4, maxHeight: 220, overflowY: "auto",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onMouseDown={() => {
                      setParentProduct(p.id);
                      setProductSearch(p.name);
                      setProductDropdownOpen(false);
                    }}
                    style={{
                      padding: "10px 14px", fontSize: 14, cursor: "pointer",
                      color: "#111", borderBottom: "0.5px solid #f0f0f0",
                      background: parentProduct === p.id ? "#f5f3ff" : "#fff",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = parentProduct === p.id ? "#f5f3ff" : "#fff"}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}

            {productDropdownOpen && productSearch && filteredProducts.length === 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                zIndex: 100, background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 10, marginTop: 4, padding: "12px 14px",
                fontSize: 13, color: "#888",
              }}>
                No products found for "{productSearch}"
              </div>
            )}

            {parentProduct && (
              <p style={{ fontSize: 12, color: "#7c3aed", marginTop: 6, fontWeight: 600 }}>
                ✓ Selected
              </p>
            )}
          </div>

          {/* Editorial Details */}
          <div style={S.card}>
            <SectionHeader icon={<BookIcon />} label="EDITORIAL DETAILS" />

            {/* <div style={{ marginBottom: 16 }}>
              <label style={S.label}>STYLING TIPS</label>
              <RichTextarea
                value={stylingTips}
                onChange={setStylingTips}
                placeholder="Provide detailed advice on how to wear this piece..."
              />
            </div> */}

            <div>
              <label style={S.label}>FABRIC & CARE</label>
              <RichTextarea
                value={fabricCare}
                onChange={setFabricCare}
                placeholder="Elaborate maintenance and cleaning instructions..."
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={S.label}>RETURN & EXCHANGE</label>
              <RichTextarea
                value={returnExchange}
                onChange={setReturnExchange}
                placeholder="Describe return eligibility, exchange process, timelines..."
              />
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
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function AssocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function StockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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
  breadcrumbSep: { color: "#bbb" },
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
  // Rich text editor
  richWrapper: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    gap: 4,
    padding: "6px 8px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  toolbarBtn: {
    border: "1px solid transparent",
    borderRadius: 6,
    width: 30,
    height: 28,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.12s, border-color 0.12s, color 0.12s",
    fontFamily: "'Segoe UI', sans-serif",
    padding: 0,
    lineHeight: 1,
  },
  richEditor: {
    minHeight: 110,
    padding: "10px 14px",
    fontSize: 14,
    color: "#111",
    lineHeight: 1.6,
    outline: "none",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f2f2f5",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    cursor: "pointer",
    padding: "10px 0",
  },

  checkbox: {
    width: 18,
    height: 18,
    marginTop: 2,
    cursor: "pointer",
  },

  checkboxHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
};