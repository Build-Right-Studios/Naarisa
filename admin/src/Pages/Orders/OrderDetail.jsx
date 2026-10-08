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

function ManualShipNotify({ order, token, onUpdated }) {
  const [awbCode, setAwbCode] = useState(order.delivery?.awbCode || "");
  const [trackingUrl, setTrackingUrl] = useState(order.delivery?.trackingUrl || "");
  const [courierName, setCourierName] = useState(order.delivery?.courierName || "");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSend = async () => {
    if (!awbCode.trim()) {
      setMsg({ type: "error", text: "Please enter the AWB number." });
      return;
    }
    setSending(true);
    setMsg(null);
    try {
      const res = await axios.patch(
        `${BASE.ROUTE}/api/order/${order._id}/mark-shipped`,
        { awbCode: awbCode.trim(), trackingUrl: trackingUrl.trim(), courierName: courierName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg({ type: "success", text: "Marked as shipped — SMS sent to customer." });
      onUpdated?.(res.data.data);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to send. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={D.card}>
      <h2 style={D.cardTitle}>Manual Shipment Notification</h2>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
        Enter shipment details from Shiprocket, then notify the customer via SMS.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="AWB Number *"
          value={awbCode}
          onChange={(e) => setAwbCode(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
        />
        <input
          type="text"
          placeholder="Courier name (optional)"
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
        />
        <input
          type="text"
          placeholder="Tracking URL (optional, for My Orders page)"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
        />
      </div>

      {msg && (
        <div style={{
          padding: "10px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13,
          background: msg.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: msg.type === "success" ? "#15803d" : "#b91c1c",
        }}>
          {msg.text}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        style={{
          width: "100%", padding: "10px 16px", borderRadius: 10, border: "none",
          background: sending ? "#e5e7eb" : "#111", color: sending ? "#aaa" : "#fff",
          fontSize: 14, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
        }}
      >
        {sending ? "Sending..." : "Mark Shipped & Notify Customer"}
      </button>
    </div>
  );
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
  const [modalStep, setModalStep] = useState("dimensions"); // "dimensions" | "couriers"
  const [rates, setRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedKey, setSelectedKey] = useState("auto");
  const [modalError, setModalError] = useState("");

  const courierKey = (c) => `${c.logistics}|${c.serviceType}`;

  const closeModal = () => {
    setShowDimensionsModal(false);
    setModalStep("dimensions");
    setRates(null);
    setSelectedKey("auto");
    setModalError("");
  };

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

  const handleGetRates = async () => {
    const { length, breadth, height, weight } = dimensions;
    if (!length || !breadth || !height || !weight) return;
    try {
      setLoadingRates(true);
      setModalError("");
      const res = await axios.post(
        `${BASE.ROUTE}${ORDER.GET_COURIERS(id)}`,
        { length: Number(length), breadth: Number(breadth), height: Number(height), weight: Number(weight) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = res.data.couriers || [];
      setRates(list);
      setSelectedKey(list.length ? courierKey(list[0]) : "auto"); // cheapest preselected
      setModalStep("couriers");
    } catch (err) {
      setModalError(err.response?.data?.message || "Unable to fetch courier rates.");
    } finally {
      setLoadingRates(false);
    }
  };

  const handleCreateShipment = async () => {
    const { length, breadth, height, weight } = dimensions;
    const chosen = rates?.find((c) => courierKey(c) === selectedKey);

    try {
      setCreatingShipment(true);
      setModalError("");
      const res = await axios.post(
        `${BASE.ROUTE}${ORDER.CREATE_SHIPMENT(id)}`,
        {
          length: Number(length), breadth: Number(breadth),
          height: Number(height), weight: Number(weight),
          logistics: chosen?.logistics || "",   // blank = auto-allocate
          sType: chosen?.serviceType || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const s = res.data.shipment;
      setOrder((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          provider: "ithink",
          shipmentId: s.shipmentId,
          providerOrderId: s.providerOrderId,
          awbCode: s.awbCode,
          trackingNumber: s.awbCode,
          courierName: s.courierName,
          trackingUrl: s.trackingUrl,
          package: s.package,
          status: "shipment_created",
        },
      }));
      setDimensions({ length: "", breadth: "", height: "", weight: "" });
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.message || "Unable to create shipment.");
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
          <div style={D.card}>
            <h2 style={D.cardTitle}>Payment</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow label="Mode" value={payment.mode || "Prepaid"} />
              <InfoRow
                label="Status"
                value={payment.mode === "COD" ? "Collect on delivery" : (payment.status || "—")}
              />

              {payment.mode === "COD" && (
                <InfoRow
                  label="To Collect"
                  value={`${formatRupees(payment.codAmount)} on delivery`}
                />
              )}

              {payment.mode === "PartialCOD" && (
                <>
                  <InfoRow
                    label="Advance Paid"
                    value={formatRupees(payment.advanceAmount)}
                  />
                  <InfoRow
                    label="To Collect"
                    value={`${formatRupees(payment.codAmount)} on delivery`}
                  />
                </>
              )}

              {payment.razorpayOrderId && (
                <InfoRow
                  label="Razorpay Order"
                  value={payment.razorpayOrderId}
                  mono
                />
              )}
              {payment.razorpayPaymentId && (
                <InfoRow
                  label="Razorpay Payment"
                  value={payment.razorpayPaymentId}
                  mono
                />
              )}
              {payment.paidAt && (
                <InfoRow label="Paid At" value={formatDateTime(payment.paidAt)} />
              )}
            </div>
          </div>
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
          {/* {hasShipment && (
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
          )} */}
          {hasShipment && <ShippingCard delivery={delivery} />}

          <ManualShipNotify
            order={order}
            token={token}
            onUpdated={(updatedOrder) => setOrder(updatedOrder)}
          />

          {hasShipment && (
            <TrackingCard
              delivery={delivery}
              token={token}
              orderId={id}
            />
          )}
        </div>
      </div>
      {/* <DimensionsModal
        open={showDimensionsModal}
        onClose={() => setShowDimensionsModal(false)}
        dimensions={dimensions}
        onChange={(key, val) => setDimensions(prev => ({ ...prev, [key]: val }))}
        onSubmit={handleCreateShipment}
        loading={creatingShipment}
      /> */}
      <ShipmentModal
        open={showDimensionsModal}
        step={modalStep}
        onClose={closeModal}
        dimensions={dimensions}
        onChange={(key, val) => setDimensions((prev) => ({ ...prev, [key]: val }))}
        onGetRates={handleGetRates}
        loadingRates={loadingRates}
        rates={rates}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        courierKey={courierKey}
        onBack={() => { setModalStep("dimensions"); setModalError(""); }}
        onSubmit={handleCreateShipment}
        creating={creatingShipment}
        error={modalError}
      />
    </div>
  );
}

// ─── Shipping Card Component ───────────────────────────────────────────────────
function ShippingCard({ delivery }) {
  return (
    <div style={D.card}>
      <h2 style={D.cardTitle}>Shipping</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <InfoRow label="Status" value={delivery.status?.replace(/_/g, " ") || "—"} />
        <InfoRow label="Courier" value={delivery.courierName || "—"} />
        <InfoRow label="AWB" value={delivery.awbCode || "—"} mono />
        <InfoRow label="Shipment ID" value={delivery.shipmentId || "—"} mono />
        {delivery.trackingUrl && <InfoRow label="Tracking" value={delivery.trackingUrl} />}
        {delivery.package && (
          <InfoRow
            label="Package"
            value={`${delivery.package.length}×${delivery.package.breadth}×${delivery.package.height} cm · ${delivery.package.weight} kg`}
          />
        )}
      </div>
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

// function DimensionsModal({ open, onClose, dimensions, onChange, onSubmit, loading }) {
//   if (!open) return null;

//   const fields = [
//     { key: "length", label: "Length", placeholder: "30", unit: "cm" },
//     { key: "breadth", label: "Breadth", placeholder: "25", unit: "cm" },
//     { key: "height", label: "Height", placeholder: "5", unit: "cm" },
//     { key: "weight", label: "Weight", placeholder: "0.7", unit: "kg", step: "0.1" },
//   ];

//   const allFilled = fields.every(f => dimensions[f.key]);

//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       zIndex: 1000, padding: 16,
//     }}>
//       <div style={{
//         background: "#fff", borderRadius: 16, padding: 28,
//         width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
//       }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
//           <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: 0 }}>Package dimensions</h2>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1 }}>×</button>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
//           {fields.map(f => (
//             <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//               <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                 {f.label}
//               </label>
//               <div style={{ position: "relative" }}>
//                 <input
//                   type="number"
//                   placeholder={f.placeholder}
//                   min="0.1"
//                   step={f.step || "1"}
//                   value={dimensions[f.key]}
//                   onChange={e => onChange(f.key, e.target.value)}
//                   style={{
//                     width: "100%", border: "1px solid #e5e7eb", borderRadius: 8,
//                     padding: "9px 36px 9px 12px", fontSize: 14, color: "#111",
//                     outline: "none", fontFamily: "inherit",
//                   }}
//                 />
//                 <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#aaa", fontWeight: 600 }}>
//                   {f.unit}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <p style={{ fontSize: 11, color: "#aaa", marginBottom: 24 }}>
//           Used to calculate shipping rates and select the right courier.
//         </p>

//         <div style={{ display: "flex", gap: 10 }}>
//           <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600, color: "#666", cursor: "pointer", fontFamily: "inherit" }}>
//             Cancel
//           </button>
//           <button
//             onClick={onSubmit}
//             disabled={!allFilled || loading}
//             style={{ flex: 2, background: !allFilled || loading ? "#e5e7eb" : "#111", border: "none", borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600, color: !allFilled || loading ? "#aaa" : "#fff", cursor: !allFilled || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
//           >
//             <TruckIcon />
//             {loading ? "Creating..." : "Create shipment"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// ─── Styles ───────────────────────────────────────────────────────────────────

function ShipmentModal({
  open, step, onClose, dimensions, onChange, onGetRates, loadingRates,
  rates, selectedKey, onSelect, courierKey, onBack, onSubmit, creating, error,
}) {
  if (!open) return null;

  const fields = [
    { key: "length", label: "Length", placeholder: "30", unit: "cm" },
    { key: "breadth", label: "Breadth", placeholder: "25", unit: "cm" },
    { key: "height", label: "Height", placeholder: "5", unit: "cm" },
    { key: "weight", label: "Weight", placeholder: "0.7", unit: "kg", step: "0.1" },
  ];
  const allFilled = fields.every((f) => dimensions[f.key]);

  const btnPrimary = (disabled) => ({
    flex: 2, border: "none", borderRadius: 10, padding: 10, fontSize: 14, fontWeight: 600,
    background: disabled ? "#e5e7eb" : "#111", color: disabled ? "#aaa" : "#fff",
    cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
  });
  const btnGhost = {
    flex: 1, background: "none", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: 10, fontSize: 14, fontWeight: 600, color: "#666", cursor: "pointer", fontFamily: "inherit",
  };

  const CourierOption = ({ k, title, right, sub, badges }) => (
    <div
      onClick={() => onSelect(k)}
      style={{
        border: selectedKey === k ? "2px solid #111" : "1px solid #e5e7eb",
        background: selectedKey === k ? "#f9fafb" : "#fff",
        borderRadius: 10, padding: 12, cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="radio" checked={selectedKey === k} onChange={() => onSelect(k)} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{title}</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{right}</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: "#888", marginTop: 6, marginLeft: 26 }}>{sub}</div>}
      {badges && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, marginLeft: 26, flexWrap: "wrap" }}>
          {badges.map((b) => (
            <span key={b} style={{ background: "#eef2ff", color: "#4338ca", padding: "3px 8px", borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: 0 }}>
            {step === "dimensions" ? "Package dimensions" : "Choose courier"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888" }}>×</button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {step === "dimensions" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
              {fields.map((f) => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number" placeholder={f.placeholder} min="0.1" step={f.step || "1"}
                      value={dimensions[f.key]} onChange={(e) => onChange(f.key, e.target.value)}
                      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 36px 9px 12px", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#aaa", marginBottom: 24 }}>
              Used to fetch live rates from all couriers serviceable for this pincode (max 10 kg).
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={btnGhost}>Cancel</button>
              <button onClick={onGetRates} disabled={!allFilled || loadingRates} style={btnPrimary(!allFilled || loadingRates)}>
                {loadingRates ? "Fetching rates..." : "Get courier rates"}
              </button>
            </div>
          </>
        )}

        {step === "couriers" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {rates?.map((c) => (
                <CourierOption
                  key={courierKey(c)}
                  k={courierKey(c)}
                  title={c.logistics}
                  right={`₹${c.rate}`}
                  badges={[
                    c.tat && `ETA ${c.tat} day${c.tat === "1" ? "" : "s"}`,
                    c.serviceType && c.serviceType,
                    c.zone && `Zone ${c.zone}`,
                  ].filter(Boolean)}
                />
              ))}
              <CourierOption
                k="auto"
                title="Auto-allocate"
                right="—"
                sub="Let iThink pick the courier based on your account settings"
              />
              {rates?.length === 0 && (
                <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8, color: "#92400e", fontSize: 13 }}>
                  No couriers returned for this pincode and payment mode. You can still try auto-allocate.
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onBack} style={btnGhost} disabled={creating}>Back</button>
              <button onClick={onSubmit} disabled={creating} style={btnPrimary(creating)}>
                {creating ? "Creating..." : "Create shipment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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