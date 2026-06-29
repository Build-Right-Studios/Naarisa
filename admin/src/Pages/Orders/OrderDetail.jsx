import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrackingCard from "../../Components/TrackingCard.jsx";
import { BASE, ORDER } from "../../Constants/apiroutes.js";
import axios from "axios";

const BASE_URL = BASE.ROUTE;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatRupees(val) {
  return `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const STATUS_STYLES = {
  pending: { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" },
  processing: { background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
  shipped: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  delivered: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
  cancelled: { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;
  return (
    <span style={{
      ...s,
      padding: "5px 14px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingShipment, setCreatingShipment] = useState(false);

  // Shipment workflow states
  const [couriers, setCouriers] = useState(null);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [assigningCourier, setAssigningCourier] = useState(false);
  const [shipmentError, setShipmentError] = useState("");
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [dimensions, setDimensions] = useState({ length: "", breadth: "", height: "", weight: "" });

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isMonitor = width >= 1440;

  const token = localStorage.getItem("token");

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}${ORDER.BY_ID(id)}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data)
      if (data.success) setOrder(data.data);
      else setError(data.message || "Failed to load order.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCreateShipment = async () => {
    const { length, breadth, height, weight } = dimensions;
    if (!length || !breadth || !height || !weight) return;

    try {
      setCreatingShipment(true);
      setShipmentError("");
      setShowDimensionsModal(false);

      const response = await axios.post(
        `${BASE.ROUTE}${ORDER.CREATE_SHIPMENT(id)}`,
        { length: Number(length), breadth: Number(breadth), height: Number(height), weight: Number(weight) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrder((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          shipmentId: response.data.shipment_id,
          shiprocketOrderId: response.data.order_id,
          status: "shipment_created",
        },
      }));

      setCouriers(null);
      setSelectedCourierId(null);
      setDimensions({ length: "", breadth: "", height: "", weight: "" });
    } catch (err) {
      console.error(err);
      setShipmentError(err.response?.data?.message || "Unable to create shipment.");
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleLoadCouriers = async () => {
    try {
      setLoadingCouriers(true);
      setShipmentError("");

      const response = await axios.post(
        `${BASE.ROUTE}${ORDER.GET_COURIERS(id)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCouriers(response.data);
      setSelectedCourierId(null);
    } catch (err) {
      console.error(err);
      setShipmentError(
        err.response?.data?.message || "Unable to load couriers."
      );
    } finally {
      setLoadingCouriers(false);
    }
  };

  const handleAssignCourier = async () => {
    if (!selectedCourierId) {
      setShipmentError("Please select a courier.");
      return;
    }

    try {
      setAssigningCourier(true);
      setShipmentError("");

      const response = await axios.post(
        `${BASE.ROUTE}${ORDER.ASSIGN_COURIER(id)}`,
        { courierId: selectedCourierId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const awbCode = response.data.response?.data?.awb_code;
      const courierName = response.data.response?.data?.courier_name;

      // Update order with AWB and courier details
      setOrder((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          awbCode,
          courierId: selectedCourierId,
          courierName,
          status: "awb_generated",
        },
      }));

      // Clear couriers
      setCouriers(null);
      setSelectedCourierId(null);
    } catch (err) {
      console.error(err);
      setShipmentError(
        err.response?.data?.message || "Unable to assign courier."
      );
    } finally {
      setAssigningCourier(false);
    }
  };

  const pagePadding = isMobile
    ? "24px 16px"
    : isTablet
      ? "28px 28px"
      : isMonitor
        ? "48px 64px"
        : "40px 48px";

  if (loading)
    return (
      <div
        style={{
          ...D.page,
          padding: pagePadding,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={D.loadingText}>Loading order…</div>
      </div>
    );

  if (error || !order)
    return (
      <div style={{ ...D.page, padding: pagePadding }}>
        <button style={D.backBtn} onClick={() => navigate("/orders")}>
          ← Back to Orders
        </button>
        <p style={{ color: "#ef4444", marginTop: 32 }}>
          {error || "Order not found."}
        </p>
      </div>
    );

  const customer = order.user || {};
  const items = order.items || [];
  const address = order.address || {};
  const pricing = order.pricing || {};
  const payment = order.payment || {};
  const delivery = order.delivery || {};
  const coupon = order.coupon || null;
  const subtotal =
    pricing.subtotal ||
    items.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);
  const discount = pricing.discount || 0;
  const total = pricing.total || subtotal;

  // Check shipment status
  const hasShipment = delivery.shipmentId;
  const isAwbGenerated = delivery.status === "awb_generated";

  return (
    <div style={{ ...D.page, padding: pagePadding }}>
      {/* Back + Header */}
      <button style={D.backBtn} onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0,
          margin: "20px 0 28px",
        }}
      >
        <div>
          <h1 style={{ ...D.title, fontSize: isMobile ? 22 : 28 }}>
            Order #{order.customOrderId || id.slice(-6).toUpperCase()}
          </h1>
          <p style={D.subtitle}>Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <StatusBadge status={order.status} />
          {!hasShipment && (
            <button
              style={D.shipmentBtn}
              onClick={() => setShowDimensionsModal(true)}
              disabled={creatingShipment}
            >
              <TruckIcon /> {creatingShipment ? "Creating..." : "Create Shipment"}
            </button>
          )}
          {hasShipment && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#f0fdf4",
                borderRadius: 10,
                border: "1px solid #bbf7d0",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>
                ✓ Shipment Created
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid layout: 2 cols on laptop+, 1 col on mobile/tablet */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 340px",
          gap: 20,
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Order Items */}
          <div style={D.card}>
            <h2 style={D.cardTitle}>Order Items</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={D.table}>
                <thead>
                  <tr>
                    <th style={D.th}>Product</th>
                    <th style={{ ...D.th, textAlign: "right" }}>Qty</th>
                    <th style={{ ...D.th, textAlign: "right" }}>Price</th>
                    <th style={{ ...D.th, textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={D.emptyCell}>
                        No items found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={i} style={D.tr}>
                        <td style={D.td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                  background: "#f3f4f6",
                                }}
                              />
                            ) : (
                              <div style={D.imgPlaceholder}>
                                <BoxIcon />
                              </div>
                            )}
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#111",
                                }}
                              >
                                {item.productName || "Product"}
                              </div>
                              {(item.variantName || item.size) && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginTop: 2,
                                  }}
                                >
                                  {[item.variantName, item.size]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            ...D.td,
                            textAlign: "right",
                            fontSize: 14,
                          }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          style={{
                            ...D.td,
                            textAlign: "right",
                            fontSize: 14,
                          }}
                        >
                          {formatRupees(item.priceAtOrder)}
                        </td>
                        <td
                          style={{
                            ...D.td,
                            textAlign: "right",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {formatRupees(item.priceAtOrder * item.quantity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Price summary */}
            <div style={D.priceSummary}>
              <PriceLine label="Subtotal" value={formatRupees(subtotal)} />
              {discount > 0 && (
                <PriceLine
                  label={
                    coupon ? `Discount (${coupon.code})` : "Discount"
                  }
                  value={`- ${formatRupees(discount)}`}
                  valueColor="#16a34a"
                />
              )}

              <div style={D.divider} />
              <PriceLine label="Total" value={formatRupees(total)} bold />
            </div>
          </div>

          {/* Payment Info */}
          {payment.razorpayOrderId && (
            <div style={D.card}>
              <h2 style={D.cardTitle}>Payment</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <InfoRow label="Method" value="Razorpay" />
                <InfoRow label="Status" value={payment.status || "—"} />
                {payment.razorpayOrderId && (
                  <InfoRow
                    label="Order ID"
                    value={payment.razorpayOrderId}
                    mono
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Customer */}
          <div style={D.card}>
            <h2 style={D.cardTitle}>Customer</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  ...D.avatar,
                  background: avatarColor(customer.name || "U"),
                }}
              >
                {(customer.name || "U")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#111",
                  }}
                >
                  {customer.name || "—"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    marginTop: 2,
                  }}
                >
                  {customer.email || "—"}
                </div>
              </div>
            </div>
            {customer.phone && (
              <InfoRow label="Phone" value={customer.phone} />
            )}
          </div>

          {/* Shipping Address */}
          {Object.keys(address).length > 0 && (
            <div style={D.card}>
              <h2 style={D.cardTitle}>Shipping Address</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {address.name && <InfoRow label="Name" value={address.name} />}
                {address.line1 && (
                  <InfoRow label="Address" value={address.line1} />
                )}
                {address.line2 && <InfoRow label="" value={address.line2} />}
                {address.city && <InfoRow label="City" value={address.city} />}
                {address.state && (
                  <InfoRow label="State" value={address.state} />
                )}
                {address.pincode && (
                  <InfoRow label="Pincode" value={address.pincode} />
                )}
                {address.country && (
                  <InfoRow label="Country" value={address.country} />
                )}
                {address.phone && (
                  <InfoRow label="Phone" value={address.phone} />
                )}
              </div>
            </div>
          )}

          {/* Order Info */}
          <div style={D.card}>
            <h2 style={D.cardTitle}>Order Info</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow
                label="Order ID"
                value={`${order.customOrderId || id.slice(-6).toUpperCase()}`}
              />
              <InfoRow label="Placed" value={formatDate(order.createdAt)} />
              {order.updatedAt && (
                <InfoRow label="Updated" value={formatDate(order.updatedAt)} />
              )}
              <InfoRow
                label="Delivery"
                value={delivery.status?.replace(/_/g, " ") || "—"}
              />
              {coupon && (
                <InfoRow
                  label="Coupon"
                  value={`${coupon.code} (-₹${coupon.discountAmount})`}
                />
              )}
            </div>
          </div>

          {/* Shipping Card - Dynamic based on status */}
          {hasShipment && (
            <ShippingCard
              delivery={delivery}
              couriers={couriers}
              selectedCourierId={selectedCourierId}
              onSelectCourier={setSelectedCourierId}
              onLoadCouriers={handleLoadCouriers}
              onAssignCourier={handleAssignCourier}
              loadingCouriers={loadingCouriers}
              assigningCourier={assigningCourier}
              error={shipmentError}
              onDismissError={() => setShipmentError("")}
            />
          )}

          {hasShipment && (
            <TrackingCard
              delivery={delivery}
              token={token}
              orderId={id}
            />
          )}
        </div>
      </div>
      <DimensionsModal
        open={showDimensionsModal}
        onClose={() => setShowDimensionsModal(false)}
        dimensions={dimensions}
        onChange={(key, val) => setDimensions(prev => ({ ...prev, [key]: val }))}
        onSubmit={handleCreateShipment}
        loading={creatingShipment}
      />
    </div>
  );
}

