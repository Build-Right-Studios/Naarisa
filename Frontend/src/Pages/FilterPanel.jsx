/**
 * FilterPanel — Naarisa
 *
 * Exports:
 *   default          FilterPanel
 *   FilterTriggerButton
 *   FILTER_DEFAULTS
 *   countActiveFilters
 */

import { useState, useEffect } from "react";

/* ─── Brand tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#F9F3EB",
  border: "#E8DDD0",
  textDark: "#1f1b15",
  textMid: "#8C7B6B",
  gold: "#AB721E",
  fontSerif: "'EB Garamond', serif",
  fontSans: "'Jost', sans-serif",
};

/* ─── Filter options ───────────────────────────────────────────────────────── */
const AVAILABILITY_OPTIONS = ["In Stock", "Out of Stock"];

const PRICE_RANGES = [
  { label: "Under ₹1,000", value: "0-1000" },
  { label: "₹1,000 – ₹2,000", value: "1000-2000" },
  { label: "₹2,000 – ₹3,500", value: "2000-3500" },
  { label: "₹3,500 – ₹5,000", value: "3500-5000" },
  { label: "Above ₹5,000", value: "5000-999999" },
];

const DISCOUNT_OPTIONS = [
  { label: "10% and above", value: 10 },
  { label: "20% and above", value: 20 },
  { label: "30% and above", value: 30 },
  { label: "40% and above", value: 40 },
];

