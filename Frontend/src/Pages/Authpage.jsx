import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE, AUTH } from "../Constants/apiRoutes.js";

// ── Icons ─────────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);

// ── Step Dots ─────────────────────────────────────────────────────────────────
const StepDots = ({ step }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
    {[1, 2].map((s) => (
      <div key={s} style={{ width: s === step ? "24px" : "8px", height: "8px", backgroundColor: s === step ? "#AB721E" : s < step ? "#2D6B5A" : "#E8DDD0", transition: "all 0.3s ease" }} />
    ))}
  </div>
);

// ── OTP Input ─────────────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange, disabled }) => {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[i]) { next[i] = ""; onChange(next.join("")); }
      else if (i > 0) inputs.current[i - 1]?.focus();
      return;
    }
    if (e.key === "ArrowLeft"  && i > 0) { inputs.current[i - 1]?.focus(); return; }
    if (e.key === "ArrowRight" && i < 5) { inputs.current[i + 1]?.focus(); return; }
  };

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    if (!val) return;
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, "").slice(0, 6)); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          style={{ width: "44px", height: "52px", textAlign: "center", fontFamily: "'Jost', sans-serif", fontSize: "20px", fontWeight: 600, color: "#1f1b15", backgroundColor: d ? "#FDF8F1" : "#F9F3EB", border: d ? "1.5px solid #AB721E" : "1px solid #E8DDD0", outline: "none", transition: "all 0.15s", caretColor: "transparent" }}
          onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
          onBlur={(e)  => (e.target.style.borderColor = d ? "#AB721E" : "#E8DDD0")}
        />
      ))}
    </div>
  );
};

