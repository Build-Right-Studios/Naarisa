import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const CATEGORIES = ["All", "Dresses", "Work", "Short Kurti", "Long Kurti", "Co-ords", "Tops"];

const SORT_OPTIONS = [
  { label: "Newest First",    value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Name: A–Z",       value: "name_asc" },
];

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

const SkeletonCard = () => (
  <div>
    <div
      className="animate-pulse"
      style={{ aspectRatio: "3/4", backgroundColor: "#E8DDD0" }}
    />
    <div style={{ padding: "12px 4px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div className="animate-pulse" style={{ height: "16px", width: "75%", backgroundColor: "#E8DDD0" }} />
      <div className="animate-pulse" style={{ height: "14px", width: "35%", backgroundColor: "#E8DDD0" }} />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Product Card                                                                */
/* -------------------------------------------------------------------------- */

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", backgroundColor: "#fff" }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          overflow: "hidden",
          backgroundColor: "#F5E6D0",
        }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .5s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Jost', sans-serif",
              color: "#8C7B6B",
              letterSpacing: "0.1em",
              fontSize: "12px",
            }}
          >
            NAARISA
          </div>
        )}

        {/* Category pill */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            backgroundColor: "rgba(43,33,18,0.72)",
            backdropFilter: "blur(4px)",
            color: "#F9F3EB",
            fontFamily: "'Jost', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "3px 8px",
          }}
        >
          {product.category}
        </div>
      </div>

      <div style={{ padding: "12px 4px 16px" }}>
        <p
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: "15px",
            color: "#1f1b15",
            lineHeight: 1.35,
            marginBottom: "6px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#1f1b15",
            }}
          >
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
        </div>

        {product.color?.hex && (
          <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
            <div
              title={product.color.name}
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: product.color.hex,
                border: "1px solid #E8DDD0",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Filter Drawer (Mobile)                                                      */
/* -------------------------------------------------------------------------- */

const FilterDrawer = ({ open, onClose, activeCategory, onCategory, activeSort, onSort }) => (
  <>
    {/* Backdrop */}
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(43,33,18,0.45)",
        backdropFilter: "blur(3px)",
        zIndex: 40,
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }}
    />

    {/* Drawer */}
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "#F9F3EB",
        borderTop: "1px solid #E8DDD0",
        padding: "28px 20px 40px",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s ease",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", color: "#1f1b15" }}>
          Filter & Sort
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C7B6B" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sort */}
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B", textTransform: "uppercase", marginBottom: "12px" }}>
        Sort By
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { onSort(opt.value); }}
            style={{
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 14px",
              fontFamily: "'Jost', sans-serif",
              fontSize: "14px",
              color: activeSort === opt.value ? "#AB721E" : "#1f1b15",
              backgroundColor: activeSort === opt.value ? "#F5E6D0" : "transparent",
              fontWeight: activeSort === opt.value ? 600 : 400,
              transition: "all 0.2s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category */}
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B", textTransform: "uppercase", marginBottom: "12px" }}>
        Category
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { onCategory(cat); onClose(); }}
            style={{
              padding: "8px 16px",
              fontFamily: "'Jost', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.06em",
              cursor: "pointer",
              border: "1px solid",
              transition: "all 0.2s",
              borderColor: activeCategory === cat ? "#1f1b15" : "#E8DDD0",
              backgroundColor: activeCategory === cat ? "#1f1b15" : "transparent",
              color: activeCategory === cat ? "#F9F3EB" : "#1f1b15",
              fontWeight: activeCategory === cat ? 600 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  </>
);

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const AllProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "All";
  const activeSort     = searchParams.get("sort")     || "newest";
  const activePage     = parseInt(searchParams.get("page") || "1", 10);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== "page") next.set("page", "1"); // reset page on filter/sort change
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.set("category", activeCategory);
      params.set("sort",  activeSort);
      params.set("page",  activePage);
      params.set("limit", 12);

      const res = await api.get(`${PRODUCT.GET_ALL}?${params.toString()}`);
      setProducts(res.data?.data?.products || []);
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 12 });
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSort, activePage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeCategory={activeCategory}
        onCategory={(cat) => updateParam("category", cat)}
        activeSort={activeSort}
        onSort={(val) => { updateParam("sort", val); setDrawerOpen(false); }}
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 xl:px-12">

        {/* Breadcrumb */}
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.14em",
            color: "#8C7B6B",
            textTransform: "uppercase",
            padding: "24px 0 0",
          }}
        >
          <span onClick={() => navigate("/")} className="cursor-pointer hover:text-[#AB721E]">
            Home
          </span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#1f1b15" }}>All Products</span>
        </p>

        {/* Heading */}
        <div style={{ padding: "16px 0 0" }}>
          <h1
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "clamp(24px,3vw,36px)",
              color: "#1f1b15",
              fontWeight: 400,
            }}
          >
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h1>
          {!loading && (
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B", letterSpacing: "0.08em", marginTop: "4px" }}>
              {pagination.total} styles
            </p>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 0 24px",
            borderBottom: "1px solid #E8DDD0",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Category pills — desktop */}
          <div className="hidden md:flex" style={{ gap: "8px", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam("category", cat)}
                style={{
                  padding: "7px 16px",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all 0.2s",
                  borderColor: activeCategory === cat ? "#1f1b15" : "#E8DDD0",
                  backgroundColor: activeCategory === cat ? "#1f1b15" : "transparent",
                  color: activeCategory === cat ? "#F9F3EB" : "#1f1b15",
                  fontWeight: activeCategory === cat ? 600 : 400,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>

            {/* Sort — desktop */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", letterSpacing: "0.1em", color: "#8C7B6B", textTransform: "uppercase" }}>
                Sort:
              </span>
              <select
                value={activeSort}
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
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filter & Sort — mobile */}
            <button
              className="flex md:hidden"
              onClick={() => setDrawerOpen(true)}
              style={{
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#1f1b15",
                backgroundColor: "transparent",
                border: "1px solid #E8DDD0",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="2" />
              </svg>
              Filter & Sort
            </button>

          </div>
        </div>

        {/* ── Grid ── */}
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          style={{ paddingTop: "32px", paddingBottom: "60px" }}
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : products.length ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "24px", color: "#8C7B6B" }}>
                No products found
              </p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4A882", marginTop: "8px" }}>
                Try a different category or clear your filters
              </p>
              <button
                onClick={() => setSearchParams({})}
                style={{
                  marginTop: "20px",
                  padding: "10px 24px",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  backgroundColor: "#1f1b15",
                  color: "#F9F3EB",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              paddingBottom: "80px",
            }}
          >
            {/* Prev */}
            <button
              onClick={() => updateParam("page", activePage - 1)}
              disabled={activePage === 1}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #E8DDD0",
                backgroundColor: "transparent",
                cursor: activePage === 1 ? "not-allowed" : "pointer",
                opacity: activePage === 1 ? 0.4 : 1,
                transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f1b15" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam("page", page)}
                style={{
                  width: "36px",
                  height: "36px",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "13px",
                  fontWeight: activePage === page ? 700 : 400,
                  border: "1px solid",
                  borderColor: activePage === page ? "#1f1b15" : "#E8DDD0",
                  backgroundColor: activePage === page ? "#1f1b15" : "transparent",
                  color: activePage === page ? "#F9F3EB" : "#1f1b15",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => updateParam("page", activePage + 1)}
              disabled={activePage === totalPages}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #E8DDD0",
                backgroundColor: "transparent",
                cursor: activePage === totalPages ? "not-allowed" : "pointer",
                opacity: activePage === totalPages ? 0.4 : 1,
                transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f1b15" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllProductsPage;