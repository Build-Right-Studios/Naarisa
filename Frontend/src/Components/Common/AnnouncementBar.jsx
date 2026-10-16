import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE, ANNOUNCEMENT } from "../../Constants/apiRoutes.js";

const DISMISS_KEY = "naarisa-dismissed-announcements";
const ROTATE_MS = 5000;

// A bar is re-shown after the admin edits it (the key includes updatedAt)
const dismissKey = (a) => `${a._id}:${a.updatedAt}`;

const readDismissed = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISS_KEY)) || [];
  } catch {
    return [];
  }
};

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    axios
      .get(`${BASE.ROUTE}${ANNOUNCEMENT.LIVE}`)
      .then((res) => {
        const dismissed = readDismissed();
        setAnnouncements((res.data?.data || []).filter((a) => !dismissed.includes(dismissKey(a))));
      })
      .catch(() => {}); // the bar is optional; never break the page over it
  }, []);

  useEffect(() => {
    if (announcements.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % announcements.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!announcements.length) return null;
  const current = announcements[index % announcements.length];

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, JSON.stringify([...readDismissed(), ...announcements.map(dismissKey)]));
    } catch {
      // storage unavailable — just hide it for this page view
    }
    setAnnouncements([]);
  };

  const content = (
    <>
      <span>{current.message}</span>
      {current.linkText && (
        <span style={{ fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap" }}>
          {current.linkText} →
        </span>
      )}
    </>
  );

  const contentStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px 12px",
    color: "inherit",
    textDecoration: "none",
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      style={{
        position: "relative",
        backgroundColor: current.backgroundColor,
        color: current.textColor,
        fontFamily: "'Jost', sans-serif",
        fontSize: "clamp(11px, 2.8vw, 13px)",
        letterSpacing: "0.06em",
        lineHeight: 1.4,
        textAlign: "center",
        padding: "9px 44px",
        transition: "background-color 0.4s ease",
      }}
    >
      {!current.link ? (
        <div style={contentStyle}>{content}</div>
      ) : current.link.startsWith("/") ? (
        <Link to={current.link} style={contentStyle}>{content}</Link>
      ) : (
        <a href={current.link} target="_blank" rel="noopener noreferrer" style={contentStyle}>{content}</a>
      )}

      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "32px",
          height: "32px",
          background: "transparent",
          border: "none",
          color: "inherit",
          opacity: 0.75,
          fontSize: "18px",
          lineHeight: 1,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default AnnouncementBar;
