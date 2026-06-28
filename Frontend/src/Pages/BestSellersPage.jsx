import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../Components/Common/PageHero.jsx";
import ProductCard from "../Components/Common/ProductCard.jsx";
import FilterPanel, { FilterTriggerButton, FILTER_DEFAULTS, countActiveFilters } from "./FilterPanel";
import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";

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
      <div className="animate-pulse" style={{ height: "16px", width: "80%", backgroundColor: "#E8DDD0" }} />
      <div className="animate-pulse" style={{ height: "14px", width: "40%", backgroundColor: "#E8DDD0" }} />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Active filter chip                                                          */
/* -------------------------------------------------------------------------- */

const ActiveChip = ({ label, onRemove }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 10px 4px 12px", border: "1px solid #E8DDD0",
    backgroundColor: "#fff", fontFamily: "'Jost', sans-serif",
    fontSize: "11px", color: "#1f1b15", letterSpacing: "0.04em",
  }}>
    {label}
    <button
      onClick={onRemove}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 0, lineHeight: 0, color: "#8C7B6B",
        display: "flex", alignItems: "center",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

const SORT_OPTIONS = [
  { label: "Newest First",    value: "newest"       },
  { label: "Price: Low–High", value: "price_asc"    },
  { label: "Price: High–Low", value: "price_desc"   },
  { label: "Name: A–Z",       value: "alphabetical" }, // was "name_asc" — now synced with backend
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const BestSellersPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Filter state ──
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  // ── Build filter query params ──
  const buildParams = useCallback((f = filters, sortBy = sort) => {
    const p = new URLSearchParams();

    p.set("sort", sortBy);

    if (f.availability && f.availability.length > 0) {
      p.set("availability", f.availability.join(","));
    }
    if (f.priceRange && f.priceRange.length > 0) {
      p.set("priceRange", f.priceRange.join(","));
    }
    if (f.discount) {
      p.set("discount", f.discount);
    }
    if (f.colours && f.colours.length > 0) {
      p.set("colours", f.colours.join(","));
    }

    return p;
  }, []);

  // ── Fetch products ──
  const fetchProducts = useCallback(
    async (filtersToUse = filters, sortToUse = sort) => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams(filtersToUse, sortToUse);
        const query = params.toString();
        const url = query 
          ? `${PRODUCT.BEST_SELLERS}?${query}` 
          : PRODUCT.BEST_SELLERS;

        const res = await api.get(url);

        console.log(res.data)

        // ✅ CORRECT: res.data.data IS the array (not nested under .products)
        const productsArray = Array.isArray(res.data?.data) ? res.data.data : [];
        setProducts(productsArray);

        // Store total count only when no filters are active
        if (countActiveFilters(filtersToUse) === 0) {
          setTotalCount(productsArray.length);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [buildParams]
  );

  // ── Initial fetch and fetch on sort change ──
  useEffect(() => {
    fetchProducts(filters, sort);
  }, [sort, fetchProducts]);

  const activeFilterCount = countActiveFilters(filters);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleFilterApply = () => {
    setFilterOpen(false);
    fetchProducts(filters, sort);
  };

  const handleFilterClear = () => {
    setFilters(FILTER_DEFAULTS);
    fetchProducts(FILTER_DEFAULTS, sort);
  };

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      <PageHero
        eyebrow="Most Loved"
        title="Bestsellers"
        subtitle="Customer favourites you'll keep reaching for"
      />

      {/* ── Filter Panel ── */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        resultCount={products.length}
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 xl:px-12">

        {/* Breadcrumb */}
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.14em",
          color: "#8C7B6B",
          textTransform: "uppercase",
          padding: "24px 0 0",
        }}>
          <span 
            onClick={() => navigate("/")} 
            className="cursor-pointer hover:text-[#AB721E]"
          >
            Home
          </span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#1f1b15" }}>Bestsellers</span>
        </p>

        {/* ── Toolbar: Count + Sort + Filter ── */}
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
          {!loading && (
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "12px",
                color: "#8C7B6B",
                letterSpacing: "0.08em",
              }}
            >
              {activeFilterCount > 0
                ? `${products.length} of ${totalCount} styles`
                : `${products.length} styles`}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "auto",
            }}
          >
            {/* Sort Dropdown */}
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
                onChange={(e) => setSort(e.target.value)}
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

            {/* Filter Button */}
            <FilterTriggerButton
              activeCount={activeFilterCount}
              onClick={() => setFilterOpen(true)}
            />
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        {activeFilterCount > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "16px 0 0",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11px",
                color: "#8C7B6B",
                letterSpacing: "0.06em",
              }}
            >
              Active filters:
            </span>

            {/* Availability Filters */}
            {filters.availability &&
              filters.availability.map((v) => (
                <ActiveChip
                  key={v}
                  label={v}
                  onRemove={() =>
                    handleFilterChange(
                      "availability",
                      filters.availability.filter((x) => x !== v)
                    )
                  }
                />
              ))}

            {/* Price Range Filters */}
            {filters.priceRange &&
              filters.priceRange.map((v) => (
                <ActiveChip
                  key={v}
                  label={v.replace(/(\d+)-(\d+)/, (_, a, b) =>
                    `₹${Number(a).toLocaleString("en-IN")}–₹${Number(b).toLocaleString("en-IN")}`
                  )}
                  onRemove={() =>
                    handleFilterChange(
                      "priceRange",
                      filters.priceRange.filter((x) => x !== v)
                    )
                  }
                />
              ))}

            {/* Discount Filter */}
            {filters.discount && (
              <ActiveChip
                label={`${filters.discount}%+ off`}
                onRemove={() => handleFilterChange("discount", null)}
              />
            )}

            {/* Colour Filters */}
            {filters.colours &&
              filters.colours.map((v) => (
                <ActiveChip
                  key={v}
                  label={v}
                  onRemove={() =>
                    handleFilterChange(
                      "colours",
                      filters.colours.filter((x) => x !== v)
                    )
                  }
                />
              ))}

            {/* Clear All Button */}
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

        {/* ── Error Message ── */}
        {error && (
          <div
            style={{
              padding: "16px",
              marginTop: "16px",
              backgroundColor: "#FFE5E5",
              border: "1px solid #FF9999",
              borderRadius: "4px",
              color: "#CC0000",
              fontSize: "13px",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {/* ── Product Grid ── */}
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          style={{ paddingTop: "32px", paddingBottom: "80px" }}
        >
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : products.length > 0 ? (
            // Product Cards
            products.map((product, index) => (
              <ProductCard
                key={product.id || product._id || index}
                product={product}
                badge="Bestseller"
              />
            ))
          ) : (
            // No Results Message
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 0" }}>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: "24px",
                  color: "#8C7B6B",
                }}
              >
                No bestsellers found
              </p>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "12px",
                  color: "#C4A882",
                  marginTop: "8px",
                }}
              >
                Try adjusting or clearing your filters
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
      </div>
    </div>
  );
};

export default BestSellersPage;