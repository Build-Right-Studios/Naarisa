import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE, ADMIN_USERS } from "../../Constants/apiroutes.js";

const statusConfig = {
  payment_pending: { label: "Pending",   bg: "#F1EFE8", color: "#5F5E5A" },
  confirmed:       { label: "Confirmed", bg: "#E6F1FB", color: "#185FA5" },
  dispatched:      { label: "Dispatched",bg: "#FAEEDA", color: "#854F0B" },
  delivered:       { label: "Delivered", bg: "#EAF3DE", color: "#3B6D11" },
  cancelled:       { label: "Cancelled", bg: "#FCEBEB", color: "#A32D2D" },
};

const paymentConfig = {
  paid:    { label: "Paid",    bg: "#EAF3DE", color: "#3B6D11" },
  pending: { label: "Pending", bg: "#F1EFE8", color: "#5F5E5A" },
  failed:  { label: "Refunded",bg: "#FCEBEB", color: "#A32D2D" },
};

const MetricCard = ({ label, value, purple }) => (
  <div style={{
    flex: 1,
    background: purple ? "#7C3AED" : "var(--color-background-primary)",
    border: purple ? "none" : "0.5px solid var(--color-border-tertiary)",
    borderRadius: "12px",
    padding: "1.25rem",
    position: "relative",
    overflow: "hidden"
  }}>
    <p style={{ fontSize: "12px", fontWeight: 500, color: purple ? "rgba(255,255,255,0.7)" : "var(--color-text-tertiary)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
    </p>
    <p style={{ fontSize: "28px", fontWeight: 600, color: purple ? "#fff" : "var(--color-text-primary)", margin: 0 }}>
      {value}
    </p>
  </div>
);

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE.ROUTE}${ADMIN_USERS.GET_BY_ID(id)}`);
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return (
    <div style={{ padding: "2rem", color: "var(--color-text-secondary)", fontSize: "14px" }}>
      Loading customer...
    </div>
  );

  if (!data) return (
    <div style={{ padding: "2rem", color: "var(--color-text-danger)", fontSize: "14px" }}>
      Customer not found
    </div>
  );

  const { user, orders, totalOrders, totalSpent } = data;

  return (
    <div style={{ padding: "2rem" }}>

      {/* Back Button */}
      <button
        onClick={() => navigate("/customers")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--color-text-secondary)",
          fontSize: "13px",
          marginBottom: "1.5rem",
          padding: 0
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to customers
      </button>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: "0 0 6px", color: "var(--color-text-primary)" }}>
          {user.name}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
          <span>📞 +91 {user.phone}</span>
          {user.email && <>
            <span>•</span>
            <span>✉ {user.email}</span>
          </>}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "2rem" }}>
        <MetricCard label="Total Orders" value={totalOrders} />
        <MetricCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} purple />
        <MetricCard
          label="Member Since"
          value={new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        />
      </div>

      {/* Saved Addresses */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 1rem", color: "var(--color-text-primary)" }}>
          Saved addresses
        </h2>

        {user.addresses?.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>No saved addresses</p>
        ) : (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {user.addresses.map(addr => (
              <div key={addr._id} style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                minWidth: "260px",
                maxWidth: "320px"
              }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <span style={{
                    fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-secondary)", fontWeight: 500
                  }}>
                    {addr.label?.toUpperCase()}
                  </span>
                  {addr.isDefault && (
                    <span style={{
                      fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
                      background: "#EDE9FE", color: "#6D28D9", fontWeight: 500
                    }}>
                      DEFAULT
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 2px", color: "var(--color-text-primary)" }}>
                  {addr.name}
                </p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 2px" }}>
                  {addr.phone}
                </p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 1rem", color: "var(--color-text-primary)" }}>
          Order history
        </h2>

        {orders?.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>No orders yet</p>
        ) : (
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  {["Order ID", "Date", "Items", "Total", "Payment Status", "Order Status"].map(col => (
                    <th key={col} style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "var(--color-text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em"
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const orderStatus = statusConfig[order.status] || statusConfig.payment_pending;
                  const payStatus = paymentConfig[order.payment?.status] || paymentConfig.pending;
                  return (
                    <tr
                      key={order._id}
                      style={{
                        borderBottom: i < orders.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                        cursor: "pointer"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        #{order._id.slice(-4).toUpperCase()}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        {order.items?.length} items
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        ₹{order.pricing?.total?.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 500, padding: "4px 10px",
                          borderRadius: "20px",
                          background: payStatus.bg,
                          color: payStatus.color
                        }}>
                          {payStatus.label.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 500, padding: "4px 10px",
                          borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "5px",
                          background: orderStatus.bg,
                          color: orderStatus.color
                        }}>
                          <span style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            background: orderStatus.color, flexShrink: 0
                          }}/>
                          {orderStatus.label.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;