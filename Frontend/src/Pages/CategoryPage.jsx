import { useState, useEffect, useRef } from "react";
import FilterPanel, { FilterTriggerButton, FILTER_DEFAULTS, countActiveFilters } from "./FilterPanel";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance.js";
import PageHero from "../Components/Common/PageHero.jsx";
import ProductCard from "../Components/Common/ProductCard.jsx";
import { BASE, PRODUCT } from "../Constants/apiRoutes.js";
import useCartStore from "../Store/useCartStore.js";
import { useProductQueryState } from "../Components/Common/useProductQueryState";

// ── Banner imports ────────────────────────────────────────────────────────────
import shortKurtisBanner from "../assets/Short Kurtis Banner.png";
import longKurtisBanner from "../assets/Long Kurtis Banner.png";
import dressesBanner from "../assets/Dresses Banner.png";
import kurtiSetsBanner from "../assets/Kurti Set Banner.png"

// ── Category config ───────────────────────────────────────────────────────────
// slug must match the URL: /categories/:slug
// slug  = URL segment (/categories/:slug)
// apiParam = value stored in product.category field in your DB
// Make sure these match exactly what you used when adding products via /add-product
const CATEGORY_CONFIG = {
  "short-kurtis": {
    label: "Short Kurtis",
    tagline: "Chic, versatile and effortlessly yours.",
    banner: shortKurtisBanner,
    category: "Short Kurti",
  },

  "long-kurtis": {
    label: "Long Kurtis",
    tagline: "Timeless silhouettes. Effortless elegance.",
    banner: longKurtisBanner,
    category: "Long Kurti",
  },

  dresses: {
    label: "Dresses",
    tagline:
      "Flowy silhouettes, timeless prints and elegance in every detail.",
    banner: dressesBanner,
    category: "Dresses",
  },

  "kurti-sets": {
    label: "Kurti Sets",
    tagline: "Complete ensembles. Grace in every detail.",
    banner: kurtiSetsBanner,
    category: "Kurti Sets",
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
  { label: "Newest First", value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Name: A–Z", value: "alphabetical" }, // was "name_asc" — now synced with backend
];

// ── Main Category Page ────────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const config = CATEGORY_CONFIG[slug];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [toastVisible, setToast] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  // const [page, setPage] = useState(1);
  // const activeFilterCount = countActiveFilters(filters)
  // filters.availability.length +
  // filters.priceRange.length +
  // (filters.discount ? 1 : 0) +
  // filters.colours.length
  const LIMIT = 12;

  const {
    page,
    sort,
    filters,
    appliedFilters,
    setFilterKey,
    resetDraftToApplied,
    applyFilters,
    clearFilters,
    removeFilterValue,
    updateParam,
    buildApiParams,
  } = useProductQueryState({
    fixedCategory: config.category,
    defaultSort: "newest",
    limit: LIMIT,
  });

  const activeFilterCount = countActiveFilters(appliedFilters);

  // ── Fetch ──
  useEffect(() => {
    if (!config) return;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = buildApiParams();

        const res = await api.get(
          `${PRODUCT.BY_CATEGORY(encodeURIComponent(config.category))}&${params.toString()}`
        );

        setProducts(res.data.data || []);
        setHasMore(res.data.hasMore || false);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [config, buildApiParams]);

  // ── Load more ──
  const handleLoadMore = async () => {
    try {
      const nextPage = page + 1;

      const params = buildApiParams();
      params.set("page", String(nextPage));

      const res = await api.get(
        `${PRODUCT.BY_CATEGORY(
          encodeURIComponent(config.category)
        )}&${params.toString()}`
      );

      setProducts((prev) => [...prev, ...(res.data.data || [])]);
      setHasMore(res.data.hasMore || false);

      updateParam("page", String(nextPage));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Quick add to cart (picks first available size) ──
  const handleQuickAdd = (product, variant) => {
    const firstSize = variant.sizes?.find((s) => s.quantity > 0)?.size;
    if (!firstSize) return navigate(`/product/${variant.slug || product.slug}`);

    addItem({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      color: variant.color?.name || "",
      size: firstSize,
      price: variant.discountPrice || product.basePrice,
      image: variant.images?.[0]?.url || null,
      slug: variant.slug || product.slug,
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

      <PageHero
        eyebrow="Curated Collection"
        title={config.label}
        subtitle={config.tagline}
      />

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilterKey}
        onApply={() => {
          applyFilters();
          setFilterOpen(false);
        }}
        onClear={clearFilters}
        resultCount={products.length}
      />

      <Toast visible={toastVisible} />

      {/* ── Hero Banner ── */}
      {/* <div style={{ width: "100%", position: "relative", overflow: "hidden", backgroundColor: "#2B2112" }}>
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
      </div> */}

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
            {/* <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 400, color: "#1f1b15", marginBottom: "2px" }}>
              {config.label}
            </h1> */}
            {!loading && (
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B", letterSpacing: "0.08em" }}>
                {products.length} {products.length === 1 ? "style" : "styles"}
              </p>
            )}
          </div>

          {/* Sort dropdown */}
          {/* Right side controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "auto",
            }}
          >
            {/* Sort */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  color: "#8C7B6B",
                  textTransform: "uppercase",
                }}
              >
                Sort:
              </span>

              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "12px",
                  color: "#1f1b15",
                  backgroundColor: "#F9F3EB",
                  border: "1px solid #E8DDD0",
                  padding: "7px 28px 7px 12px",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter */}
            <FilterTriggerButton
              activeCount={activeFilterCount}
              onClick={() => {
                resetDraftToApplied();
                setFilterOpen(true);
              }}
            />
          </div>
          {/* <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ position: "relative", alignItems: "center", gap: "8px"  }}>
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: "#8C7B6B",
                textTransform: "uppercase",
              }}>
                Sort:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#1f1b15",
                  backgroundColor: "#fff",
                  border: "1px solid #E8DDD0",
                  padding: "10px 36px 10px 14px",
                  appearance: "none",
                  cursor: "pointer",
                  outline: "none",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <FilterTriggerButton
              activeCount={activeFilterCount}
              onClick={() => setFilterOpen(true)}
            />
          </div> */}
          {/* <FilterPanel
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            filters={filters}
            onChange={(key, val) =>
              setFilters((prev) => ({
                ...prev,
                [key]: val,
              }))
            }
            onApply={() => {
              setFilterOpen(false);
            }}
            onClear={() => setFilters(FILTER_DEFAULTS)}
            resultCount={products.length}
          /> */}

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
                  badge={
                    p.isBestSeller
                      ? "Best Seller"
                      : p.isNewArrival
                        ? "New"
                        : null
                  }
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