// ── Labelled Input ────────────────────────────────────────────────────────────
const LabelInput = ({ label, error, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B" }}>{label}</p>
    <input
      {...props}
      style={{ width: "100%", padding: "13px 14px", fontFamily: "'Jost', sans-serif", fontSize: "14px", color: "#1f1b15", backgroundColor: "#FDF8F1", border: error ? "1px solid #C4727A" : "1px solid #E8DDD0", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
      onFocus={(e) => (e.target.style.borderColor = "#AB721E")}
      onBlur={(e)  => (e.target.style.borderColor = error ? "#C4727A" : "#E8DDD0")}
    />
    {error && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#C4727A" }}>{error}</p>}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [step,    setStep]    = useState(1);
  const [phone,   setPhone]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [isNew,   setIsNew]   = useState(false);

  // New-user profile fields collected on first pass
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${BASE.ROUTE}${AUTH.SEND_OTP}`, { phone: cleaned });
      if (res.data.success) {
        setIsNew(res.data.isNew ?? false);
        setStep(2);
        setResendTimer(30);
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const fe = {};
    if (otp.replace(/\D/g, "").length < 6) fe.otp = "Enter the 6-digit OTP";

    // Validate new-user fields only on first pass
    if (isNew) {
      if (!name.trim())                      fe.name  = "Your name is required";
      if (!/\S+@\S+\.\S+/.test(email))       fe.email = "Enter a valid email address";
    }

    if (Object.keys(fe).length > 0) { setFieldErrors(fe); return; }
    setFieldErrors({});
    setError("");
    setLoading(true);

    try {
      const payload = { phone: phone.replace(/\s/g, ""), otp };
      if (isNew) { payload.name = name.trim(); payload.email = email.trim().toLowerCase(); }

      const res = await axios.post(`${BASE.ROUTE}${AUTH.VERIFY_OTP}`, payload, { withCredentials: true });

      if (res.data.success) {
        // Save token for Bearer auth on all subsequent requests
        if (res.data.token) {
          localStorage.setItem("naarisa-token", res.data.token);
        }
        // Persist user object so AccountPage / CheckoutPage can prefill
        if (res.data.user) {
          localStorage.setItem("naarisa-user", JSON.stringify({
            id:    res.data.user.id,
            name:  res.data.user.name,
            phone: res.data.user.phone,
            email: res.data.user.email ?? "",
          }));
        }
        navigate(redirectTo, { replace: true });
      } else {
        setError(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(""); setError(""); setLoading(true);
    try {
      const res = await axios.post(`${BASE.ROUTE}${AUTH.SEND_OTP}`, { phone: phone.replace(/\s/g, "") });
      if (res.data.success) setResendTimer(30);
      else setError(res.data.message || "Failed to resend OTP");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally { setLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#fff", border: "1px solid #E8DDD0", padding: "40px 36px" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 onClick={() => navigate("/")} style={{ fontFamily: "'EB Garamond', serif", fontSize: "28px", fontWeight: 400, color: "#1f1b15", marginBottom: "4px", cursor: "pointer" }}>Naarisa</h1>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "14px", fontStyle: "italic", color: "#8C7B6B" }}>Artisanal Craftsmanship, Contemporary Luxury</p>
          </div>

          <StepDots step={step} />

          {/* ══ STEP 1 — Phone ══ */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontWeight: 400, color: "#1f1b15", marginBottom: "6px" }}>Welcome</h2>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#8C7B6B", fontWeight: 300 }}>Enter your phone number to continue</p>
              </div>

              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B", marginBottom: "8px" }}>MOBILE NUMBER</p>
                <div
                  style={{ display: "flex", border: error ? "1px solid #C4727A" : "1px solid #E8DDD0", backgroundColor: "#FDF8F1", overflow: "hidden", transition: "border-color 0.2s" }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#AB721E")}
                  onBlurCapture={(e)  => (e.currentTarget.style.borderColor = error ? "#C4727A" : "#E8DDD0")}
                >
                  <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: "6px", borderRight: "1px solid #E8DDD0", flexShrink: 0, backgroundColor: "#F5E6D0" }}>
                    <span style={{ fontSize: "16px" }}>🇮🇳</span>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "14px", color: "#4A3728", fontWeight: 500 }}>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="00000 00000"
                    value={phone}
                    maxLength={10}
                    autoFocus
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    style={{ flex: 1, padding: "13px 14px", fontFamily: "'Jost', sans-serif", fontSize: "15px", color: "#1f1b15", background: "none", border: "none", outline: "none", letterSpacing: "0.06em" }}
                  />
                  <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", color: "#C4A882" }}><PhoneIcon /></div>
                </div>
                {error && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#C4727A", marginTop: "6px" }}>{error}</p>}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                style={{ width: "100%", padding: "14px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", backgroundColor: loading ? "#C4A882" : "#AB721E", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#8B6914"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#AB721E"; }}
              >
                {loading ? "SENDING OTP..." : "SEND OTP →"}
              </button>

              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", textAlign: "center", lineHeight: 1.7 }}>
                We'll send a 6-digit OTP to verify your number. New users are registered automatically.
              </p>
            </div>
          )}

          {/* ══ STEP 2 — OTP + optional new-user fields ══ */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontWeight: 400, color: "#1f1b15", marginBottom: "6px" }}>
                  {isNew ? "Create Account" : "Enter OTP"}
                </h2>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#8C7B6B", fontWeight: 300, lineHeight: 1.6 }}>
                  OTP sent to <strong style={{ color: "#1f1b15" }}>+91 {phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</strong>
                  <button
                    onClick={() => { setStep(1); setOtp(""); setError(""); setFieldErrors({}); }}
                    style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#AB721E", background: "none", border: "none", cursor: "pointer", marginLeft: "8px", textDecoration: "underline", padding: 0 }}
                  >
                    Change
                  </button>
                </p>
              </div>

              {/* ── New user: collect Name + Email BEFORE OTP ── */}
              {isNew && (
                <>
                  <div style={{ padding: "12px 14px", backgroundColor: "#F5E6D0", border: "1px solid #E8DDD0" }}>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#4A3728", lineHeight: 1.6 }}>
                      👋 Looks like you're new here! Tell us a bit about yourself so we can personalise your experience.
                    </p>
                  </div>

                  <LabelInput
                    label="YOUR NAME"
                    placeholder="What should we call you?"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })); }}
                    error={fieldErrors.name}
                  />

                  <LabelInput
                    label="EMAIL ADDRESS"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                    error={fieldErrors.email}
                  />

                  {/* Divider before OTP */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#E8DDD0" }} />
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>VERIFY YOUR NUMBER</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#E8DDD0" }} />
                  </div>
                </>
              )}

              {/* OTP boxes */}
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setFieldErrors((p) => ({ ...p, otp: "" })); setError(""); }} disabled={loading} />

              {(fieldErrors.otp || error) && (
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4727A", textAlign: "center", marginTop: "-8px" }}>
                  {fieldErrors.otp || error}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                style={{ width: "100%", padding: "14px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", backgroundColor: (loading || otp.length < 6) ? "#C4A882" : "#AB721E", color: "#fff", border: "none", cursor: (loading || otp.length < 6) ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => { if (!loading && otp.length === 6) e.currentTarget.style.backgroundColor = "#8B6914"; }}
                onMouseLeave={(e) => { if (!loading && otp.length === 6) e.currentTarget.style.backgroundColor = "#AB721E"; }}
              >
                {loading ? "VERIFYING..." : isNew ? "CREATE ACCOUNT →" : "VERIFY & CONTINUE →"}
              </button>

              {/* Resend */}
              <div style={{ textAlign: "center" }}>
                {resendTimer > 0
                  ? <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B" }}>Resend OTP in <strong style={{ color: "#1f1b15" }}>{resendTimer}s</strong></p>
                  : <button onClick={handleResend} disabled={loading} style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#AB721E", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Resend OTP</button>
                }
              </div>
            </div>
          )}

          {/* Legal */}
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", textAlign: "center", marginTop: "24px", lineHeight: 1.7 }}>
            By continuing, you agree to our{" "}
            <span style={{ color: "#AB721E", cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/terms")}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#AB721E", cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/privacy")}>Privacy Policy</span>.
          </p>

        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: "#2B2112", padding: "24px" }}>
        <div className="mx-auto max-w-[1100px]" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", fontStyle: "italic", color: "#F5E6D0" }}>Naarisa</span>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {["Sustainability", "Shipping & Returns", "Contact Us"].map((l) => (
              <span key={l} style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4A882", cursor: "pointer", letterSpacing: "0.06em" }}>{l}</span>
            ))}
          </div>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B" }}>© 2024 Naarisa. Artisanal Craftsmanship, Contemporary Luxury.</span>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;