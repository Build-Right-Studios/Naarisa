import { useState } from "react";
import { BASE, BANNER } from "../../Constants/apiroutes";

const BASE_URL = BASE.ROUTE;

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ label, hint, onChange, preview }) {
    return (
        <div>
            <label style={S.fieldLabel}>{label}</label>
            <label style={{
                ...S.uploadZone,
                padding: preview ? 0 : "18px 12px",
                overflow: preview ? "hidden" : "visible",
            }}>
                {preview ? (
                    <img
                        src={preview}
                        alt="preview"
                        style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }}
                    />
                ) : (
                    <>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ display: "block", margin: "0 auto 6px" }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 2px", fontWeight: 600, textAlign: "center" }}>
                            Click to upload
                        </p>
                        <p style={{ fontSize: 10, color: "#ccc", margin: 0, textAlign: "center" }}>{hint}</p>
                    </>
                )}
                <input type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
            </label>
        </div>
    );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, optional, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={S.fieldLabel}>
                {label}
                {optional && <span style={{ color: "#bbb", fontSize: 10, marginLeft: 4 }}>(optional)</span>}
            </label>
            {children}
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function AddBannerModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ title: "", link: "", order: 1 });
    const [desktopFile, setDesktopFile] = useState(null);
    const [mobileFile, setMobileFile] = useState(null);
    const [desktopPreview, setDesktopPreview] = useState(null);
    const [mobilePreview, setMobilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const handleFileChange = (type, file) => {
        if (!file) return;
        const preview = URL.createObjectURL(file);
        if (type === "desktop") {
            setDesktopFile(file);
            setDesktopPreview(preview);
        } else {
            setMobileFile(file);
            setMobilePreview(preview);
        }
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.title.trim()) return setError("Banner title is required.");
        if (!desktopFile)       return setError("Desktop image is required.");
        if (!mobileFile)        return setError("Mobile image is required.");

        const formData = new FormData();
        formData.append("title",        form.title.trim());
        formData.append("link",         form.link);
        formData.append("order",        form.order);
        formData.append("desktopImage", desktopFile);
        formData.append("mobileImage",  mobileFile);

        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}${BANNER.ADD}`, {
                method: "POST",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                onSuccess(data.data);
            } else {
                setError(data.message || "Upload failed.");
            }
        } catch (err) {
            setError(err.message || "Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={S.overlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={S.modal}>

                {/* Header */}
                <div style={S.modalHeader}>
                    <div>
                        <h2 style={S.modalTitle}>Add banner</h2>
                        <p style={S.modalSubtitle}>Upload desktop and mobile versions</p>
                    </div>
                    <button style={S.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div style={S.modalBody}>

                    <Field label="Banner Title">
                        <input
                            style={S.input}
                            type="text"
                            placeholder="e.g. Summer Sale 2024"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </Field>

                    <Field label="Redirect Link" optional>
                        <input
                            style={S.input}
                            type="text"
                            placeholder='/products?category=Work'
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                        />
                    </Field>

                    {/* Image uploads side by side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                        <UploadZone
                            label="Desktop Image"
                            hint="1440×600px"
                            preview={desktopPreview}
                            onChange={(e) => handleFileChange("desktop", e.target.files[0])}
                        />
                        <UploadZone
                            label="Mobile Image"
                            hint="768×900px"
                            preview={mobilePreview}
                            onChange={(e) => handleFileChange("mobile", e.target.files[0])}
                        />
                    </div>

                    <Field label="Display Order">
                        <input
                            style={{ ...S.input, maxWidth: 100 }}
                            type="number"
                            min="1"
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: e.target.value })}
                        />
                    </Field>

                    {error && <p style={S.errorText}>{error}</p>}
                </div>

                {/* Footer */}
                <div style={S.modalFooter}>
                    <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Uploading…" : "Upload banner"}
                    </button>
                </div>

            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 460,
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        margin: "0 16px",
    },
    modalHeader: {
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        padding: "22px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderRadius: "16px 16px 0 0",
        position: "sticky",
        top: 0,
        zIndex: 2,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 800,
        color: "#fff",
        margin: "0 0 4px",
        letterSpacing: "-0.3px",
    },
    modalSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        margin: 0,
    },
    closeBtn: {
        background: "rgba(255,255,255,0.2)",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        fontSize: 13,
        borderRadius: "50%",
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    modalBody: {
        padding: "20px 24px 0",
    },
    modalFooter: {
        display: "flex",
        gap: 10,
        padding: "16px 24px 20px",
    },
    fieldLabel: {
        display: "block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#555",
        marginBottom: 7,
    },
    input: {
        width: "100%",
        padding: "11px 13px",
        borderRadius: 9,
        border: "none",
        background: "#f2f2f5",
        fontSize: 14,
        color: "#111",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
    },
    uploadZone: {
        border: "1.5px dashed #ddd",
        borderRadius: 9,
        cursor: "pointer",
        background: "#fafafa",
        display: "block",
        transition: "border-color 0.15s",
    },
    cancelBtn: {
        flex: 1,
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: "#f0f0f0",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        color: "#333",
        fontFamily: "inherit",
    },
    submitBtn: {
        flex: 2,
        padding: "12px",
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
        fontFamily: "inherit",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        margin: "0 0 12px",
        fontWeight: 500,
    },
};