// ─── Shipping Card Component ───────────────────────────────────────────────────
function ShippingCard({
  delivery,
  couriers,
  selectedCourierId,
  onSelectCourier,
  onLoadCouriers,
  onAssignCourier,
  loadingCouriers,
  assigningCourier,
  error,
  onDismissError,
}) {
  const isAwbGenerated = delivery.status === "awb_generated";

  return (
    <div style={D.card}>
      <h2 style={D.cardTitle}>Shipping</h2>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "#b91c1c",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
            }}
            onClick={onDismissError}
          >
            ×
          </button>
        </div>
      )}

      {/* State 1: Shipment Created, No Courier Selected */}
      {!isAwbGenerated && !couriers && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InfoRow label="Status" value="Shipment Created" />
          <InfoRow label="Shipment ID" value={delivery.shipmentId || "—"} />
          <button
            style={{
              ...D.courierBtn,
              background: loadingCouriers ? "#e5e7eb" : "#111",
              cursor: loadingCouriers ? "not-allowed" : "pointer",
              opacity: loadingCouriers ? 0.6 : 1,
            }}
            onClick={onLoadCouriers}
            disabled={loadingCouriers}
          >
            {loadingCouriers ? "Loading Couriers..." : "Load Couriers"}
          </button>
        </div>
      )}

      {/* State 2: Couriers Loaded, Awaiting Selection */}
      {!isAwbGenerated && couriers && couriers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InfoRow label="Status" value="Shipment Created" />
          <InfoRow label="Shipment ID" value={delivery.shipmentId || "—"} />

          <div style={{ marginTop: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 12,
              }}
            >
              Available Couriers
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {couriers.map((courier) => (
                <div
                  key={courier.courier_id}
                  style={{
                    border:
                      selectedCourierId === courier.courier_id
                        ? "2px solid #111"
                        : "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 12,
                    cursor: "pointer",
                    background:
                      selectedCourierId === courier.courier_id
                        ? "#f9fafb"
                        : "#fff",
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => onSelectCourier(courier.courier_id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <input
                      type="radio"
                      name="courier"
                      value={courier.id}
                      checked={selectedCourierId === courier.id}
                      onChange={() => onSelectCourier(courier.id)}
                      style={{ marginTop: 3, cursor: "pointer", flexShrink: 0 }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#111",
                          }}
                        >
                          {courier.courier_name}
                        </div>

                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#111",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ₹{courier.rate}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 8,
                          fontSize: 12,
                        }}
                      >
                        {courier.estimated_delivery_days && (
                          <span
                            style={{
                              background: "#eef2ff",
                              color: "#4338ca",
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontWeight: 500,
                            }}
                          >
                            ETA {courier.estimated_delivery_days} Days
                          </span>
                        )}

                        {courier.rating && (
                          <span
                            style={{
                              background: "#fffbeb",
                              color: "#b45309",
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontWeight: 500,
                            }}
                          >
                            ⭐ {Number(courier.rating).toFixed(1)}
                          </span>
                        )}

                        {courier.is_surface ? (
                          <span
                            style={{
                              background: "#ecfdf5",
                              color: "#047857",
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontWeight: 500,
                            }}
                          >
                            Surface
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontWeight: 500,
                            }}
                          >
                            Air
                          </span>
                        )}

                        {courier.realtime_tracking === "Real Time" && (
                          <span
                            style={{
                              background: "#f3f4f6",
                              color: "#374151",
                              padding: "4px 8px",
                              borderRadius: 999,
                              fontWeight: 500,
                            }}
                          >
                            Live Tracking
                          </span>
                        )}
                      </div>

                      {courier.reason && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            color: "#dc2626",
                          }}
                        >
                          {courier.reason.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            style={{
              ...D.courierBtn,
              background: assigningCourier ? "#e5e7eb" : "#111",
              cursor:
                assigningCourier || !selectedCourierId
                  ? "not-allowed"
                  : "pointer",
              opacity: assigningCourier || !selectedCourierId ? 0.6 : 1,
            }}
            onClick={onAssignCourier}
            disabled={assigningCourier || !selectedCourierId}
          >
            {assigningCourier ? "Assigning..." : "Assign Courier"}
          </button>
        </div>
      )}

      {/* State 3: AWB Generated */}
      {isAwbGenerated && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InfoRow label="Status" value="AWB Generated" />
          <InfoRow label="Courier" value={delivery.courierName || "—"} />
          <InfoRow label="AWB" value={delivery.awbCode || "—"} mono />
          {delivery.trackingUrl && (
            <InfoRow label="Tracking URL" value={delivery.trackingUrl} />
          )}
          {delivery.estimatedDelivery && (
            <InfoRow
              label="Est. Delivery"
              value={formatDate(delivery.estimatedDelivery)}
            />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <button style={D.actionBtn}>
              📄 Download Label
            </button>
            <button style={D.actionBtn}>
              📋 Download Invoice
            </button>
            <button style={D.actionBtn}>
              🔗 Track Shipment
            </button>
          </div>
        </div>
      )}

      {/* State 4: No Couriers Available */}
      {!isAwbGenerated && couriers && couriers.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InfoRow label="Status" value="Shipment Created" />
          <InfoRow label="Shipment ID" value={delivery.shipmentId || "—"} />
          <div
            style={{
              padding: 12,
              background: "#fef3c7",
              borderRadius: 8,
              color: "#92400e",
              fontSize: 13,
            }}
          >
            No couriers available for this location.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PriceLine({ label, value, bold, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span
        style={{
          fontSize: 14,
          color: bold ? "#111" : "#666",
          fontWeight: bold ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: bold ? 700 : 500,
          color: valueColor || (bold ? "#111" : "#333"),
        }}
      >
        {value}
      </span>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      {label ? (
        <span
          style={{
            fontSize: 12,
            color: "#888",
            minWidth: 80,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            paddingTop: 1,
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      ) : (
        <span style={{ minWidth: 80, flexShrink: 0 }} />
      )}
      <span
        style={{
          fontSize: 14,
          color: "#111",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#aaa"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 4v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

const AVATAR_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];

function avatarColor(name = "") {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function DimensionsModal({ open, onClose, dimensions, onChange, onSubmit, loading }) {
  if (!open) return null;

  const fields = [
    { key: "length", label: "Length", placeholder: "30", unit: "cm" },
    { key: "breadth", label: "Breadth", placeholder: "25", unit: "cm" },
    { key: "height", label: "Height", placeholder: "5", unit: "cm" },
    { key: "weight", label: "Weight", placeholder: "0.7", unit: "kg", step: "0.1" },
  ];

  const allFilled = fields.every(f => dimensions[f.key]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: 0 }}>Package dimensions</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
          {fields.map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {f.label}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder={f.placeholder}
                  min="0.1"
                  step={f.step || "1"}
                  value={dimensions[f.key]}
                  onChange={e => onChange(f.key, e.target.value)}
                  style={{
                    width: "100%", border: "1px solid #e5e7eb", borderRadius: 8,
                    padding: "9px 36px 9px 12px", fontSize: 14, color: "#111",
                    outline: "none", fontFamily: "inherit",
                  }}
                />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#aaa", fontWeight: 600 }}>
                  {f.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "#aaa", marginBottom: 24 }}>
          Used to calculate shipping rates and select the right courier.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600, color: "#666", cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!allFilled || loading}
            style={{ flex: 2, background: !allFilled || loading ? "#e5e7eb" : "#111", border: "none", borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600, color: !allFilled || loading ? "#aaa" : "#fff", cursor: !allFilled || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
          >
            <TruckIcon />
            {loading ? "Creating..." : "Create shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const D = {
  page: {
    background: "#f5f5f7",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontWeight: 800,
    color: "#111",
    margin: 0,
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 16px",
    letterSpacing: "-0.2px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 380,
  },
  th: {
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.07em",
    color: "#888",
    textTransform: "uppercase",
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  tr: { borderBottom: "1px solid #f4f4f4" },
  td: { padding: "14px 12px", verticalAlign: "middle", color: "#111" },
  emptyCell: { textAlign: "center", padding: 32, color: "#aaa", fontSize: 14 },
  imgPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  priceSummary: {
    marginTop: 20,
    padding: "16px 0 0",
    borderTop: "1px solid #f0f0f0",
  },
  divider: {
    height: 1,
    background: "#e5e7eb",
    margin: "8px 0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  loadingText: {
    fontSize: 15,
    color: "#888",
  },
  shipmentBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  courierBtn: {
    width: "100%",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  actionBtn: {
    width: "100%",
    background: "#f3f4f6",
    color: "#111",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};