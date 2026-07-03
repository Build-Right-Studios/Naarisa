import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FilterPanel, { FilterTriggerButton, countActiveFilters } from "./FilterPanel";
import PageHero from "../Components/Common/PageHero.jsx";
import ProductCard from "../Components/Common/ProductCard.jsx";
import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";
import { useProductQueryState } from "../Components/Common/useProductQueryState.js";

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  "All",
  "Dresses",
  "Short Kurti",
  "Long Kurti",
  "Kurti Sets"
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low–High", value: "price_asc" },
  { label: "Price: High–Low", value: "price_desc" },
  { label: "Name: A–Z", value: "alphabetical" },
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
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const AllProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });
  const [filterOpen, setFilterOpen] = useState(false);

  // ── All category/sort/page/filter <-> URL logic lives in this hook now ──
  const {
    category, sort, page,
    filters, appliedFilters,
    setFilterKey, resetDraftToApplied,
    applyFilters, clearFilters, removeFilterValue,
    updateParam,
    buildApiParams,
  } = useProductQueryState();

  // ── Fetch ── always reads current URL state via buildApiParams
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildApiParams();
      const res = await api.get(`${PRODUCT.GET_ALL}?${params.toString()}`);
      setProducts(res.data?.data?.products || []);
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 12 });
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildApiParams]);

  // Re-fetch whenever the URL (category, sort, page, or filters) changes
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const activeFilterCount = countActiveFilters(appliedFilters);

  const handleFilterApply = () => {
    setFilterOpen(false);
    applyFilters(); // writes filters to URL, resets page to 1, triggers fetch via useEffect
  };

  const openFilterPanel = () => {
    resetDraftToApplied();
    setFilterOpen(true);
  };

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      <PageHero
        eyebrow="Explore"
        title="All Products"
        subtitle="Discover every Naarisa style"
      />

      {/* ── Filter Panel ── */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilterKey}
        onApply={handleFilterApply}
        onClear={clearFilters}
        resultCount={pagination.total}
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
          {!loading && (
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "12px",
              color: "#8C7B6B",
              letterSpacing: "0.08em",
              marginTop: "4px",
            }}>
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
                  borderColor: category === cat ? "#1f1b15" : "#E8DDD0",
                  backgroundColor: category === cat ? "#1f1b15" : "transparent",
                  color: category === cat ? "#F9F3EB" : "#1f1b15",
                  fontWeight: category === cat ? 600 : 400,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>

            {/* Sort — desktop */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
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

            {/* Filter trigger — shown on both mobile and desktop */}
            <FilterTriggerButton
              activeCount={activeFilterCount}
              onClick={openFilterPanel}
            />
          </div>
        </div>

        {/* ── Active filter chips (quick-clear) ── */}
        

        {/* ── Grid ── */}
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          style={{ paddingTop: "32px", paddingBottom: "60px" }}
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : products.length ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
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
                onClick={clearFilters}
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
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            paddingBottom: "80px",
          }}>
            <button
              onClick={() => updateParam("page", page - 1)}
              disabled={page === 1}
              style={{
                width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #E8DDD0",
                backgroundColor: "transparent",
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.4 : 1,
                transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f1b15" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => updateParam("page", pageNum)}
                style={{
                  width: "36px", height: "36px",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "13px",
                  fontWeight: page === pageNum ? 700 : 400,
                  border: "1px solid",
                  borderColor: page === pageNum ? "#1f1b15" : "#E8DDD0",
                  backgroundColor: page === pageNum ? "#1f1b15" : "transparent",
                  color: page === pageNum ? "#F9F3EB" : "#1f1b15",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => updateParam("page", page + 1)}
              disabled={page === totalPages}
              style={{
                width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #E8DDD0",
                backgroundColor: "transparent",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.4 : 1,
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

/* -------------------------------------------------------------------------- */
/* Active filter chip                                                          */
/* -------------------------------------------------------------------------- */

const ActiveChip = ({ label, onRemove }) => (
  <div style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px 4px 12px",
    border: "1px solid #E8DDD0",
    backgroundColor: "#fff",
    fontFamily: "'Jost', sans-serif",
    fontSize: "11px",
    color: "#1f1b15",
    letterSpacing: "0.04em",
  }}>
    {label}
    <button
      onClick={onRemove}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        lineHeight: 0,
        color: "#8C7B6B",
        display: "flex",
        alignItems: "center",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

export default AllProductsPage;