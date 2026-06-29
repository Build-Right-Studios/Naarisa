import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE, ORDER } from "../../Constants/apiroutes.js";

const BASE_URL = BASE.ROUTE;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS_STYLES = {
  pending:    { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" },
  processing: { background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
  shipped:    { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  delivered:  { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
  cancelled:  { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;
  return (
    <span style={{
      ...s,
      padding: "4px 12px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

// ─── Breakpoint hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Orders() {
  const [tab, setTab]           = useState("active");
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage]         = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isMonitor = width >= 1440;

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = tab === "active" ? ORDER.ACTIVE : ORDER.DELIVERED;
      const res  = await fetch(`${BASE_URL}${url}?page=${page}&limit=10`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        console.log(data.orders)
        setOrders(data.orders || data.data || []);
        setTotalCount(data.totalOrders || data.count || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { fetchOrders(); }, [tab, page]);

  // ─── FETCH ALL ORDERS FOR EXPORT ───────────────────────────────────────────
  const fetchAllOrdersForExport = async () => {
    try {
      const url = tab === "active" ? ORDER.ACTIVE : ORDER.DELIVERED;
      const allOrders = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await fetch(`${BASE_URL}${url}?page=${currentPage}&limit=100`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success && data.orders?.length > 0) {
          allOrders.push(...data.orders);
          if (data.orders.length < 100) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      }

      return allOrders;
    } catch (e) {
      console.error("Error fetching all orders:", e);
      throw e;
    }
  };

  // ─── EXPORT CSV WITH ITEMS FLATTENED (ONE ROW PER ITEM) ─────────────────────
  const handleExportCSV = async () => {
    if (!orders.length) return;
    
    setExportLoading(true);
    try {
      const allOrders = await fetchAllOrdersForExport();
      
      if (allOrders.length === 0) {
        alert("No orders found to export");
        return;
      }

      const headers = [
        "Order ID",
        "Date",
        "Customer Name",
        "Email",
        "Phone",
        "Product Name",
        "Quantity",
        "Price Per Item",
        "Subtotal",
        "Discount",
        "Shipping",
        "Total",
        "Order Status",
        "Payment Status",
        "Delivery Status",
      ];
      
      // Flatten orders by items - create a row for each item
      const rows = [];
      let totalItems = 0;

      allOrders.forEach((o) => {
        const date = new Date(o.createdAt).toLocaleDateString("en-IN");
        const customerName = o.user?.name || "—";
        const email = o.user?.email || "—";
        const phone = o.user?.phone || "—";
        const subtotal = o.pricing?.subtotal || 0;
        const discount = o.pricing?.discount || 0;
        const shipping = o.pricing?.shippingCharge || 0;
        const total = o.pricing?.total || 0;
        const orderStatus = o.status || "—";
        const paymentStatus = o.payment?.status || "—";
        const deliveryStatus = o.delivery?.status || "—";

        // Create a row for each item in the order
        if (o.items && o.items.length > 0) {
          o.items.forEach((item) => {
            // Format product name as: {productName}-{variantName}
            const productName = `${item.productName}-${item.variantName}`;
            
            rows.push([
              o.customOrderId || o._id,
              date,
              customerName,
              email,
              phone,
              productName,
              item.quantity || 0,
              item.priceAtOrder || 0,
              subtotal,
              discount,
              shipping,
              total,
              orderStatus,
              paymentStatus,
              deliveryStatus,
            ]);
            totalItems++;
          });
        } else {
          // Fallback: if no items (shouldn't happen), create one row
          rows.push([
            o.customOrderId || o._id,
            date,
            customerName,
            email,
            phone,
            "—",
            0,
            0,
            subtotal,
            discount,
            shipping,
            total,
            orderStatus,
            paymentStatus,
            deliveryStatus,
          ]);
          totalItems++;
        }
      });
      
      const csv = [headers, ...rows]
        .map((r) =>
          r
            .map((cell) =>
              typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
                ? `"${cell.replace(/"/g, '""')}"`
                : cell
            )
            .join(",")
        )
        .join("\n");
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tab}-orders-all-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      alert(`✓ Successfully exported ${totalItems} items from ${allOrders.length} orders!`);
    } catch (e) {
      console.error("Export error:", e);
      alert("Failed to export orders. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // responsive
  const pagePadding  = isMobile ? "24px 16px" : isTablet ? "28px 28px" : isMonitor ? "48px 64px" : "40px 48px";
  const thPad        = isMobile ? "12px 10px" : "16px 20px";
  const tdPad        = isMobile ? "14px 10px" : "18px 20px";
  const showEmail    = !isMobile;
  const showItems    = !isMobile;
  const colCount     = 4 + (showEmail ? 0 : 0) + (showItems ? 1 : 0) + 2;

  return (
    <div style={{ ...S.page, padding: pagePadding }}>

      {/* Header */}
      <div style={{
        ...S.header,
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 4 : 0,
        marginBottom: isMobile ? 24 : 32,
      }}>
        <div>
          <h1 style={{ ...S.title, fontSize: isMobile ? 24 : isMonitor ? 38 : 32 }}>
            Order Management
          </h1>
          <p style={S.subtitle}>Track and curate your customer journey in real-time.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...S.tabRow, marginBottom: 24 }}>
        {[
          { key: "active",    label: "Active Orders" },
          { key: "delivered", label: "Delivered Orders" },
        ].map(({ key, label }) => (
          <button
            key={key}
            style={{
              ...S.tab,
              ...(tab === key ? S.tabActive : {}),
            }}
            onClick={() => setTab(key)}
          >
            {label}
            <span style={{
              ...S.tabCount,
              background: tab === key ? "#7c3aed" : "#e5e7eb",
              color:      tab === key ? "#fff" : "#666",
            }}>
              {tab === key ? totalCount : "—"}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <button style={S.filterBtn}>
          <CalendarIcon /> This Month
        </button>
        <button 
          style={{
            ...S.exportBtn,
            opacity: exportLoading ? 0.7 : 1,
            cursor: exportLoading ? "not-allowed" : "pointer",
          }} 
          onClick={handleExportCSV}
          disabled={exportLoading}
        >
          <DownloadIcon /> 
          {exportLoading ? "Exporting..." : `Export All CSV (${totalCount})`}
        </button>
      </div>

      {/* Table */}
      <div style={S.tableCard}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ ...S.table, minWidth: isMobile ? 520 : "100%" }}>
            <thead>
              <tr>
                <th style={{ ...S.th, padding: thPad }}>Order ID</th>
                <th style={{ ...S.th, padding: thPad }}>Date & Time</th>
                <th style={{ ...S.th, padding: thPad }}>Customer</th>
                {showItems && <th style={{ ...S.th, padding: thPad }}>Items</th>}
                <th style={{ ...S.th, padding: thPad }}>Total</th>
                <th style={{ ...S.th, padding: thPad }}>Status</th>
                <th style={{ ...S.th, padding: thPad }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colCount} style={S.emptyCell}>Loading orders…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={colCount} style={S.emptyCell}>No {tab} orders found.</td></tr>
              ) : orders.map((order) => {
                const { date, time } = formatDate(order.createdAt);
                const name  = order.user?.name || order.customerName || "Unknown";
                const email = order.user?.email || order.customerEmail || "";
                const initials = getInitials(name);
                const itemCount = order.items?.length || order.itemCount || 0;
                const total = order.pricing?.total || 0;

                return (
                  <tr key={order._id} style={S.tr}>
                    <td style={{ ...S.td, padding: tdPad, fontWeight: 700, color: "#111", fontSize: 14 }}>
                      {order.customOrderId}
                    </td>
                    <td style={{ ...S.td, padding: tdPad }}>
                      <div style={{ fontSize: 14, color: "#111" }}>{date}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{time}</div>
                    </td>
                    <td style={{ ...S.td, padding: tdPad }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ ...S.avatar, background: avatarColor(name) }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{name}</div>
                          {showEmail && (
                            <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {showItems && (
                      <td style={{ ...S.td, padding: tdPad }}>
                        <span style={S.itemsBadge}>
                          {itemCount} {itemCount === 1 ? "Item" : "Items"}
                        </span>
                      </td>
                    )}
                    <td style={{ ...S.td, padding: tdPad, fontWeight: 700, fontSize: 15, color: "#111" }}>
                      ₹{Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...S.td, padding: tdPad }}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ ...S.td, padding: tdPad }}>
                      <button
                        style={S.viewBtn}
                        onClick={() => navigate(`/orders/${order._id}`)}
                        title="View order"
                      >
                        <EyeIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div style={S.pagination}>
            <span style={{ fontSize: 13, color: "#888" }}>
              Page {page} · {totalCount} total orders
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ ...S.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <button
                style={{ ...S.pageBtn, opacity: orders.length < 10 ? 0.4 : 1 }}
                onClick={() => setPage((p) => p + 1)}
                disabled={orders.length < 10}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Avatar color from name ───────────────────────────────────────────────────
const AVATAR_COLORS = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#7c3aed","#0891b2"];
function avatarColor(name = "") {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
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
  tabRow: {
    display: "flex",
    gap: 0,
    borderBottom: "2px solid #e5e7eb",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 4px",
    marginRight: 28,
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    fontSize: 15,
    fontWeight: 600,
    color: "#888",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabActive: {
    color: "#7c3aed",
    borderBottomColor: "#7c3aed",
  },
  tabCount: {
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    cursor: "pointer",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
  },
  tableCard: {
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#888",
    background: "#fafafa",
    borderBottom: "1px solid #eee",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { color: "#111", verticalAlign: "middle" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  itemsBadge: {
    background: "#f3f4f6",
    color: "#374151",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 6,
    whiteSpace: "nowrap",
  },
  viewBtn: {
    background: "#111",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: 8,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  emptyCell: {
    textAlign: "center",
    padding: 48,
    color: "#aaa",
    fontSize: 14,
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderTop: "1px solid #f0f0f0",
    flexWrap: "wrap",
    gap: 10,
  },
  pageBtn: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: "#333",
  },
};