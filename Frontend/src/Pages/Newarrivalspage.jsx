import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterPanel, { FilterTriggerButton, FILTER_DEFAULTS, countActiveFilters } from "./FilterPanel";
import ProductCard from "../Components/Common/ProductCard.jsx";
import PageHero from "../Components/Common/PageHero.jsx";
import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";
import { useProductQueryState } from "../Components/Common/useProductQueryState";

// Import banners only if they exist — swap these paths when you add real assets.
// If you don't have banners yet, simply set these to null or remove the imports.
// import desktopBanner from "../assets/Naarisa - NewArrivals Desktop.png";
// import mobileBanner from "../assets/Naarisa - NewArrivals Mobile.png";
const desktopBanner = null; // Replace with the import above once the asset exists
const mobileBanner = null;  // Replace with the import above once the asset exists

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

const SkeletonCard = () => (
    <div>
        <div
            className="animate-pulse"
            style={{
                aspectRatio: "3/4",
                backgroundColor: "#E8DDD0",
            }}
        />
        <div
            style={{
                padding: "12px 4px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}
        >
            <div
                className="animate-pulse"
                style={{
                    height: "16px",
                    width: "80%",
                    backgroundColor: "#E8DDD0",
                }}
            />
            <div
                className="animate-pulse"
                style={{
                    height: "14px",
                    width: "40%",
                    backgroundColor: "#E8DDD0",
                }}
            />
        </div>
    </div>
);

const SORT_OPTIONS = [
    { label: "Newest First", value: "newest" },
    { label: "Price: Low–High", value: "price_asc" },
    { label: "Price: High–Low", value: "price_desc" },
    { label: "Name: A–Z", value: "alphabetical" },
];

const NewArrivalsPage = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterOpen, setFilterOpen] = useState(false);

    const {
        sort,
        page,
        filters,
        appliedFilters,
        setFilterKey,
        resetDraftToApplied,
        applyFilters,
        clearFilters,
        updateParam,
        buildApiParams,
    } = useProductQueryState({
        defaultSort: "newest",
        limit: 12,
    });

    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            try {
                const params = buildApiParams();

                const res = await api.get(
                    `${PRODUCT.NEW_ARRIVALS}?${params.toString()}`
                );
                setProducts(res.data.data || []);
                setPagination(res.data.pagination || { total: 0, page: 1, limit: 12 });
            }
            catch (err) {
                console.error(err);
                setProducts([]);
            }
            finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [buildApiParams]);

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const hasBanner = Boolean(desktopBanner || mobileBanner);

    console.log({ pagination, totalPages, page });

    return (
        <div
            style={{
                backgroundColor: "#F9F3EB",
                minHeight: "100vh",
            }}
        >
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
            {/* ------------------------------------------------------------------ */}
            {/* Banner — only rendered when image assets are present                */}
            {/* ------------------------------------------------------------------ */}

            {hasBanner ? (
                <div>
                    {desktopBanner && (
                        <img
                            src={desktopBanner}
                            alt="New Arrivals"
                            className="hidden md:block w-full"
                        />
                    )}

                    {mobileBanner && (
                        <img
                            src={mobileBanner}
                            alt="New Arrivals"
                            className="block md:hidden w-full"
                        />
                    )}
                </div>
            ) : (
                <PageHero
                    eyebrow="Just Landed"
                    title="New Arrivals"
                    subtitle="Fresh styles, first to you"
                />
            )}

            {/* ------------------------------------------------------------------ */}
            {/* Content                                                             */}
            {/* ------------------------------------------------------------------ */}

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
                    <span
                        onClick={() => navigate("/")}
                        className="cursor-pointer hover:text-[#AB721E]"
                    >
                        Home
                    </span>

                    <span style={{ margin: "0 8px" }}>/</span>

                    <span style={{ color: "#1f1b15" }}>New Arrivals</span>
                </p>

                {/* Heading — only shown when there is no banner (banner already has title) */}

                {hasBanner && (
                    <div style={{ padding: "16px 0 32px" }}>
                        <h1
                            style={{
                                fontFamily: "'EB Garamond', serif",
                                fontSize: "clamp(24px,3vw,36px)",
                                color: "#1f1b15",
                                fontWeight: 400,
                            }}
                        >
                            New Arrivals
                        </h1>

                        {!loading && (
                            <p
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "12px",
                                    color: "#8C7B6B",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {products.length} styles
                            </p>
                        )}
                    </div>
                )}

                {/* Count shown below breadcrumb when TextHero is active */}

                {/* {!hasBanner && !loading && (
                    <p
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "12px",
                            color: "#8C7B6B",
                            letterSpacing: "0.08em",
                            paddingTop: "10px",
                        }}
                    >
                        {products.length} styles
                    </p>
                )} */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 0 24px",
                        borderBottom: "1px solid #E8DDD0",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "12px",
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
                            {products.length} styles
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

                        {/* Filters */}
                        <FilterTriggerButton
                            activeCount={countActiveFilters(appliedFilters)}
                            onClick={() => {
                                resetDraftToApplied();
                                setFilterOpen(true);
                            }}
                        />
                    </div>
                </div>

                {/* Grid */}

                <div
                    className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
                    style={{
                        paddingTop: hasBanner ? "0" : "24px",
                        paddingBottom: "80px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : products.length ? (
                        products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                badge="New"
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "80px 0",
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: "'EB Garamond', serif",
                                    fontSize: "24px",
                                    color: "#8C7B6B",
                                }}
                            >
                                No new arrivals at the moment
                            </p>
                        </div>
                    )}
                </div>

                {!loading && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", paddingBottom: "60px" }}>
            <button
              onClick={() => updateParam("page", page - 1)}
              disabled={page === 1}
              style={{
                width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #E8DDD0", backgroundColor: "transparent",
                cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, transition: "all 0.2s",
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
                  width: "36px", height: "36px", fontFamily: "'Jost', sans-serif", fontSize: "13px",
                  fontWeight: page === pageNum ? 700 : 400,
                  border: "1px solid", borderColor: page === pageNum ? "#1f1b15" : "#E8DDD0",
                  backgroundColor: page === pageNum ? "#1f1b15" : "transparent",
                  color: page === pageNum ? "#F9F3EB" : "#1f1b15",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => updateParam("page", page + 1)}
              disabled={page === totalPages}
              style={{
                width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #E8DDD0", backgroundColor: "transparent",
                cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, transition: "all 0.2s",
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

export default NewArrivalsPage;