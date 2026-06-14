import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE, VARIANT } from '../../Constants/apiroutes.js';

// ─── Rich Text Viewer ─────────────────────────────────────────────────────────
function RichView({ html, style = {} }) {
  if (!html) return null;
  return (
    <>
      <style>{`
        .rich-view ul {
          list-style: disc;
          padding-left: 20px;
          margin: 4px 0;
        }
        .rich-view ol {
          list-style: decimal;
          padding-left: 20px;
          margin: 4px 0;
        }
        .rich-view li {
          margin-bottom: 4px;
          line-height: 1.6;
        }
        .rich-view b, .rich-view strong {
          font-weight: 700;
        }
        .rich-view i, .rich-view em {
          font-style: italic;
        }
        .rich-view u {
          text-decoration: underline;
        }
      `}</style>
      <div
        className="rich-view"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "inherit",
          ...style,
        }}
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductPage = () => {
  const { id } = useParams();

  const [variant, setVariant] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVariant = async () => {
      if (!id) return;
      try {
        const res = await fetch(
          `${BASE.ROUTE}${VARIANT.GET_BY_ID(id)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await res.json();
        if (result.success) {
          setVariant(result.data);
          setProduct(result.data.productId);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVariant();
  }, [id, token]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!variant || !product) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Variant Not Found</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "'Segoe UI', sans-serif", display: "flex", gap: 48, flexWrap: "wrap" }}>

      {/* ── IMAGE SECTION ── */}
      <div style={{ flex: "0 0 420px", minWidth: 280 }}>
        <div style={{ background: "#f3f4f6", borderRadius: 16, overflow: "hidden", aspectRatio: "1/1" }}>
          {variant.images?.[selectedImage]?.url ? (
            <img
              src={variant.images[selectedImage].url}
              alt={product?.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#aaa" }}>
              No Image
            </div>
          )}
        </div>

        {variant.images?.length > 1 && (
          <div style={{ display: "flex", gap: 12, marginTop: 16, overflowX: "auto" }}>
            {variant.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                style={{
                  width: 72, height: 72,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `2px solid ${selectedImage === index ? "#111" : "#e5e7eb"}`,
                  flexShrink: 0,
                  padding: 0,
                  cursor: "pointer",
                  background: "none",
                }}
              >
                <img src={img.url} alt={`Product ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DETAILS SECTION ── */}
      <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Title + Price */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6" }}>
            {product?.category}
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111", margin: "6px 0 4px", lineHeight: 1.2 }}>
            {product?.name}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {variant.isBestSeller && (
              <span
                style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Best Seller
              </span>
            )}

            {variant.isNewArrival && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                New Arrival
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px" }}>
            Color: <span style={{ fontWeight: 600, color: "#555" }}>{variant.color?.name}</span>
            <span style={{
              display: "inline-block",
              width: 12, height: 12,
              borderRadius: "50%",
              background: variant.color?.hex || "#ccc",
              marginLeft: 6,
              verticalAlign: "middle",
              border: "1px solid #e5e7eb",
            }} />
          </p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#111", margin: 0 }}>
            ₹{variant.discountPrice || product?.basePrice}
            {variant.discountPrice && product?.basePrice && variant.discountPrice < product.basePrice && (
              <span style={{ fontSize: 15, color: "#aaa", textDecoration: "line-through", marginLeft: 10, fontWeight: 400 }}>
                ₹{product.basePrice}
              </span>
            )}
          </p>
        </div>

        {/* Sizes */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: 10 }}>
            Sizes & Stock
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {variant.sizes?.map((s, i) => (
              <div key={i} style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                fontWeight: 600,
                background: s.quantity === 0 ? "#f9fafb" : "#fff",
                color: s.quantity === 0 ? "#bbb" : "#111",
              }}>
                {s.size}
                <span style={{ fontSize: 11, color: "#aaa", marginLeft: 6, fontWeight: 400 }}>
                  ({s.quantity} left)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
          <h3 style={PV.sectionHeading}>Description</h3>
          <RichView html={variant.description} style={{ color: "#555" }} />
        </div>

        {/* Styling Tips */}
        {/* <div style={{ background: "#eff6ff", borderRadius: 12, padding: "16px 20px" }}>
          <h3 style={{ ...PV.sectionHeading, color: "#1d4ed8", marginBottom: 8 }}>Styling Tips</h3>
          <RichView html={variant.stylingTips} style={{ color: "#1e40af", opacity: 0.85 }} />
        </div> */}

        {/* Fabric & Care */}
        <div>
          <h3 style={PV.sectionHeading}>Fabric & Care</h3>
          <RichView html={variant.fabricCare} style={{ color: "#555" }} />
        </div>

        <div>
          <h3 style={PV.sectionHeading}>Return & Exchange</h3>
          <RichView
            html={variant.returnExchange}
            style={{ color: "#555" }}
          />
        </div>

        {/* Tags */}
        {product?.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {product.tags.map((tag, i) => (
              <span key={i} style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: 99, fontSize: 12, color: "#666" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Status */}
        <div style={{ display: "inline-block" }}>
          <span style={{
            padding: "7px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            background: variant.isActive ? "#dcfce7" : "#f3f4f6",
            color: variant.isActive ? "#16a34a" : "#888",
          }}>
            {variant.isActive ? "✓ Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
};

const PV = {
  sectionHeading: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#555",
    margin: "0 0 8px",
  },
};

export default ProductPage;