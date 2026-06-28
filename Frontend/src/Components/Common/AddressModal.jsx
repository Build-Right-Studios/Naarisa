import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance.js";
import { USER } from "../../Constants/apiRoutes.js";

const Icon = ({ name, size = 16, color = "#8C7B6B" }) => {
    const paths = {
        profile: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
        orders: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
        wishlist: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
        address: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z",
        logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
        edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
        plus: "M12 5v14M5 12h14",
        trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
        check: "M20 6L9 17l-5-5",
        x: "M18 6L6 18M6 6l12 12",
        chevron: "M9 18l6-6-6-6",
        menu: "M3 12h18M3 6h18M3 18h18",
        back: "M19 12H5M12 19l-7-7 7-7",
        package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={paths[name]} />
        </svg>
    );
};

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"];

const Field = ({
    label,
    k,
    form,
    errors,
    set,
    inp,
    placeholder,
    maxLength,
    type = "text",
}) => (
    <div>
        <p
            style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#8C7B6B",
                marginBottom: "5px",
            }}
        >
            {label}
        </p>

        <input
            type={type}
            value={form[k]}
            onChange={set(k)}
            placeholder={placeholder}
            maxLength={maxLength}
            style={inp(errors[k])}
            onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
            onBlur={(e) =>
            (e.target.style.borderColor = errors[k]
                ? "#C4727A"
                : "#E8DDD0")
            }
        />

        {errors[k] && (
            <p
                style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "10px",
                    color: "#C4727A",
                    marginTop: "3px",
                }}
            >
                {errors[k]}
            </p>
        )}
    </div>
);

const AddressModal = ({ existing, onSave, onClose }) => {

    useEffect(() => {
        console.log("Modal mounted");

        return () => {
            console.log("Modal unmounted");
        };
    }, []);
    const blank = { label: "Home", name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "Maharashtra", pincode: "", country: "India" };
    const [form, setForm] = useState(existing ? { ...blank, ...existing } : blank);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setErrors((p) => ({ ...p, [k]: "" })); };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Required";
        if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Valid 10-digit number";
        if (!form.line1.trim()) e.line1 = "Required";
        if (!form.city.trim()) e.city = "Required";
        if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Valid 6-digit PIN";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { e.email = "Enter a valid email"; }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    const inp = (err) => ({
        width: "100%", boxSizing: "border-box", padding: "10px 12px",
        fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#1f1b15",
        backgroundColor: "#FDF8F1", border: err ? "1px solid #C4727A" : "1px solid #E8DDD0", outline: "none",
    });

    // const Field = ({ label, k, placeholder, maxLength, type = "text" }) => (
    //     <div>
    //         <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8C7B6B", marginBottom: "5px" }}>{label}</p>
    //         <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder} maxLength={maxLength}
    //             style={inp(errors[k])}
    //             onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
    //             onBlur={(e) => (e.target.style.borderColor = errors[k] ? "#C4727A" : "#E8DDD0")} />
    //         {errors[k] && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", color: "#C4727A", marginTop: "3px" }}>{errors[k]}</p>}
    //     </div>
    // );

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(43,33,18,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", color: "#1f1b15" }}>{existing ? "Edit Address" : "Add New Address"}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8C7B6B" }}><Icon name="x" /></button>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
                    {["Home", "Work", "Other"].map((l) => (
                        <button key={l} onClick={() => setForm((p) => ({ ...p, label: l }))}
                            style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", padding: "6px 14px", border: "1px solid", borderColor: form.label === l ? "#AB721E" : "#E8DDD0", backgroundColor: form.label === l ? "#AB721E" : "transparent", color: form.label === l ? "#fff" : "#8C7B6B", cursor: "pointer", transition: "all 0.15s" }}>
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <Field
                            label="FULL NAME"
                            k="name"
                            form={form}
                            errors={errors}
                            set={set}
                            inp={inp}
                            placeholder="Name on address"
                        />
                        <Field
                            label="PHONE"
                            k="phone"
                            form={form}
                            errors={errors}
                            set={set}
                            inp={inp}
                            placeholder="10-digit number"
                            maxLength={10}
                        />
                    </div>
                    <Field
                        label="EMAIL ADDRESS"
                        k="email"
                        form={form}
                        errors={errors}
                        set={set}
                        inp={inp}
                        placeholder="your@email.com"
                        type="email"
                    />
                    <Field
                        label="STREET ADDRESS"
                        k="line1"
                        form={form}
                        errors={errors}
                        set={set}
                        inp={inp}
                        placeholder="House no. and street"
                    />
                    <div>
                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8C7B6B", marginBottom: "5px" }}>LANDMARK / AREA <span style={{ fontWeight: 400 }}>(optional)</span></p>
                        <input value={form.line2} onChange={set("line2")} placeholder="Landmark or area" style={inp(false)}
                            onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                            onBlur={(e) => (e.target.style.borderColor = "#E8DDD0")} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        <Field
                            label="CITY"
                            k="city"
                            form={form}
                            errors={errors}
                            set={set}
                            inp={inp}
                            placeholder="City"
                        />
                        <div>
                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8C7B6B", marginBottom: "5px" }}>STATE</p>
                            <select value={form.state} onChange={set("state")} style={{ ...inp(false), appearance: "none", cursor: "pointer" }}
                                onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
                                onBlur={(e) => (e.target.style.borderColor = "#E8DDD0")}>
                                {STATES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <Field
                            label="PIN CODE"
                            k="pincode"
                            form={form}
                            errors={errors}
                            set={set}
                            inp={inp}
                            placeholder="6 digits"
                            maxLength={6}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "12px", fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", border: "1px solid #E8DDD0", backgroundColor: "transparent", color: "#8C7B6B", cursor: "pointer" }}>CANCEL</button>
                    <button onClick={handleSave} disabled={saving}
                        style={{ flex: 2, padding: "12px", fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", backgroundColor: saving ? "#C4A882" : "#AB721E", color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#8B6914"; }}
                        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#AB721E"; }}>
                        {saving ? "SAVING..." : "SAVE ADDRESS"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;