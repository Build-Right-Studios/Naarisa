import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterPanel, { FilterTriggerButton, FILTER_DEFAULTS, countActiveFilters } from "./FilterPanel";
import ProductCard from "../Components/Common/ProductCard.jsx";
import PageHero from "../Components/Common/PageHero.jsx";
import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";

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

/* -------------------------------------------------------------------------- */
/* Product Card                                                                */
/* -------------------------------------------------------------------------- */

// const ProductCard = ({ product }) => {
//     const navigate = useNavigate();
//     const [hovered, setHovered] = useState(false);

//     const image = product.images?.[0]?.url;
//     const name = product.productId?.name;
//     const price = product.discountPrice ?? product.productId?.basePrice;

//     return (
//         <div
//             onClick={() => navigate(`/product/${product.slug}`)}
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}
//             style={{ cursor: "pointer", backgroundColor: "#fff" }}
//         >
//             <div
//                 style={{
//                     position: "relative",
//                     aspectRatio: "3/4",
//                     overflow: "hidden",
//                     backgroundColor: "#F5E6D0",
//                 }}
//             >
//                 {/* "New" badge */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "10px",
//                         left: "10px",
//                         zIndex: 1,
//                         backgroundColor: "#1f1b15",
//                         color: "#F9F3EB",
//                         fontFamily: "'Jost', sans-serif",
//                         fontSize: "10px",
//                         letterSpacing: "0.12em",
//                         textTransform: "uppercase",
//                         padding: "3px 8px",
//                     }}
//                 >
//                     New
//                 </div>

//                 {image ? (
//                     <img
//                         src={image}
//                         alt={name}
//                         style={{
//                             width: "100%",
//                             height: "100%",
//                             objectFit: "cover",
//                             transition: "transform .5s ease",
//                             transform: hovered ? "scale(1.04)" : "scale(1)",
//                         }}
//                     />
//                 ) : (
//                     <div
//                         style={{
//                             width: "100%",
//                             height: "100%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             fontFamily: "'Jost', sans-serif",
//                             color: "#8C7B6B",
//                         }}
//                     >
//                         NAARISA
//                     </div>
//                 )}
//             </div>

//             <div style={{ padding: "12px 4px 16px" }}>
//                 <p
//                     style={{
//                         fontFamily: "'EB Garamond', serif",
//                         fontSize: "15px",
//                         color: "#1f1b15",
//                         lineHeight: 1.35,
//                         marginBottom: "6px",
//                         overflow: "hidden",
//                         display: "-webkit-box",
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical",
//                     }}
//                 >
//                     {name}
//                 </p>

//                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                     <span
//                         style={{
//                             fontFamily: "'Jost', sans-serif",
//                             fontWeight: 600,
//                             fontSize: "14px",
//                             color: "#1f1b15",
//                         }}
//                     >
//                         ₹{price?.toLocaleString("en-IN")}
//                     </span>
//                 </div>

//                 {product.color?.hex && (
//                     <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
//                         <div
//                             title={product.color.name}
//                             style={{
//                                 width: "14px",
//                                 height: "14px",
//                                 borderRadius: "50%",
//                                 backgroundColor: product.color.hex,
//                                 border: "1px solid #E8DDD0",
//                             }}
//                         />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

/* -------------------------------------------------------------------------- */
/* Fallback hero shown when no banner image is available                       */
/* -------------------------------------------------------------------------- */

// const TextHero = () => (
//     <div
//         style={{
//             backgroundColor: "#1f1b15",
//             padding: "60px 24px",
//             textAlign: "center",
//         }}
//     >
//         <p
//             style={{
//                 fontFamily: "'Jost', sans-serif",
//                 fontSize: "11px",
//                 letterSpacing: "0.22em",
//                 textTransform: "uppercase",
//                 color: "#AB721E",
//                 marginBottom: "12px",
//             }}
//         >
//             Just landed
//         </p>

//         <h1
//             style={{
//                 fontFamily: "'EB Garamond', serif",
//                 fontSize: "clamp(32px, 5vw, 56px)",
//                 color: "#F9F3EB",
//                 fontWeight: 400,
//                 lineHeight: 1.15,
//             }}
//         >
//             New Arrivals
//         </h1>

//         <p
//             style={{
//                 fontFamily: "'Jost', sans-serif",
//                 fontSize: "13px",
//                 color: "#8C7B6B",
//                 marginTop: "14px",
//                 letterSpacing: "0.06em",
//             }}
//         >
//             Fresh styles, first to you
//         </p>
//     </div>
// );

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS = [
    { label: "Newest First", value: "newest" },
    { label: "Price: Low–High", value: "price_asc" },
    { label: "Price: High–Low", value: "price_desc" },
    { label: "Name: A–Z", value: "name_asc" },
];

const NewArrivalsPage = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = new URLSearchParams();

                params.append("sort", sort);

                if (filters.colors?.length) {
                    params.append("colors", filters.colors.join(","));
                }

                if (filters.sizes?.length) {
                    params.append("sizes", filters.sizes.join(","));
                }

                if (filters.priceRange) {
                    params.append("priceRange", filters.priceRange);
                }

                const url = params.toString()
                    ? `${PRODUCT.NEW_ARRIVALS}?${params.toString()}`
                    : PRODUCT.NEW_ARRIVALS;

                const res = await api.get(url);
                setProducts(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch new arrivals:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, sort]);

    const hasBanner = Boolean(desktopBanner || mobileBanner);

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
                onChange={(key, val) =>
                    setFilters((prev) => ({
                        ...prev,
                        [key]: val,
                    }))
                }
                onApply={() => setFilterOpen(false)}
                onClear={() => setFilters(FILTER_DEFAULTS)}
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

                        {/* Filters */}
                        <FilterTriggerButton
                            activeCount={
                                filters.availability.length +
                                filters.priceRange.length +
                                (filters.discount ? 1 : 0) +
                                filters.colours.length
                            }
                            onClick={() => setFilterOpen(true)}
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
            </div>
        </div>
    );
};

export default NewArrivalsPage;