const COLOUR_OPTIONS = [
  { name: "Beige", hex: "#E6D5B8" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "Blue", hex: "#2C5F8A" },
  { name: "Brown", hex: "#7B4F2C" },
  { name: "Dusty Pink", hex: "#D8A7B1" },
  { name: "Green", hex: "#2D6B5A" },
  { name: "Indigo", hex: "#3F4A8A" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Lilac", hex: "#C8A2C8" },
  { name: "Magenta", hex: "#C2185B" },
  { name: "Multicolour", hex: "linear-gradient(135deg,#E53935,#FB8C00,#FDD835,#43A047,#1E88E5,#8E24AA)" },
  { name: "Mustard", hex: "#C8A951" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Off-white", hex: "#F8F6F0" },
  { name: "Olive", hex: "#6B8E23" },
  { name: "Pink", hex: "#E91E63" },
  { name: "Powder Blue", hex: "#B0E0E6" },
  { name: "Rani Pink", hex: "#E75480" },
  { name: "Red", hex: "#C0392B" },
  { name: "Rosewood", hex: "#65000B" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Teal", hex: "#008080" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Yellow", hex: "#F4C430" },
];

/* ─── Defaults (exported so pages can initialise state) ────────────────────── */
export const FILTER_DEFAULTS = {
  availability: [],
  priceRange: [],
  discount: null,
  colours: [],
  // fabrics + occasions omitted until schema fields are added
};

/* ─── Active filter count (exported for badge in pages) ────────────────────── */
export function countActiveFilters(f) {
  return (
    f.availability.length +
    f.priceRange.length +
    (f.discount ? 1 : 0) +
    f.colours.length
  );
}

function toggleInArray(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

/* ─── Accordion section ────────────────────────────────────────────────────── */
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "18px 0",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: T.fontSans, fontSize: "12px", fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDark,
        }}
      >
        {title}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={T.textMid} strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div style={{ overflow: "hidden", maxHeight: open ? "600px" : "0px", transition: "max-height 0.3s ease" }}>
        <div style={{ paddingBottom: "18px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Pill chip ────────────────────────────────────────────────────────────── */
function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", fontFamily: T.fontSans, fontSize: "11px",
      letterSpacing: "0.06em",
      border: `1px solid ${active ? T.textDark : T.border}`,
      backgroundColor: active ? T.textDark : "transparent",
      color: active ? T.bg : T.textDark,
      cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

/* ─── Colour swatch ────────────────────────────────────────────────────────── */
function ColourSwatch({ colour, active, onClick }) {
  return (
    <button onClick={onClick} title={colour.name} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "5px", background: "none", border: "none", cursor: "pointer", padding: "4px",
    }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background:
            colour.name === "Multicolour"
              ? "linear-gradient(135deg,#E53935,#FB8C00,#FDD835,#43A047,#1E88E5,#8E24AA)"
              : colour.hex,
          border: active
            ? `2px solid ${T.textDark}`
            : `1.5px solid ${T.border}`,
          boxShadow: active
            ? `0 0 0 2px ${T.bg}, 0 0 0 3px ${T.textDark}`
            : "none",
          transition: "all 0.18s",
        }}
      />
      <span style={{
        fontFamily: T.fontSans, fontSize: "9px", letterSpacing: "0.04em",
        color: active ? T.textDark : T.textMid, fontWeight: active ? 600 : 400,
        textAlign: "center", maxWidth: "36px", lineHeight: 1.2,
      }}>
        {colour.name}
      </span>
    </button>
  );
}

/* ─── Main FilterPanel ─────────────────────────────────────────────────────── */
export default function FilterPanel({ open, onClose, filters = FILTER_DEFAULTS, onChange, onApply, onClear, resultCount }) {
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggle = (key, val) => onChange(key, toggleInArray(filters[key], val));

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(43,33,18,0.5)",
        backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }} />

      {/* Panel */}
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201,
        width: "min(420px, 92vw)", backgroundColor: T.bg,
        boxShadow: "-4px 0 32px rgba(43,33,18,0.12)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", overflowY: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "24px 24px 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: T.fontSerif, fontSize: "20px", color: T.textDark, fontWeight: 400 }}>
              Filters
            </span>
            {activeCount > 0 && (
              <span style={{
                fontFamily: T.fontSans, fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.06em", backgroundColor: T.textDark,
                color: T.bg, borderRadius: "999px", padding: "2px 8px",
              }}>
                {activeCount}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {activeCount > 0 && (
              <button onClick={onClear} style={{
                fontFamily: T.fontSans, fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.08em", color: T.gold, background: "none",
                border: "none", cursor: "pointer", textTransform: "uppercase",
                textDecoration: "underline", textUnderlineOffset: "3px",
              }}>
                Clear all
              </button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textMid} strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable sections */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px", WebkitOverflowScrolling: "touch" }}>

          <Section title="Availability" defaultOpen>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <Chip key={opt} label={opt}
                  active={filters.availability.includes(opt)}
                  onClick={() => toggle("availability", opt)}
                />
              ))}
            </div>
          </Section>

          <Section title="Price">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PRICE_RANGES.map((r) => {
                const active = filters.priceRange.includes(r.value);
                return (
                  <label key={r.value} onClick={() => toggle("priceRange", r.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      cursor: "pointer", fontFamily: T.fontSans, fontSize: "13px",
                      color: active ? T.textDark : T.textMid, fontWeight: active ? 600 : 400,
                    }}
                  >
                    <div style={{
                      width: "16px", height: "16px", flexShrink: 0, cursor: "pointer",
                      border: `1.5px solid ${active ? T.textDark : T.border}`,
                      backgroundColor: active ? T.textDark : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#F9F3EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {r.label}
                  </label>
                );
              })}
            </div>
          </Section>

          <Section title="Discount">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {DISCOUNT_OPTIONS.map((d) => (
                <Chip key={d.value} label={d.label}
                  active={filters.discount === d.value}
                  onClick={() => onChange("discount", filters.discount === d.value ? null : d.value)}
                />
              ))}
            </div>
          </Section>

          <Section title="Colour">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", gap: "6px" }}>
              {COLOUR_OPTIONS.map((c) => (
                <ColourSwatch key={c.name} colour={c}
                  active={filters.colours.includes(c.name)}
                  onClick={() => toggle("colours", c.name)}
                />
              ))}
            </div>
          </Section>

          {/* Fabric & Occasion hidden until schema fields are added */}

        </div>

        {/* CTA */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, flexShrink: 0, backgroundColor: T.bg }}>
          <button
            onClick={onApply}
            style={{
              width: "100%", padding: "14px", fontFamily: T.fontSans,
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", backgroundColor: T.gold,
              color: "#fff", border: "none", cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#8f5e17"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = T.gold}
          >
            {"View Results"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── FilterTriggerButton ──────────────────────────────────────────────────── */
export function FilterTriggerButton({ activeCount = 0, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        padding: "9px 18px", fontFamily: "'Jost', sans-serif",
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#1f1b15",
        backgroundColor: "transparent", border: "1px solid #E8DDD0",
        cursor: "pointer", transition: "border-color 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#1f1b15"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E8DDD0"}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="8" cy="6" r="2" fill="#F9F3EB" strokeWidth="1.75" />
        <circle cx="16" cy="12" r="2" fill="#F9F3EB" strokeWidth="1.75" />
        <circle cx="10" cy="18" r="2" fill="#F9F3EB" strokeWidth="1.75" />
      </svg>
      Filters
      {activeCount > 0 && (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: "18px", height: "18px", borderRadius: "999px",
          backgroundColor: "#1f1b15", color: "#F9F3EB",
          fontFamily: "'Jost', sans-serif", fontSize: "9px",
          fontWeight: 700, padding: "0 5px", lineHeight: 1,
        }}>
          {activeCount}
        </span>
      )}
    </button>
  );
}