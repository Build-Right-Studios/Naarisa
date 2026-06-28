import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTACT } from "../Constants/apiRoutes";
import api from "../utils/axiosInstance.js"

/* ─── Brand tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#F9F3EB",
  surface: "#FFFFFF",
  border: "#E8DDD0",
  ink: "#1f1b15",
  mid: "#8C7B6B",
  light: "#C4A882",
  gold: "#AB721E",
  serif: "'EB Garamond', serif",
  sans: "'Jost', sans-serif",
};

/* ─── Contact info items ───────────────────────────────────────────────────── */
const INFO = [
  {
    label: "Email us",
    value: "naarisa23@gmail.com",
    hint: "We usually respond within 24–48 working hours",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2,4 12,13 22,4" />
      </svg>
    ),
  },
  {
    label: "Call us",
    value: "+91 98971 39380",
    hint: "Mon–Sat, 10am – 6pm IST",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.47 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "Visit us",
    value: "Mohan Exclusive, Haridwar",
    hint: "Mohan Exclusive, 1, Gurudwara road, Kathra Bazar Jwalapur, Haridwar, Uttarakhand, 249407",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const SUBJECTS = [
  "Order & Shipping",
  "Returns & Exchange",
  "Product Query",
  "Wholesale / Bulk",
  "Collaboration",
  "Other",
];

/* ─── Input component ──────────────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontFamily: T.sans, fontSize: "10px", fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase", color: T.mid,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontFamily: T.sans, fontSize: "11px", color: "#B94A48" }}>
          {error}
        </span>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "12px 14px",
  fontFamily: T.sans,
  fontSize: "14px",
  color: T.ink,
  backgroundColor: "#FAF7F3",
  border: `1px solid ${hasError ? "#B94A48" : T.border}`,
  outline: "none",
  borderRadius: 0,
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  appearance: "none",
  WebkitAppearance: "none",
});

/* ─── Main page ────────────────────────────────────────────────────────────── */
const ContactPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.subject) e.subject = "Please select a subject.";
    if (!form.message.trim()) e.message = "Please write a message.";
    else if (form.message.trim().length < 10)
      e.message = "Message is too short.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("sending");
    try {
      await api.post(CONTACT.SEND_MAIL, form);
      setStatus("sent");
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
    }
  };

  const borderFor = (key) => ({
    ...inputStyle(!!errors[key]),
    borderColor: focused === key ? T.gold : errors[key] ? "#B94A48" : T.border,
  });

  /* ── Success state ── */
  if (status === "sent") {
    return (
      <div style={{ backgroundColor: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "440px" }}>
          {/* Decorative circle */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            border: `1.5px solid ${T.gold}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 400, color: T.ink, marginBottom: "12px" }}>
            Message received
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: "14px", color: T.mid, lineHeight: 1.7, marginBottom: "32px" }}>
            Thank you for writing to us. Someone from the Naarisa team will get back to you within 24 hours.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              fontFamily: T.sans, fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              backgroundColor: T.ink, color: T.bg,
              border: "none", padding: "14px 32px", cursor: "pointer",
            }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh" }}>

      {/* ── Breadcrumb ── */}
      <div style={{
        margin: "0 auto",
        maxWidth: "1200px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}>
        <p style={{
          fontFamily: T.sans, fontSize: "11px", letterSpacing: "0.14em",
          color: T.mid, textTransform: "uppercase", padding: "24px 0 0",
        }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }} className="hover:text-[#AB721E]">
            Home
          </span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: T.ink }}>Contact</span>
        </p>
      </div>

      {/* ── Hero ── */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        padding: "48px 20px 40px",
        marginBottom: "0",
      }}>
        <div style={{
          margin: "0 auto",
          maxWidth: "1200px",
        }}>
          <p style={{
            fontFamily: T.sans, fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: T.gold, marginBottom: "12px",
          }}>
            We'd love to hear from you
          </p>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 400, color: T.ink, lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            Get in touch
          </h1>
          <p
            style={{
              fontFamily: T.sans,
              fontSize: "14px",
              color: T.mid,
              lineHeight: 1.7,
              maxWidth: "650px",
            }}
          >
            We're here to help you. Whether you have a question about your order,
            size, delivery, return, exchange, or anything else, the Naarisa team
            will be happy to assist you.
          </p>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{
        margin: "0 auto",
        maxWidth: "1200px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}>

          {/* ── Top: form (now first on mobile/all) ── */}
          <div style={{
            padding: "48px 0",
            borderBottom: `1px solid ${T.border}`,
            width: "100%",
          }}>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Name + Email */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  "@media (minWidth: 768px)": {
                    gridTemplateColumns: "1fr 1fr",
                  },
                }}>
                  <Field label="Full name *" error={errors.name}>
                    <input
                      type="text"
                      placeholder="Priya Sharma"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                      style={borderFor("name")}
                    />
                  </Field>

                  <Field label="Email address *" error={errors.email}>
                    <input
                      type="email"
                      placeholder="priya@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      style={borderFor("email")}
                    />
                  </Field>
                </div>

                {/* Phone */}
                <Field label="Phone number (optional)" error={errors.phone}>
                  <input
                    type="tel"
                    placeholder="+91 98971 39380"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onFocus={() => setFocused("phone")}
                    onBlur={() => setFocused(null)}
                    style={borderFor("phone")}
                  />
                </Field>

                {/* Subject */}
                <Field label="What's this about? *" error={errors.subject}>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.subject}
                      onChange={(e) => set("subject", e.target.value)}
                      onFocus={() => setFocused("subject")}
                      onBlur={() => setFocused(null)}
                      style={{
                        ...borderFor("subject"),
                        cursor: "pointer",
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: "36px",
                      }}
                    >
                      <option value="" disabled>Select a topic…</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </Field>

                {/* Message */}
                <Field label="Your message *" error={errors.message}>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...borderFor("message"),
                      resize: "vertical",
                      lineHeight: 1.6,
                      minHeight: "130px",
                    }}
                  />
                </Field>

                {/* Error banner */}
                {status === "error" && (
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#FDF2F2",
                    border: "1px solid #F5C6C6",
                    fontFamily: T.sans, fontSize: "13px", color: "#B94A48",
                  }}>
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}

                {/* Submit */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    style={{
                      fontFamily: T.sans, fontSize: "11px", fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      backgroundColor: status === "sending" ? T.mid : T.ink,
                      color: T.bg, border: "none",
                      padding: "14px 36px", cursor: status === "sending" ? "not-allowed" : "pointer",
                      transition: "background 0.2s",
                      display: "flex", alignItems: "center", gap: "10px",
                    }}
                    onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.backgroundColor = "#2B2112"; }}
                    onMouseLeave={(e) => { if (status !== "sending") e.currentTarget.style.backgroundColor = T.ink; }}
                  >
                    {status === "sending" ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          style={{ animation: "spin 0.8s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        Sending…
                      </>
                    ) : "Send message"}
                  </button>

                  <p style={{ fontFamily: T.sans, fontSize: "11px", color: T.light }}>
                    * Required fields
                  </p>
                </div>

              </div>
            </form>
          </div>

          {/* ── Bottom: info panel ── */}
          <div style={{
            padding: "48px 0",
            width: "100%",
          }}>

            {/* Info items */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
              marginBottom: "48px",
              "@media (minWidth: 768px)": {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
            }}>
              {INFO.map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "40px", height: "40px", flexShrink: 0,
                    border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: T.surface,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: T.sans, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mid, marginBottom: "4px" }}>
                      {item.label}
                    </p>
                    <p style={{ fontFamily: T.serif, fontSize: "17px", color: T.ink, marginBottom: "3px", wordBreak: "break-word" }}>
                      {item.value}
                    </p>
                    <p style={{ fontFamily: T.sans, fontSize: "12px", color: T.light, lineHeight: 1.5 }}>
                      {item.hint}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "32px" }}>
              <p style={{ fontFamily: T.sans, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mid, marginBottom: "16px" }}>
                Follow us
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                  {
                    label: "Instagram",
                    url: "https://www.instagram.com/naarisa.in",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                      </svg>
                    ),
                  },
                  {
                    label: "WhatsApp",
                    url: "https://wa.me/919897139380",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    ),
                  },
                ].map((s) => (
                  <button onClick={() => window.open(s.url, "_blank")}
                    key={s.label}
                    title={s.label}
                    style={{
                      width: "36px", height: "36px",
                      border: `1px solid ${T.border}`,
                      backgroundColor: "transparent",
                      color: T.mid, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = T.gold;
                      e.currentTarget.style.color = T.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.color = T.mid;
                    }}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Spin keyframe & responsive styles ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #C4A882; }
        input:focus, textarea:focus, select:focus { outline: none; }
        select option { font-family: 'Jost', sans-serif; }
        
        /* Mobile-first responsive adjustments */
        @media (max-width: 767px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default ContactPage;