import { useState, useEffect } from "react";
import AddBannerModal from "../../Components/Banner/AddBannerModal";
import { BASE, BANNER } from "../../Constants/apiroutes.js";

const BASE_URL = BASE.ROUTE;

// ─── Breakpoint hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
    const [width, setWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1280
    );
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return width;
}

// ─── Tag label map ────────────────────────────────────────────────────────────
const TAG_COLORS = {
    "PRIMARY HERO": { bg: "rgba(124,58,237,0.85)", color: "#fff" },
    "SECONDARY": { bg: "rgba(30,30,30,0.75)", color: "#fff" },
    "ARCHIVE": { bg: "rgba(15,118,110,0.80)", color: "#fff" },
    "NEW ARRIVAL": { bg: "rgba(217,119,6,0.85)", color: "#fff" },
};
function getTag(index) {
    const tags = Object.keys(TAG_COLORS);
    return tags[index % tags.length];
}

// ─── BannerCard ───────────────────────────────────────────────────────────────
function BannerCard({ banner, index, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const tag = getTag(index);
    const tagStyle = TAG_COLORS[tag] || TAG_COLORS["SECONDARY"];

    return (
        <div
            style={{
                ...S.card,
                boxShadow: hovered
                    ? "0 8px 32px rgba(0,0,0,0.13)"
                    : "0 1px 6px rgba(0,0,0,0.07)",
                transform: hovered ? "translateY(-2px)" : "none",
                transition: "box-shadow 0.22s, transform 0.22s",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <div style={S.cardImgWrap}>
                {banner.desktopImage ? (
                    <img
                        src={`${banner.desktopImage}`}
                        alt={banner.title}
                        style={S.cardImg}
                        onError={(e) => { e.target.style.display = "none"; }}
                    />
                ) : (
                    <div style={S.cardImgPlaceholder}>
                        <ImagePlaceholderIcon />
                    </div>
                )}
                {/* Tag badge */}
                <span style={{ ...S.tagBadge, background: tagStyle.bg, color: tagStyle.color }}>
                    {tag}
                </span>
            </div>

            {/* Content */}
            <div style={S.cardBody}>
                <h3 style={S.cardTitle}>{banner.title || "Untitled Banner"}</h3>
                {banner.link && (
                    <p style={S.cardLink} title={banner.link}>
                        {banner.link}
                    </p>
                )}

                {/* Footer actions */}
                <div style={S.cardFooter}>
                    <span style={S.orderBadge}>Order #{banner.order ?? index + 1}</span>
                </div>

                <button
                    style={S.deleteFullBtn}
                    onClick={() => {
                        onDelete(banner._id);
                    }}
                >
                    <TrashIcon />
                    Delete Banner
                </button>
            </div>
        </div>
    );
}

// ─── Empty / Create New card ──────────────────────────────────────────────────
function CreateNewCard({ onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={{
                ...S.card,
                ...S.createCard,
                background: hovered ? "#f3f0ff" : "#fafafa",
                borderColor: hovered ? "#7c3aed" : "#e0e0e0",
                cursor: "pointer",
                transition: "background 0.18s, border-color 0.18s",
            }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={S.createCardInner}>
                <div style={{ ...S.createIcon, background: hovered ? "#ede9fe" : "#f0f0f0" }}>
                    <AddImageIcon color={hovered ? "#7c3aed" : "#aaa"} />
                </div>
                <p style={{ ...S.createTitle, color: hovered ? "#7c3aed" : "#333" }}>Create New Banner</p>
                <p style={S.createSubtitle}>Design a new visual anchor for<br />your store pages.</p>
            </div>
        </div>
    );
}

// ─── Stats footer ─────────────────────────────────────────────────────────────
function StatBar({ count }) {
    return (
        <div style={S.statBar}>
            <StatItem icon={<EyeIcon />} label="GLOBAL IMPRESSIONS" value="1.2M" />
            <StatItem icon={<CursorIcon />} label="TOTAL CLICK-THROUGHS" value="84.5K" />
            <StatItem icon={<ClockIcon />} label="AVG. DISPLAY TIME" value="4.2s" />
        </div>
    );
}
function StatItem({ icon, label, value }) {
    return (
        <div style={S.statItem}>
            <div style={S.statIconWrap}>{icon}</div>
            <div>
                <p style={S.statLabel}>{label}</p>
                <p style={S.statValue}>{value}</p>
            </div>
        </div>
    );
}

// ─── Main Banner page ─────────────────────────────────────────────────────────
export default function Banner() {
    const [banners, setBanners] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("token");
    const width = useWindowWidth();
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const isMonitor = width >= 1440;

    const pagePadding = isMobile
        ? "24px 16px"
        : isTablet
            ? "28px 28px"
            : isMonitor
                ? "48px 64px"
                : "40px 48px";

    const gridCols = isMobile
        ? "1fr"
        : isTablet
            ? "repeat(2, 1fr)"
            : "repeat(2, 1fr)";

    // ── fetch ──
    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}${BANNER.GET}`, {
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            console.log(data.data[0].desktopImage)
            if (data.success) setBanners(data.data);
            else console.error("Failed to fetch banners:", data.message);
        } catch (err) {
            console.error("Failed to fetch banners:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    // ── toast ──
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── delete ──
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;
        try {
            const res = await fetch(`${BASE_URL}${BANNER.DELETE(id)}`, {
                method: "DELETE",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setBanners((prev) => prev.filter((b) => b._id !== id));
                showToast(data.message || "Banner deleted.");
            } else {
                showToast(data.message || "Failed to delete.", "error");
            }
        } catch {
            showToast("Failed to delete banner.", "error");
        }
    };

    // ── upload success ──
    const handleUploadSuccess = (newBanner) => {
        setBanners((prev) => [...prev, newBanner]);
        setShowModal(false);
        showToast("Banner uploaded successfully!");
    };

    return (
        <div style={{ ...S.page, padding: pagePadding }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    ...S.toast,
                    background: toast.type === "error" ? "#ef4444" : "#22c55e",
                    top: isMobile ? 12 : 24,
                    right: isMobile ? 12 : 24,
                    maxWidth: isMobile ? "calc(100vw - 24px)" : 360,
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Breadcrumb */}
            <p style={S.breadcrumb}>ADMIN › <span style={S.breadcrumbActive}>BANNERS</span></p>

            {/* Header */}
            <div style={{
                ...S.header,
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 14 : 0,
                marginBottom: isMobile ? 24 : 36,
            }}>
                <div>
                    <h1 style={{ ...S.title, fontSize: isMobile ? 26 : isMonitor ? 40 : 34 }}>
                        Active Promotions
                    </h1>
                    <p style={S.subtitle}>
                        Manage your storefront hero sections and seasonal carousels.
                    </p>
                </div>
                <button
                    style={{
                        ...S.addBtn,
                        width: isMobile ? "100%" : "auto",
                        justifyContent: isMobile ? "center" : "flex-start",
                    }}
                    onClick={() => setShowModal(true)}
                >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Banner
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <p style={S.emptyText}>Loading banners…</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20, marginBottom: 40 }}>
                    {banners.map((banner, i) => (
                        <BannerCard
                            key={banner._id}
                            banner={banner}
                            index={i}
                            onDelete={handleDelete}
                        />
                    ))}
                    {/* Always show a "Create New" card */}
                    <CreateNewCard onClick={() => setShowModal(true)} />
                </div>
            )}

            {/* Stats bar */}
            {/* {!loading && <StatBar count={banners.length} />} */}

            {/* Modal */}
            {showModal && (
                <AddBannerModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}
function UploadIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}
function ImagePlaceholderIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}
function AddImageIcon({ color = "#aaa" }) {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
            <line x1="19" y1="5" x2="19" y2="9" />
            <line x1="17" y1="7" x2="21" y2="7" />
        </svg>
    );
}
function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function CursorIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
    );
}
function ClockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

// ─── Static styles ────────────────────────────────────────────────────────────
const S = {
    page: {
        background: "#f5f5f7",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        position: "relative",
        boxSizing: "border-box",
    },
    breadcrumb: {
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: "#999",
        marginBottom: 8,
    },
    breadcrumbActive: {
        color: "#7c3aed",
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
        fontSize: 14,
        color: "#666",
        marginTop: 6,
        lineHeight: 1.5,
        margin: "6px 0 0",
    },
    addBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#7c3aed",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "12px 22px",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
        flexShrink: 0,
    },
    emptyText: {
        color: "#aaa",
        fontSize: 14,
        textAlign: "center",
        padding: "60px 0",
    },
    // Card
    card: {
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    },
    cardImgWrap: {
        position: "relative",
        width: "100%",
        height: "auto",
        background: "#eee",
        overflow: "hidden",
    },
    cardImg: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        backgroundColor: "#f5f5f5",
        display: "block",
    },
    cardImgPlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f0f0",
    },
    tagBadge: {
        position: "absolute",
        bottom: 10,
        left: 10,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "4px 9px",
        borderRadius: 5,
        backdropFilter: "blur(4px)",
    },
    cardBody: {
        padding: "16px 16px 14px",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#111",
        margin: "0 0 4px",
        letterSpacing: "-0.2px",
    },
    cardLink: {
        fontSize: 12,
        color: "#888",
        margin: "0 0 12px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    uploadZone: {
        border: "1.5px dashed #e0e0e0",
        borderRadius: 8,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        background: "#fafafa",
    },
    uploadText: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#bbb",
    },
    cardFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    orderBadge: {
        fontSize: 11,
        fontWeight: 600,
        color: "#999",
        letterSpacing: "0.04em",
    },
    deleteFullBtn: {
        width: "100%",
        marginTop: "12px",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #fee2e2",
        background: "#fff5f5",
        color: "#ef4444",
        fontSize: "13px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    deleteBtn: {
        background: "none",
        border: "1px solid #fee2e2",
        borderRadius: 7,
        cursor: "pointer",
        color: "#ef4444",
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
    },
    // Create card
    createCard: {
        border: "1.5px dashed #e0e0e0",
        boxShadow: "none",
        minHeight: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    createCardInner: {
        textAlign: "center",
        padding: "32px 24px",
    },
    createIcon: {
        width: 54,
        height: 54,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 14px",
        transition: "background 0.18s",
    },
    createTitle: {
        fontSize: 16,
        fontWeight: 700,
        margin: "0 0 6px",
        transition: "color 0.18s",
    },
    createSubtitle: {
        fontSize: 13,
        color: "#aaa",
        lineHeight: 1.6,
        margin: 0,
    },
    // Stat bar
    statBar: {
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        background: "#fff",
        borderRadius: 14,
        padding: "20px 28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    statItem: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flex: 1,
        minWidth: 160,
    },
    statIconWrap: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#ede9fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.07em",
        color: "#999",
        margin: "0 0 2px",
    },
    statValue: {
        fontSize: 20,
        fontWeight: 800,
        color: "#111",
        margin: 0,
        letterSpacing: "-0.5px",
    },
    // Toast
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
