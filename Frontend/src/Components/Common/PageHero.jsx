import React from "react";

const PageHero = ({
  eyebrow,
  title,
  subtitle,
}) => {
  return (
    <div
      style={{
        backgroundColor: "#1f1b15",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {eyebrow && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#AB721E",
            marginBottom: "10px",
          }}
        >
          {eyebrow}
        </p>
      )}

      <h1
        style={{
          fontFamily: "'EB Garamond', serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          color: "#F9F3EB",
          fontWeight: 400,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "13px",
            color: "#8C7B6B",
            marginTop: "10px",
            letterSpacing: "0.06em",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHero;