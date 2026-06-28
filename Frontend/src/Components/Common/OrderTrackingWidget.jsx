import { useState, useEffect } from "react";
import axios from "axios";
import { BASE, ORDER } from "../../Constants/apiRoutes.js";

// ──── Customer Order Tracking Component ──────────────────────────────────────
export const OrderTrackingWidget = ({ orderId, initialStatus = "payment_pending", token }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Auto-fetch tracking on mount if order is shipped
        if (initialStatus !== "payment_pending" && initialStatus !== "confirmed") {
            fetchTracking();
        }
    }, [orderId]);

    const fetchTracking = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(
                `${BASE.ROUTE}${ORDER.GET_TRACKING(orderId)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTrackingData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load tracking");
            console.error("Tracking fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!trackingData) {
        return (
            <div
                style={{
                    backgroundColor: "#F9F3EB",
                    // border: "1px solid #E8DDD0",
                    padding: "16px 14px",
                    textAlign: "center",
                }}
            >
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#8C7B6B", margin: 0 }}>
                    {loading ? "Loading tracking information..." : error || "No tracking information available yet"}
                </p>
                {!loading && (
                    <button
                        onClick={fetchTracking}
                        style={{
                            marginTop: "10px",
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            padding: "6px 12px",
                            backgroundColor: "#AB721E",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                        }}
                    >
                        CHECK STATUS
                    </button>
                )}
            </div>
        );
    }

    const { status, awbCode, courierName, events = [], estimatedDelivery, lastUpdated } = trackingData;

    const statusMap = {
        shipment_created: { icon: "📦", label: "Shipment Created", color: "#1e40af" },
        awb_generated: { icon: "🏷️", label: "AWB Generated", color: "#1e40af" },
        pickup_requested: { icon: "📍", label: "Pickup Requested", color: "#92400e" },
        pickup_scheduled: { icon: "⏰", label: "Pickup Scheduled", color: "#92400e" },
        picked_up: { icon: "🚚", label: "Picked Up", color: "#92400e" },
        in_transit: { icon: "🚛", label: "In Transit", color: "#1e40af" },
        out_for_delivery: { icon: "📬", label: "Out for Delivery", color: "#065f46" },
        delivered: { icon: "✅", label: "Delivered", color: "#15803d" },
        delivery_failed: { icon: "❌", label: "Delivery Failed", color: "#991b1b" },
        rto_initiated: { icon: "↩️", label: "Return Initiated", color: "#92400e" },
        rto_delivered: { icon: "↩️", label: "Returned", color: "#991b1b" },
        cancelled: { icon: "✕", label: "Cancelled", color: "#991b1b" },
    };

    const currentStatusInfo = statusMap[status] || { icon: "❓", label: status, color: "#6b7280" };

    return (
        <div
            style={{
                backgroundColor: "#F9F3EB",
                overflow: "hidden",
                marginTop: 14,
            }}
        >
            {/* Header */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: "14px 16px",
                    backgroundColor: "#F9F3EB",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{currentStatusInfo.icon}</span>
                    <div>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                color: "#8C7B6B",
                                marginBottom: 2,
                            }}
                        >
                            DELIVERY STATUS
                        </p>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: currentStatusInfo.color,
                                margin: 0,
                            }}
                        >
                            {currentStatusInfo.label}
                        </p>
                    </div>
                </div>
                <span
                    style={{
                        color: "#8C7B6B",
                        fontSize: 16,
                        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                    }}
                >
                    ›
                </span>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div style={{ padding: "16px", borderTop: "1px solid #E8DDD0" }}>
                    {/* Courier & AWB */}
                    {courierName && (
                        <div style={{ marginBottom: 12 }}>
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    color: "#8C7B6B",
                                    marginBottom: 4,
                                }}
                            >
                                COURIER
                            </p>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#1f1b15", margin: 0 }}>
                                {courierName}
                            </p>
                        </div>
                    )}

                    {awbCode && (
                        <div style={{ marginBottom: 12 }}>
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    color: "#8C7B6B",
                                    marginBottom: 4,
                                }}
                            >
                                TRACKING NUMBER
                            </p>
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "13px",
                                    fontFamily: "monospace",
                                    color: "#1f1b15",
                                    margin: 0,
                                }}
                            >
                                {awbCode}
                            </p>
                        </div>
                    )}

                    {estimatedDelivery && (
                        <div style={{ marginBottom: 12 }}>
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    color: "#8C7B6B",
                                    marginBottom: 4,
                                }}
                            >
                                ESTIMATED DELIVERY
                            </p>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#1f1b15", margin: 0 }}>
                                {new Date(estimatedDelivery).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    )}

                    {lastUpdated && (
                        <div style={{ marginBottom: 16 }}>
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    color: "#8C7B6B",
                                    marginBottom: 4,
                                }}
                            >
                                LAST UPDATED
                            </p>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B", margin: 0 }}>
                                {new Date(lastUpdated).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    {events && events.length > 0 && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F5E6D0" }}>
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    color: "#8C7B6B",
                                    marginBottom: 12,
                                }}
                            >
                                TRACKING TIMELINE
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {events.slice(0, 5).map((event, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: 10 }}>
                                        <div
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                backgroundColor: idx === 0 ? "#AB721E" : "#E8DDD0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                fontSize: 12,
                                            }}
                                        >
                                            {idx === 0 ? "✓" : "✓"}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p
                                                style={{
                                                    fontFamily: "'Jost', sans-serif",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: "#1f1b15",
                                                    margin: "0 0 2px",
                                                }}
                                            >
                                                {event.activity || event.status}
                                            </p>
                                            <p
                                                style={{
                                                    fontFamily: "'Jost', sans-serif",
                                                    fontSize: "11px",
                                                    color: "#8C7B6B",
                                                    margin: 0,
                                                }}
                                            >
                                                {event.location && <span>{event.location} · </span>}
                                                <span>
                                                    {event.date
                                                        ? new Date(event.date).toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : "Date unknown"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {events.length > 5 && (
                                <p
                                    style={{
                                        fontFamily: "'Jost', sans-serif",
                                        fontSize: "11px",
                                        color: "#AB721E",
                                        margin: "10px 0 0",
                                        textAlign: "center",
                                    }}
                                >
                                    +{events.length - 5} more updates
                                </p>
                            )}
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={fetchTracking}
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: 16,
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            padding: "10px 14px",
                            backgroundColor: loading ? "#E8DDD0" : "#F9F3EB",
                            border: "1px solid #E8DDD0",
                            borderRadius: 6,
                            color: loading ? "#8C7B6B" : "#AB721E",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.target.style.backgroundColor = "#F5E6D0";
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.target.style.backgroundColor = "#F9F3EB";
                        }}
                    >
                        {loading ? "Refreshing..." : "🔄 REFRESH TRACKING"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderTrackingWidget;