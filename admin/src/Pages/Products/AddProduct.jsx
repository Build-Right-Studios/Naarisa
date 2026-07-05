import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { BASE, PRODUCT } from "../../Constants/apiroutes.js";

const CATEGORIES = [
  "Dresses",
  "Short Kurti",
  "Long Kurti",
  "Kurti Sets"
];

const initialForm = {
  name: "",
  category: "",
  basePrice: "",
};

const BASE_URL = BASE.ROUTE;

// ─── Breakpoint hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return w;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isMonitor = width >= 1440;

  const pagePadding = isMobile ? "24px 16px" : isTablet ? "28px 28px" : isMonitor ? "48px 64px" : "40px 48px";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.category) return setError("Please select a category.");
    if (!form.basePrice) return setError("Base price is required.");

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}${PRODUCT.ADD_PRODUCT}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          basePrice: Number(form.basePrice),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized");
      }

      const data = await res.json();
      if (data.success) {
        showToast("Product published successfully!");
        setTimeout(() => navigate("/products"), 1200);
      } else {
        setError(data.message || "Failed to publish product.");
      }
    } catch (e) {
      console.error("Submit error:", e);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setSubmitting(false);
    }
  };

  const twoCol = !isMobile;

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
        <span style={S.breadcrumbCurrent}>ADD NEW PRODUCT</span>
      </div>

      {/* Title */}
      <h1 style={{ ...S.title, fontSize: isMobile ? 24 : 32, marginBottom: 28 }}>
        Create New Product
      </h1>

      {/* Row 1: General Info + Specifications */}
      <div style={{
        display: "grid",
        gridTemplateColumns: twoCol ? "1fr 320px" : "1fr",
        gap: 20,
        marginBottom: 20,
      }}>
        {/* General Information */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <EditIcon />
            <h2 style={S.cardTitle}>General Information</h2>
          </div>

          <Field label="Product Name">
            <input
              style={S.input}
              placeholder="e.g. Classic Silk Midi Dress"
              value={form.name}
              onChange={set("name")}
            />
          </Field>
        </div>

        {/* Specifications */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <TagIcon />
            <h2 style={S.cardTitle}>Specifications</h2>
          </div>

          <Field label="Category">
            <select
              style={S.input}
              value={form.category}
              onChange={set("category")}
            >
              <option value="">Select Category</option>

              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Base Price (INR)">
            <div style={S.inputWithPrefix}>
              <span style={S.prefix}>₹</span>
              <input
                style={{ ...S.input, paddingLeft: 28 }}
                type="number"
                min={0}
                placeholder="0.00"
                value={form.basePrice}
                onChange={set("basePrice")}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Error */}
      {error && <p style={{ ...S.errorText, textAlign: "center", marginBottom: 16 }}>{error}</p>}

      {/* Publish Button */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 40 }}>
        <button
          style={{
            ...S.publishBtn,
            width: isMobile ? "100%" : 340,
            opacity: submitting ? 0.7 : 1,
          }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Publishing…" : "PUBLISH PRODUCT"} <span style={{ fontSize: 18 }}>➤</span>
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
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
  breadcrumbLink: {
    color: "#888",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  breadcrumbSep: { color: "#bbb" },
  breadcrumbCurrent: {
    color: "#7c3aed",
    textTransform: "uppercase",
  },
  title: {
    fontWeight: 800,
    color: "#111",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111",
    margin: 0,
    letterSpacing: "-0.2px",
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
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#f2f2f5",
    fontSize: 15,
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
  },
  inputWithPrefix: { position: "relative" },
  prefix: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#555",
    fontSize: 15,
    fontWeight: 600,
    pointerEvents: "none",
    zIndex: 1,
  },
  publishBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "18px 32px",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "0.1em",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
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