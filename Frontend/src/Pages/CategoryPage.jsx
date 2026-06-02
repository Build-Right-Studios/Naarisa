import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance.js";
import { BASE, PRODUCT } from "../Constants/apiRoutes.js";
import useCartStore from "../store/useCartStore.js";

// ── Banner imports ────────────────────────────────────────────────────────────
import shortKurtisBanner from "../assets/Short Kurtis Banner.png";
import longKurtisBanner  from "../assets/Long Kurtis Banner.png";
import dressesBanner     from "../assets/Dresses Banner.png";

// ── Category config ───────────────────────────────────────────────────────────
// slug must match the URL: /categories/:slug
// slug  = URL segment (/categories/:slug)
// apiParam = value stored in product.category field in your DB
// Make sure these match exactly what you used when adding products via /add-product
const CATEGORY_CONFIG = {
  "short-kurtis": {
    label:    "Short Kurtis",
    tagline:  "Chic, versatile and effortlessly yours.",
    banner:   shortKurtisBanner,
    apiParam: "short-kurtis",
  },
  "long-kurtis": {
    label:    "Long Kurtis",
    tagline:  "Timeless silhouettes. Effortless elegance.",
    banner:   longKurtisBanner,
    apiParam: "long-kurtis",
  },
  "dresses": {
    label:    "Dresses",
    tagline:  "Flowy silhouettes, timeless prints and elegance in every detail.",
    banner:   dressesBanner,
    apiParam: "dresses",
  },
};

