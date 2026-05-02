const BannerCard = ({ banner, onDelete }) => {
  const { _id, title, desktopImage, link, order, isActive } = banner;

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "12px",
      overflow: "hidden"
    }}>
      <img
        src={desktopImage}
        alt={title}
        style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }}
      />

      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>
          {title}
        </p>
        <p style={{
          fontSize: "12px",
          color: "var(--color-text-tertiary)",
          margin: "0 0 10px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {link || "No redirect link"}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "20px",
              fontWeight: 500,
              background: isActive ? "var(--color-background-success)" : "var(--color-background-secondary)",
              color: isActive ? "var(--color-text-success)" : "var(--color-text-secondary)"
            }}>
              {isActive ? "Active" : "Inactive"}
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
              Order {order}
            </span>
          </div>

          <button
            onClick={() => onDelete(_id)}
            style={{
              background: "var(--color-background-danger)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "var(--color-text-danger)"
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 3h9M4.5 3V1.5h3V3M5 5.5v3M7 5.5v3M2.5 3l.5 7h6l.5-7"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;