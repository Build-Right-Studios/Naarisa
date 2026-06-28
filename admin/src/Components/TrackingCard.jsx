import { useState } from "react";
import axios from "axios";
import { BASE, ORDER } from "../Constants/apiroutes.js";

const BASE_URL = BASE.ROUTE;

// ──── Tracking Timeline Component ────────────────────────────────────────────
export const TrackingTimeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div style={{ padding: "16px", color: "#888", fontSize: 13, textAlign: "center" }}>
        No tracking events yet
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: 20 }}>
      {events.map((event, idx) => (
        <div key={idx} style={{ marginBottom: idx === events.length - 1 ? 0 : 20, position: "relative" }}>
          {/* Timeline dot */}
          <div
            style={{
              position: "absolute",
              left: -18,
              top: 2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#16a34a",
              border: "2px solid #fff",
              boxShadow: "0 0 0 2px #16a34a",
            }}
          />

          {/* Timeline connector (not on last item) */}
          {idx !== events.length - 1 && (
            <div
              style={{
                position: "absolute",
                left: -12,
                top: 12,
                width: 1,
                height: 8,
                backgroundColor: "#e5e7eb",
              }}
            />
          )}

          {/* Content */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 }}>
              {event.activity || event.status}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {event.location && <span>{event.location} · </span>}
              <span>
                {event.date
                  ? new Date(event.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Date unknown"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ──── Tracking Card Component ────────────────────────────────────────────────
export const TrackingCard = ({
  delivery,
  token,
  orderId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Fetch tracking details
  const handleFetchTracking = async () => {
    try {
      setLoadingTracking(true);
      setSyncError("");
      
      const response = await axios.get(
        `${BASE_URL}${ORDER.GET_TRACKING(orderId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setTrackingData(response.data.data);
      setExpanded(true);
    } catch (error) {
      setSyncError(error.response?.data?.message || "Failed to fetch tracking");
      console.error("Fetch tracking error:", error);
    } finally {
      setLoadingTracking(false);
    }
  };

  // Manual sync with ShipRocket
  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setSyncError("");
      
      await axios.post(
        `${BASE_URL}${ORDER.SYNC_TRACKING(orderId)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Refetch tracking data after sync
      await handleFetchTracking();
    } catch (error) {
      setSyncError(error.response?.data?.message || "Sync failed");
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  const statusColors = {
    shipment_created: { bg: "#dbeafe", color: "#1e40af" },
    awb_generated: { bg: "#dbeafe", color: "#1e40af" },
    pickup_requested: { bg: "#fef3c7", color: "#92400e" },
    pickup_scheduled: { bg: "#fef3c7", color: "#92400e" },
    picked_up: { bg: "#fef3c7", color: "#92400e" },
    in_transit: { bg: "#bfdbfe", color: "#1e40af" },
    out_for_delivery: { bg: "#d1fae5", color: "#065f46" },
    delivered: { bg: "#f0fdf4", color: "#15803d" },
    delivery_failed: { bg: "#fee2e2", color: "#991b1b" },
    rto_initiated: { bg: "#fef3c7", color: "#92400e" },
    rto_delivered: { bg: "#fee2e2", color: "#991b1b" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
  };

  const currentStatus = delivery?.status || "unknown";
  const statusStyle = statusColors[currentStatus] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, backgroundColor: "#fff", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: statusStyle.bg,
          borderBottom: expanded ? "1px solid #e5e7eb" : "none",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0, marginBottom: 4 }}>
            📦 Tracking & Delivery
          </h3>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: statusStyle.color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {currentStatus.replace(/_/g, " ")}
          </span>
        </div>
        <span style={{ color: "#6b7280", fontSize: 18, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          ▼
        </span>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ padding: "20px 24px" }}>
          {/* Error Message */}
          {syncError && (
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
              <span>{syncError}</span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 0,
                }}
                onClick={() => setSyncError("")}
              >
                ×
              </button>
            </div>
          )}

          {/* Basic Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
                Courier
              </p>
              <p style={{ fontSize: 14, color: "#111", fontWeight: 600 }}>
                {delivery?.courierName || "—"}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
                AWB / Tracking
              </p>
              <p style={{ fontSize: 14, color: "#111", fontFamily: "monospace", fontWeight: 600 }}>
                {delivery?.awbCode || delivery?.trackingNumber || "—"}
              </p>
            </div>
            {delivery?.estimatedDelivery && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
                  Est. Delivery
                </p>
                <p style={{ fontSize: 14, color: "#111" }}>
                  {new Date(delivery.estimatedDelivery).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {delivery?.trackingUrl && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
                  Tracking Link
                </p>
                <a
                  href={delivery.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    color: "#7c3aed",
                    textDecoration: "none",
                    wordBreak: "break-all",
                  }}
                >
                  View on ShipRocket →
                </a>
              </div>
            )}
          </div>

          {/* Timeline */}
          {trackingData?.events && trackingData.events.length > 0 ? (
            <>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 12 }}>
                Delivery Timeline
              </p>
              <TrackingTimeline events={trackingData.events} />
            </>
          ) : (
            <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#666", textAlign: "center" }}>
              No tracking events available yet
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
            <button
              onClick={handleFetchTracking}
              disabled={loadingTracking}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: loadingTracking ? "#e5e7eb" : "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                cursor: loadingTracking ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loadingTracking) e.target.style.background = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                if (!loadingTracking) e.target.style.background = "#f3f4f6";
              }}
            >
              {loadingTracking ? "Loading..." : "🔄 Refresh Tracking"}
            </button>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: syncing ? "#e5e7eb" : "#111",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: syncing ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!syncing) e.target.style.background = "#374151";
              }}
              onMouseLeave={(e) => {
                if (!syncing) e.target.style.background = "#111";
              }}
            >
              {syncing ? "Syncing..." : "⚡ Sync Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingCard;