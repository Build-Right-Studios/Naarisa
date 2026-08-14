import { useState, useEffect } from "react";
import { BASE, COUPON } from "../../Constants/apiroutes.js";

const BASE_URL = BASE.ROUTE;

const initialForm = {
    code: "",
    discountValue: "",
    discountType: "percentage",
    maxDiscountAmount: "",
    minOrderValue: "",
    maxUses: "",
    perUserLimit: 1,
    firstTimeUserOnly: false,
    couponType: "website",
    expiryDate: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDiscount(type, value, maxDiscountAmount) {
    if (type === "percentage") {
        if (maxDiscountAmount) {
            return `${value}% Off up to ₹${maxDiscountAmount}`;
        }
        return `${value}% Off`;
    }

    return `₹${value} Off`;
}
function formatMinOrder(value) {
    if (!value || Number(value) === 0) return "No Minimum";
    return `₹${Number(value).toFixed(2)}`;
}
function formatDate(dateStr, short = false) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US",
        short
            ? { month: "short", day: "numeric" }
            : { month: "short", day: "numeric", year: "numeric" }
    );
}

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("token");

    const width = useWindowWidth();
    const isMobile = width < 640;           // phone
    const isTablet = width >= 640 && width < 1024;
    const isMonitor = width >= 1440;         // large desktop

    // ── fetch ──
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}${COUPON.GET}`, {
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401 || res.status === 403) {
                throw new Error("Unauthorized");
            }

            const data = await res.json();
            if (data.success) setCoupons(data.data);
            else console.error("Failed to load coupons:", data.message);
        } catch (e) {
            console.error(e);
            localStorage.removeItem("token");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchCoupons(); }, []);

    // ── toast ──
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── delete ──
    const handleDelete = async (id, code) => {
        if (!window.confirm(`Delete coupon ${code}?`)) return;
        try {
            const res = await fetch(`${BASE_URL}${COUPON.DELETE(id)}`, {
                method: "DELETE", credentials: "include", headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setCoupons((prev) => prev.filter((c) => c._id !== id));
                showToast(data.message);
            } else showToast(data.message, "error");
        } catch { showToast("Failed to delete coupon", "error"); }
    };

    // ── submit ──
    const handleSubmit = async () => {
        setError("");
        if (!form.code.trim()) return setError("Coupon code is required.");
        if (!form.discountValue) return setError("Discount value is required.");
        if (!form.expiryDate) return setError("Expiry date is required.");
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}${COUPON.ADD}`, {
                method: "POST", credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: form.code.trim().toUpperCase(),
                    discountType: form.discountType,
                    discountValue: Number(form.discountValue),

                    maxDiscountAmount: form.maxDiscountAmount
                        ? Number(form.maxDiscountAmount)
                        : null,

                    minOrderValue: Number(form.minOrderValue) || 0,

                    maxUses: form.maxUses
                        ? Number(form.maxUses)
                        : null,

                    perUserLimit: Number(form.perUserLimit) || 1,
                    firstTimeUserOnly: form.firstTimeUserOnly,
                    couponType: form.couponType,
                    expiryDate: form.expiryDate,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                setShowModal(false);
                setForm(initialForm);
                fetchCoupons();
            } else setError(data.message);
        } catch { setError("Something went wrong."); }
        finally { setSubmitting(false); }
    };

    // ── responsive derived values ──
    const pagePadding = isMobile ? "24px 16px" : isTablet ? "28px 28px" : isMonitor ? "48px 64px" : "40px 48px";
    const titleSize = isMobile ? 22 : isMonitor ? 38 : 32;
    const thPad = isMobile ? "12px 10px" : isTablet ? "14px 16px" : "16px 24px";
    const tdPad = isMobile ? "14px 10px" : isTablet ? "16px 16px" : "20px 24px";
    const tdFont = isMobile ? 13 : 15;
    const showMinOrder = !isMobile;                        // hide col on phones
    const colCount = showMinOrder ? 7 : 5;
    const modalW = isMobile ? "calc(100vw - 32px)" : isTablet ? "90vw" : 520;
    const modalMaxW = isMobile ? "100%" : 520;
    const modalPad = isMobile ? "18px 16px" : "28px 32px";
    const modalHdrPad = isMobile ? "20px 16px" : "28px 32px";

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

            {/* Header */}
            <div style={{
                ...S.header,
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 14 : 0,
                marginBottom: isMobile ? 20 : 32,
            }}>
                <div>
                    <h1 style={{ ...S.title, fontSize: titleSize }}>Coupons</h1>
                    <p style={{ ...S.subtitle, maxWidth: isMobile ? "100%" : 400 }}>
                        Manage your promotional campaigns and discount strategies through the editorial coupon matrix.
                    </p>
                </div>
                <button
                    style={{
                        ...S.createBtn,
                        width: isMobile ? "100%" : "auto",
                        justifyContent: isMobile ? "center" : "flex-start",
                    }}
                    onClick={() => { setShowModal(true); setError(""); setForm(initialForm); }}
                >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Coupon
                </button>
            </div>

            {/* Table card */}
            <div style={S.tableCard}>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                    <table style={{ ...S.table, minWidth: isMobile ? 460 : "100%" }}>
                        <thead>
                            <tr>
                                {[
                                    "Coupon Code",
                                    "Discount",
                                    ...(showMinOrder ? ["Min Order", "Uses Left"] : []),
                                    "Type",
                                    "Expiry Date",
                                    "Actions",
                                ].map((h) => (
                                    <th key={h} style={{ ...S.th, padding: thPad }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={colCount} style={S.emptyCell}>Loading coupons…</td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={colCount} style={S.emptyCell}>No coupons found.</td></tr>
                            ) : coupons.map((c) => (
                                <tr key={c._id} style={S.tr}>
                                    <td style={{ ...S.td, padding: tdPad, fontSize: tdFont }}>
                                        <span style={{ ...S.codeBadge, fontSize: isMobile ? 11 : 13 }}>{c.code}</span>
                                    </td>
                                    <td style={{ ...S.td, padding: tdPad, fontSize: tdFont, fontWeight: 600 }}>
                                        {formatDiscount(c.discountType, c.discountValue, c.maxDiscountAmount)}
                                    </td>
                                    {showMinOrder && (
                                        <td style={{
                                            ...S.td, padding: tdPad, fontSize: tdFont,
                                            color: c.minOrderValue ? "#111" : "#888",
                                            fontStyle: c.minOrderValue ? "normal" : "italic",
                                        }}>
                                            {formatMinOrder(c.minOrderValue)}
                                        </td>
                                    )}

                                    {showMinOrder && (
                                        <td
                                            style={{
                                                ...S.td,
                                                padding: tdPad,
                                                fontSize: tdFont,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {c.maxUses
                                                ? `${c.maxUses - c.usedCount} / ${c.maxUses}`
                                                : "Unlimited"}
                                        </td>
                                    )}

                                    <td style={{ ...S.td, padding: tdPad, fontSize: tdFont }}>
                                        <span style={{ ...S.typeBadge, fontSize: isMobile ? 10 : 11 }}>
                                            {c.couponType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ ...S.td, padding: tdPad, fontSize: tdFont, whiteSpace: "nowrap" }}>
                                        {formatDate(c.expiryDate, isMobile)}
                                    </td>
                                    <td style={{ ...S.td, padding: tdPad }}>
                                        <button style={S.deleteBtn} onClick={() => handleDelete(c._id, c.code)} title="Delete">
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div style={{ ...S.tableFooter, fontSize: isMobile ? 12 : 13 }}>
                        Showing {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    style={{
                        ...S.overlay,
                        // on mobile align modal to bottom like a bottom sheet
                        alignItems: isMobile ? "flex-end" : "center",
                    }}
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div style={{
                        ...S.modal,
                        width: modalW,
                        maxWidth: modalMaxW,
                        borderRadius: isMobile ? "20px 20px 0 0" : 20,
                        maxHeight: "92vh",
                        overflowY: "auto",
                    }}>
                        {/* sticky header so close btn always visible on small screens */}
                        <div style={{ ...S.modalHeader, padding: modalHdrPad, position: "sticky", top: 0, zIndex: 2 }}>
                            <div>
                                <h2 style={{ ...S.modalTitle, fontSize: isMobile ? 19 : 24 }}>Create Coupon</h2>
                                <p style={S.modalSubtitle}>Set up a new discount for your customers</p>
                            </div>
                            <button style={S.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div style={{ ...S.modalBody, padding: modalPad }}>
                            <Field label="Coupon Code">
                                <input
                                    style={S.input}
                                    placeholder="e.g. SPRINGFLASH24"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                />
                            </Field>

                            {/* Discount row: side-by-side on tablet+, stacked on mobile */}
                            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16 }}>
                                <Field label="Discount Value" style={{ flex: 1 }}>
                                    <div style={S.inputWithSuffix}>
                                        <input
                                            style={{ ...S.input, paddingRight: form.discountType === "percentage" ? 36 : 14 }}
                                            type="number" min={0} placeholder="15"
                                            value={form.discountValue}
                                            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                        />
                                        {form.discountType === "percentage" && <span style={S.suffix}>%</span>}
                                    </div>
                                </Field>
                                <Field label="Discount Type" style={{ flex: 1 }}>
                                    <div style={S.selectWrapper}>
                                        <select style={S.select} value={form.discountType}
                                            onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="flat">Flat ($)</option>
                                        </select>
                                        <span style={S.selectArrow}>▾</span>
                                    </div>
                                </Field>
                            </div>

                            {form.discountType === "percentage" && (
                                <Field label="Maximum Discount Amount (Optional)">
                                    <div style={S.inputWithPrefix}>
                                        <span style={S.prefix}>₹</span>

                                        <input
                                            style={{ ...S.input, paddingLeft: 28 }}
                                            type="number"
                                            min={0}
                                            placeholder="500"
                                            value={form.maxDiscountAmount}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    maxDiscountAmount: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </Field>
                            )}

                            <Field label="Maximum Coupon Uses">
                                <input
                                    style={S.input}
                                    type="number"
                                    min={1}
                                    placeholder="100"
                                    value={form.maxUses}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            maxUses: e.target.value,
                                        })
                                    }
                                />
                            </Field>

                            <Field label="Per User Limit">
                                <input
                                    style={S.input}
                                    type="number"
                                    min={1}
                                    placeholder="1"
                                    value={form.perUserLimit}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            perUserLimit: e.target.value,
                                        })
                                    }
                                />
                            </Field>
                            <Field label="First-Time Users Only">
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        cursor: "pointer",
                                        fontSize: 14,
                                        color: "#333",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.firstTimeUserOnly}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                firstTimeUserOnly: e.target.checked,
                                            })
                                        }
                                    />

                                    Only allow this coupon for first-time users
                                </label>
                            </Field>
                            <Field label="Minimum Order Value">
                                <div style={S.inputWithPrefix}>
                                    <span style={S.prefix}>₹</span>
                                    <input style={{ ...S.input, paddingLeft: 28 }}
                                        type="number" min={0} placeholder="0"
                                        value={form.minOrderValue}
                                        onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                                    />
                                </div>
                            </Field>

                            <Field label="Coupon Type">
                                <div style={S.selectWrapper}>
                                    <select style={S.select} value={form.couponType}
                                        onChange={(e) => setForm({ ...form, couponType: e.target.value })}>
                                        <option value="website">Website</option>
                                        <option value="social">Social</option>
                                    </select>
                                    <span style={S.selectArrow}>▾</span>
                                </div>
                            </Field>

                            <Field label="Expiry Date">
                                <input style={S.input} type="date"
                                    value={form.expiryDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                />
                            </Field>

                            {error && <p style={S.errorText}>{error}</p>}

                            <div style={{
                                ...S.modalActions,
                                flexDirection: isMobile ? "column-reverse" : "row",
                            }}>
                                <button style={S.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button style={{ ...S.generateBtn, opacity: submitting ? 0.7 : 1 }}
                                    onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? "Creating…" : "Generate Coupon"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, children, style }) {
    return (
        <div style={{ marginBottom: 16, ...style }}>
            <label style={S.label}>{label}</label>
            {children}
        </div>
    );
}

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

