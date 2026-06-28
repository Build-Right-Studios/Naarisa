import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterPanel, { FilterTriggerButton, FILTER_DEFAULTS, countActiveFilters } from "./FilterPanel";
import PageHero from "../Components/Common/PageHero.jsx";
import ProductCard from "../Components/Common/ProductCard.jsx";
import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";

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
  { label: "Name: A–Z", value: "name_asc" },
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });

  // ── Filter state ──
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "All";
  const activeSort = searchParams.get("sort") || "newest";
  const activePage = parseInt(searchParams.get("page") || "1", 10);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  // ── Build query params including active filters ──
  const buildParams = useCallback((f = filters) => {
    const p = new URLSearchParams();
    if (activeCategory !== "All") p.set("category", activeCategory);
    p.set("sort", activeSort);
    p.set("page", activePage);
    p.set("limit", 12);

    if (f.availability.length) p.set("availability", f.availability.join(","));
    if (f.priceRange.length) p.set("priceRange", f.priceRange.join(","));
    if (f.discount) p.set("discount", f.discount);
    if (f.colours.length) p.set("colours", f.colours.join(","));

    return p;
  }, [activeCategory, activeSort, activePage, filters]);

  // ── Fetch ──
  const fetchProducts = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = buildParams(f);
      const res = await api.get(`${PRODUCT.GET_ALL}?${params.toString()}`);
      console.log(res.data)
      setProducts(res.data?.data?.products || []);
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 12 });
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Re-fetch when URL params change
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const activeFilterCount = countActiveFilters(filters);

  const handleFilterChange = (key, val) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const handleFilterApply = () => {
    setFilterOpen(false);
    updateParam("page", "1"); // reset to page 1 on new filter apply
    fetchProducts(filters);
  };

  const handleFilterClear = () => {
    const cleared = FILTER_DEFAULTS;
    setFilters(cleared);
    fetchProducts(cleared);
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
        onChange={handleFilterChange}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
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
          {/* <h1
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "clamp(24px,3vw,36px)",
              color: "#1f1b15",
              fontWeight: 400,
            }}
          >
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h1> */}
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

            {/* Filter trigger — shown on both mobile and desktop */}
            <FilterTriggerButton
              activeCount={activeFilterCount}
              onClick={() => setFilterOpen(true)}
            />

            {/* Mobile: category + sort inside filter panel, so just show the trigger */}
            {/* The old mobile-only FilterDrawer is removed — FilterPanel handles both */}

          </div>
        </div>

        {/* ── Active filter chips (quick-clear) ── */}
        {activeFilterCount > 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "16px 0 0",
            alignItems: "center",
          }}>
            <span style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "11px",
              color: "#8C7B6B",
              letterSpacing: "0.06em",
            }}>
              Active filters:
            </span>

            {filters.availability.map((v) => (
              <ActiveChip
                key={v} label={v}
                onRemove={() => handleFilterChange("availability", filters.availability.filter(x => x !== v))}
              />
            ))}
            {filters.priceRange.map((v) => (
              <ActiveChip
                key={v} label={v.replace("-", "–").replace(/(\d+)/g, (m) => `₹${Number(m).toLocaleString("en-IN")}`)}
                onRemove={() => handleFilterChange("priceRange", filters.priceRange.filter(x => x !== v))}
              />
            ))}
            {filters.discount && (
              <ActiveChip
                label={`${filters.discount}%+ off`}
                onRemove={() => handleFilterChange("discount", null)}
              />
            )}
            {filters.colours.map((v) => (
              <ActiveChip
                key={v} label={v}
                onRemove={() => handleFilterChange("colours", filters.colours.filter(x => x !== v))}
              />
            ))}
            {/* {filters.fabrics.map((v) => (
              <ActiveChip
                key={v} label={v}
                onRemove={() => handleFilterChange("fabrics", filters.fabrics.filter(x => x !== v))}
              />
            ))}
            {filters.occasions.map((v) => (
              <ActiveChip
                key={v} label={v}
                onRemove={() => handleFilterChange("occasions", filters.occasions.filter(x => x !== v))}
              />
            ))} */}

            <button
              onClick={handleFilterClear}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#AB721E",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                padding: "4px 0",
              }}
            >
              Clear all
            </button>
          </div>
        )}

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
                key={product.id}
                product={product}
                badge="New"
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
                onClick={handleFilterClear}
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
              onClick={() => updateParam("page", activePage - 1)}
              disabled={activePage === 1}
              style={{
                width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam("page", page)}
                style={{
                  width: "36px", height: "36px",
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

            <button
              onClick={() => updateParam("page", activePage + 1)}
              disabled={activePage === totalPages}
              style={{
                width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
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