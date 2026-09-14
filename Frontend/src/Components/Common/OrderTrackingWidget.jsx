import { useState } from "react";
import api from "../../utils/axiosInstance.js";
import { ORDER } from "../../Constants/apiRoutes.js";

export const OrderTrackingWidget = ({ orderId }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(false);

    const fetchTracking = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get(ORDER.ORDER_TRACK(orderId));
            if (res.data.success) {
                setTrackingData(res.data.tracking || res.data.data);
                setExpanded(true);
            } else {
                setError(res.data.message || "Failed to load tracking");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to load tracking";

            // CASE 1: Your backend returns "No tracking for AWB..." -> treat as pending, not error
            if (msg.includes("No tracking for AWB")) {
                const awbMatch = msg.match(/AWB\s+(\d+)/);
                setTrackingData({
                    awbCode: awbMatch? awbMatch[1] : "",
                    currentStatus: "SHIPMENT_CREATED",
                    currentStatusText: "Shipped - Awaiting courier pickup",
                    courierName: "",
                    scans: [],
                    isPendingPickup: true,
                });
                setExpanded(true);
            } else {
                setError(msg);
            }
            console.error("Tracking fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!trackingData) {
        return (
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
                <button
                    onClick={fetchTracking}
                    disabled={loading}
                    style={{
                        padding: "11px 20px",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        border: "1px solid #4A3728",
                        backgroundColor: "#fff",
                        color: "#4A3728",
                        cursor: loading? "not-allowed" : "pointer",
                    }}
                >
                    {loading? "CHECKING..." : "SHOW TRACKING STATUS"}
                </button>
                {error && (
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4727A", maxWidth: 200 }}>
                        {error}
                    </p>
                )}
            </div>
        );
    }

    const { currentStatus, currentStatusText, awbCode, courierName, scans = [], isPendingPickup } = trackingData;

    return (
        <div style={{ backgroundColor: "#F9F3EB", overflow: "hidden", marginTop: 14 }}>
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
                <div>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#8C7B6B", marginBottom: 2 }}>
                        DELIVERY STATUS
                    </p>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 600, color: isPendingPickup? "#8C7B6B" : "#AB721E", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        {isPendingPickup && <span style={{ width: 6, height: 6, backgroundColor: "#F59E0B", borderRadius: "50%", display: "inline-block", animation: "pulse 1s infinite" }}></span>}
                        {currentStatusText || currentStatus || "Unknown"}
                    </p>
                </div>
                <span style={{ color: "#8C7B6B", fontSize: 16, transform: expanded? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
            </div>

            {expanded && (
                <div style={{ padding: "16px", borderTop: "1px solid #E8DDD0" }}>

                    {/* PENDING STATE - This fixes your screenshot */}
                    {isPendingPickup? (
                        <div style={{ padding: "12px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, marginBottom: 12 }}>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 600, color: "#92400E", margin: "0 0 4px" }}>
                                📦 AWB Generated: {awbCode}
                            </p>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#B45309", margin: 0, lineHeight: "1.4" }}>
                                Courier will pick up soon. Tracking will be live within 4-6 hours after first scan. No need to worry, your order is dispatched.
                            </p>
                        </div>
                    ) : null}

                    {courierName && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8C7B6B", marginBottom: 4 }}>COURIER</p>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#1f1b15", margin: 0 }}>{courierName}</p>
                        </div>
                    )}

                    {awbCode && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8C7B6B", marginBottom: 4 }}>TRACKING NUMBER</p>
                            <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#1f1b15", margin: 0 }}>{awbCode}</p>
                        </div>
                    )}

                    {scans.length > 0? (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F5E6D0" }}>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8C7B6B", marginBottom: 12 }}>TRACKING TIMELINE</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[...scans].reverse().slice(0, 5).map((s, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: 10 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: idx === 0? "#AB721E" : "#E8DDD0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, color: "#fff" }}>✓</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 600, color: "#1f1b15", margin: "0 0 2px" }}>{s.status || s.current_status}</p>
                                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", margin: 0 }}>{s.location && <span>{s.location} · </span>}<span>{s.date || s.updated_at || ""}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) :!isPendingPickup && (
                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", marginTop: 10 }}>No scans yet</p>
                    )}

                    <button
                        onClick={fetchTracking}
                        disabled={loading}
                        style={{
                            width: "100%", marginTop: 16,
                            fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
                            padding: "10px 14px", backgroundColor: "#F9F3EB", border: "1px solid #E8DDD0", borderRadius: 6, color: "#AB721E", cursor: "pointer",
                        }}
                    >
                        {loading? "Refreshing..." : "🔄 REFRESH TRACKING"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderTrackingWidget;