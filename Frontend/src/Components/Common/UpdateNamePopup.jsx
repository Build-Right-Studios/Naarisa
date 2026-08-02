import { useState } from "react";

export default function UpdateNamePopup({ currentName, onClose, onSave }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update name. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Welcome! 👋</h2>
        <p style={styles.subtitle}>
          Looks like your name isn't set yet. What should we call you?
        </p>

        <input
          autoFocus
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: "32px",
    width: "min(90vw, 380px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    fontFamily: "'Jost', sans-serif",
  },
  title: { margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#111" },
  subtitle: { margin: "0 0 20px", fontSize: 14, color: "#666", lineHeight: 1.5 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 8,
  },
  error: { color: "#ef4444", fontSize: 13, margin: "4px 0 0" },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  skipBtn: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: "10px 16px",
  },
  saveBtn: {
    background: "#AB721E",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};