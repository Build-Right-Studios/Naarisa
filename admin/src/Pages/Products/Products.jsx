import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE, PRODUCT } from "../../Constants/apiroutes.js";

const BASE_URL = BASE.ROUTE;

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isMonitor = width >= 1440;
  const pagePadding = isMobile ? "20px 16px" : isTablet ? "24px 28px" : isMonitor ? "40px 64px" : "32px 48px";

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}${PRODUCT.GET_PRODUCTS}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized");
      }

      const data = await res.json();
      console.log("API response:", data);

      if (data.success) {
        const list = data.data?.products || data.data || data.products || [];
        console.log("List : ", list);
        setProducts(list);
      } else {
        showToast(data.message || "Failed to load products.", "error");
      }
    } catch (e) {
      console.error("Fetch error:", e);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/variant/${id}/deactivate`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
        showToast(`"${name}" deactivated.`);
      } else {
        showToast(data.message || "Failed.", "error");
      }
    } catch {
      showToast("Action failed.", "error");
    }
  };

  const filtered = (products || []).filter((p) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      (p.productName || p.name || "").toLowerCase().includes(searchText) ||
      (p.category || "").toLowerCase().includes(searchText) ||
      (p.color?.name || "").toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "all" ? true
        : filter === "published" ? p.isActive !== false
          : filter === "draft" ? p.isActive === false
            : true;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 text-lg">
        Loading Products...
      </div>
    );
  }

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

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 16 : 0,
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{ ...S.title, fontSize: isMobile ? 26 : isMonitor ? 36 : 32 }}>
            Products
          </h1>
        </div>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          width: isMobile ? "100%" : "auto",
        }}>
          <button
            style={{ ...S.variantBtn, width: isMobile ? "100%" : "auto" }}
            onClick={() => navigate("/add-variant")}
          >
            <span style={{ fontSize: 16 }}>+</span> Add New Variant
          </button>
          <button
            style={{ ...S.newProductBtn, width: isMobile ? "100%" : "auto" }}
            onClick={() => navigate("/add-product")}
          >
            <span style={{ fontSize: 16 }}>+</span> New Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={S.searchBox}>
          <SearchSmIcon color="#aaa" />
          <input
            style={S.searchInput}
            placeholder="Search by name or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={S.filterWrapper}>
          <select
            style={S.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Variants</option>
            <option value="published">Active</option>
            <option value="draft">Inactive</option>
          </select>
          <span style={S.filterArrow}>▾</span>
        </div>
      </div>

      {/* Table */}
      <div style={S.tableCard}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ ...S.table, minWidth: isMobile ? 520 : "100%" }}>
            <thead>
              <tr>
                <th style={S.th}>Product</th>
                <th style={S.th}>Color</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Price</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={S.emptyCell}>
                    No variants found.
                  </td>
                </tr>
              ) : filtered.map((p) => {
                // Resolve image — variant can have images array or image string
                const imageUrl =
                  p.images?.[0]?.url ||
                  p.image?.url ||
                  p.image ||
                  null;

                // Resolve name — from variant response mapping
                const displayName = p.productName || p.name || "—";

                // Resolve price
                const displayPrice = p.price ?? p.discountPrice ?? 0;

                return (
                  <tr key={p.id} style={S.tr}>

                    {/* Product */}
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={S.productImg}>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={displayName}
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <BoxIcon />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
                            {displayName}
                          </div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                            {p.category || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Color */}
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {p.color?.hex && (
                          <div style={{
                            width: 14, height: 14,
                            borderRadius: "50%",
                            background: p.color.hex,
                            border: "1px solid #e5e7eb",
                            flexShrink: 0
                          }} />
                        )}
                        <span style={{ fontSize: 13, textTransform: "capitalize" }}>
                          {p.color?.name || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={S.td}>
                      <span style={{
                        ...S.statusBadge,
                        background: p.isActive !== false ? "#dcfce7" : "#f3f4f6",
                        color: p.isActive !== false ? "#16a34a" : "#888",
                      }}>
                        {p.isActive !== false ? "✓ Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ ...S.td, fontWeight: 700, fontSize: 15 }}>
                      ₹{Number(displayPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <ActionBtn
                          title="Edit"
                          onClick={() => navigate(`/update-varient/${p.id}`)}
                        >
                          <PencilIcon />
                        </ActionBtn>
                        <ActionBtn
                          title="View"
                          onClick={() => navigate(`/products/${p.id}`)}
                        >
                          <EyeIcon />
                        </ActionBtn>
                        <ActionBtn
                          title="Deactivate"
                          onClick={() => handleDeactivate(p.id, displayName)}
                        >
                          <TrashIcon />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ActionBtn({ children, onClick, title }) {
  return (
    <button style={S.actionBtn} onClick={onClick} title={title}>
      {children}
    </button>
  );
}
function SearchSmIcon({ color = "#666" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="9" y2="18" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: { background: "#f5f5f7", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box" },
  title: { fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.5px" },
  variantBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: "#7c3aed", border: "1.5px solid #7c3aed", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  newProductBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 14px", minWidth: 220, flex: 1, maxWidth: 360 },
  searchInput: { border: "none", outline: "none", fontSize: 14, color: "#111", width: "100%", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  filterWrapper: { position: "relative" },
  filterSelect: { padding: "9px 36px 9px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, color: "#333", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none", fontFamily: "'Segoe UI', sans-serif", fontWeight: 500 },
  filterArrow: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 12, pointerEvents: "none" },
  tableCard: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#888", padding: "14px 20px", background: "#fafafa", borderBottom: "1px solid #eee", textTransform: "uppercase", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "18px 20px", verticalAlign: "middle", color: "#111" },
  productImg: { width: 52, height: 52, borderRadius: 8, background: "#f3f4f6", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  actionBtn: { background: "none", border: "none", cursor: "pointer", color: "#555", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" },
  emptyCell: { textAlign: "center", padding: 48, color: "#aaa", fontSize: 14 },
  toast: { position: "fixed", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 2000, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
};