// ─── Static styles ────────────────────────────────────────────────────────────
const S = {
    page: {
        background: "#f5f5f7",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        position: "relative",
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
        fontSize: 14,
        color: "#666",
        marginTop: 6,
        lineHeight: 1.5,
    },
    createBtn: {
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
    codeBadge: {
        background: "#ede9fe",
        color: "#6d28d9",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 6,
        letterSpacing: "0.04em",
        display: "inline-block",
        whiteSpace: "nowrap",
    },
    typeBadge: {
        background: "#f0f0f0",
        color: "#555",
        fontWeight: 600,
        padding: "4px 8px",
        borderRadius: 5,
        letterSpacing: "0.06em",
        display: "inline-block",
        whiteSpace: "nowrap",
    },
    deleteBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#aaa",
        padding: 6,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
    },
    tableFooter: {
        padding: "14px 24px",
        color: "#888",
        borderTop: "1px solid #f0f0f0",
    },
    emptyCell: {
        textAlign: "center",
        padding: 48,
        color: "#aaa",
        fontSize: 14,
    },
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#fff",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    },
    modalHeader: {
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    modalTitle: {
        color: "#fff",
        fontWeight: 800,
        margin: 0,
        letterSpacing: "-0.3px",
    },
    modalSubtitle: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 13,
        margin: "4px 0 0",
    },
    closeBtn: {
        background: "rgba(255,255,255,0.2)",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        borderRadius: "50%",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    modalBody: { boxSizing: "border-box" },
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
    },
    selectWrapper: { position: "relative" },
    select: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "none",
        background: "#f2f2f5",
        fontSize: 15,
        color: "#111",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        boxSizing: "border-box",
    },
    selectArrow: {
        position: "absolute",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#888",
        fontSize: 12,
        pointerEvents: "none",
    },
    inputWithSuffix: { position: "relative" },
    suffix: {
        position: "absolute",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#888",
        fontSize: 14,
        pointerEvents: "none",
    },
    inputWithPrefix: { position: "relative" },
    prefix: {
        position: "absolute",
        left: 14,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#888",
        fontSize: 14,
        pointerEvents: "none",
        zIndex: 1,
    },
    modalActions: {
        display: "flex",
        gap: 12,
        marginTop: 24,
    },
    cancelBtn: {
        flex: 1,
        padding: "14px",
        borderRadius: 12,
        border: "none",
        background: "#f0f0f0",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        color: "#333",
    },
    generateBtn: {
        flex: 2,
        padding: "14px",
        borderRadius: 12,
        border: "none",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 13,
        margin: "0 0 8px",
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