// ── Add to Cart Toast ─────────────────────────────────────────────────────────
const Toast = ({ visible }) => (
  <div style={{
    position: "fixed", bottom: "90px", left: "50%",
    transform: `translateX(-50%) translateY(${visible ? "0" : "12px"})`,
    opacity: visible ? 1 : 0, transition: "all 0.3s ease",
    backgroundColor: "#2B2112", color: "#F5E6D0",
    fontFamily: "'Jost', sans-serif", fontSize: "12px",
    fontWeight: 600, letterSpacing: "0.1em",
    padding: "10px 20px", zIndex: 100,
    pointerEvents: "none", whiteSpace: "nowrap",
  }}>
    ✓ Added to cart
  </div>
);

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx]   = useState(0);

  const variant = product.variants?.[0] || product.currentVariant || {};
  const images  = variant.images || [];
  const price   = variant.discountPrice || product.basePrice || 0;
  const mrp     = product.basePrice || 0;
  const discount = mrp && variant.discountPrice && variant.discountPrice < mrp
    ? Math.round(((mrp - variant.discountPrice) / mrp) * 100)
    : null;
  const slug    = variant.slug || product.slug;

  // Swap to second image on hover (if available)
  useEffect(() => {
    setImgIdx(hovered && images.length > 1 ? 1 : 0);
  }, [hovered, images.length]);

  return (
    <div
      style={{ cursor: "pointer", backgroundColor: "#fff" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${slug}`)}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", backgroundColor: "#F5E6D0" }}>
        {images.length > 0 ? (
          <img
            src={images[imgIdx]?.url}
            alt={product.name}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s ease, opacity 0.3s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#8C7B6B", letterSpacing: "0.1em" }}>NAARISA</span>
          </div>
        )}

        {discount && (
          <div style={{
            position: "absolute", top: "12px", left: 0,
            backgroundColor: "#2D6B5A", color: "#fff",
            fontFamily: "'Jost', sans-serif", fontSize: "10px",
            fontWeight: 700, letterSpacing: "0.1em",
            padding: "4px 10px",
          }}>
            -{discount}%
          </div>
        )}

        {/* Quick add — appears on hover, desktop only */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product, variant); }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: "#2B2112", color: "#F5E6D0",
            fontFamily: "'Jost', sans-serif", fontSize: "11px",
            fontWeight: 700, letterSpacing: "0.14em",
            padding: "12px", border: "none", cursor: "pointer",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
          className="hidden sm:block"
        >
          QUICK ADD
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 4px 16px" }}>
        <p style={{
          fontFamily: "'EB Garamond', serif", fontSize: "15px",
          color: "#1f1b15", lineHeight: 1.35, marginBottom: "6px",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {product.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "14px", fontWeight: 600, color: "#1f1b15" }}>
            ₹{price.toLocaleString("en-IN")}
          </span>
          {discount && (
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B", textDecoration: "line-through" }}>
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {product.variants?.length > 1 && (
          <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
            {product.variants.slice(0, 4).map((v, i) => (
              <div
                key={i}
                title={v.color?.name}
                style={{
                  width: "14px", height: "14px", borderRadius: "50%",
                  backgroundColor: v.color?.hex || "#ccc",
                  border: "1.5px solid #E8DDD0",
                }}
              />
            ))}
            {product.variants.length > 4 && (
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", color: "#8C7B6B", alignSelf: "center" }}>
                +{product.variants.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div>
    <div className="animate-pulse" style={{ aspectRatio: "3/4", backgroundColor: "#E8DDD0" }} />
    <div style={{ padding: "12px 4px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div className="animate-pulse" style={{ height: "16px", width: "80%", backgroundColor: "#E8DDD0", borderRadius: "2px" }} />
      <div className="animate-pulse" style={{ height: "14px", width: "40%", backgroundColor: "#E8DDD0", borderRadius: "2px" }} />
    </div>
  </div>
);

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest",        value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Discount",      value: "discount" },
];

// ── Main Category Page ────────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const addItem    = useCartStore((s) => s.addItem);

  const config = CATEGORY_CONFIG[slug];

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sort, setSort]           = useState("newest");
  const [toastVisible, setToast]  = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const LIMIT = 12;

  // ── Fetch ──
  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setProducts([]);
    setPage(1);

    const fetchProducts = async () => {
      try {
        const res = await api.get(
          `${PRODUCT.BY_CATEGORY(config.apiParam)}&limit=${LIMIT}&page=1&sort=${sort}`
        );

        const data = res.data?.data || [];
        setProducts(data);
        setHasMore(res.data?.hasMore || false);
      } catch (err) {
        console.error("Failed to fetch category products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, sort]);

  // ── Load more ──
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    try {
      const res = await api.get(
        `${PRODUCT.BY_CATEGORY(config.apiParam)}&limit=${LIMIT}&page=${nextPage}&sort=${sort}`
      );
      const data = res.data?.data || [];
      setProducts((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(res.data?.hasMore || false);
    } catch (err) {
      console.error("Load more failed:", err);
    }
  };

  // ── Quick add to cart (picks first available size) ──
  const handleQuickAdd = (product, variant) => {
    const firstSize = variant.sizes?.find((s) => s.quantity > 0)?.size;
    if (!firstSize) return navigate(`/product/${variant.slug || product.slug}`);

    addItem({
      productId: product._id,
      variantId: variant._id,
      name:      product.name,
      color:     variant.color?.name || "",
      size:      firstSize,
      price:     variant.discountPrice || product.basePrice,
      image:     variant.images?.[0]?.url || null,
      slug:      variant.slug || product.slug,
    });

    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  // ── Unknown slug ──
  if (!config) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9F3EB" }}>
        <p style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>Category not found.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      <Toast visible={toastVisible} />

      {/* ── Hero Banner ── */}
      <div style={{ width: "100%", position: "relative", overflow: "hidden", backgroundColor: "#2B2112" }}>
        {config.banner ? (
          <img
            src={config.banner}
            alt={config.label}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        ) : (
          // Fallback when banner image not yet imported
          <div style={{
            width: "100%", height: "clamp(260px, 40vw, 520px)",
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", justifyContent: "center",
            padding: "0 8%", backgroundColor: "#2B2112",
          }}>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "#AB721E", marginBottom: "12px" }}>
              EVERYDAY ELEGANCE
            </p>
            <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: "clamp(36px, 6vw, 80px)", fontWeight: 400, color: "#F5E6D0", lineHeight: 1.1, marginBottom: "16px" }}>
              {config.label}
            </h1>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "clamp(13px, 1.5vw, 16px)", color: "#C4A882", fontWeight: 300 }}>
              {config.tagline}
            </p>
          </div>
        )}
      </div>

      {/* ── Breadcrumb + Controls ── */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 xl:px-12">

        {/* Breadcrumb */}
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", letterSpacing: "0.14em", color: "#8C7B6B", textTransform: "uppercase", padding: "20px 0 0" }}>
          <span className="cursor-pointer hover:text-[#C47B1E] transition-colors" onClick={() => navigate("/")}>Home</span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#1f1b15" }}>{config.label}</span>
        </p>

        {/* Title row + sort */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "16px 0 24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 400, color: "#1f1b15", marginBottom: "2px" }}>
              {config.label}
            </h1>
            {!loading && (
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B", letterSpacing: "0.08em" }}>
                {products.length} {products.length === 1 ? "style" : "styles"}
              </p>
            )}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: "12px",
                fontWeight: 600, letterSpacing: "0.1em", color: "#1f1b15",
                backgroundColor: "#fff", border: "1px solid #E8DDD0",
                padding: "10px 36px 10px 14px", appearance: "none",
                cursor: "pointer", outline: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4" style={{ paddingBottom: "60px" }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
              ? products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onAddToCart={handleQuickAdd}
                  />
                ))
              : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", color: "#8C7B6B", marginBottom: "8px" }}>
                    No styles found
                  </p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#C4A882" }}>
                    Check back soon — new arrivals are on their way.
                  </p>
                </div>
              )
          }
        </div>

        {/* ── Load More ── */}
        {hasMore && !loading && (
          <div style={{ textAlign: "center", paddingBottom: "60px" }}>
            <button
              onClick={handleLoadMore}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: "12px",
                fontWeight: 700, letterSpacing: "0.14em", color: "#1f1b15",
                backgroundColor: "transparent", border: "1px solid #1f1b15",
                padding: "14px 40px", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1f1b15"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1f1b15"; }}
            >
              LOAD MORE
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;