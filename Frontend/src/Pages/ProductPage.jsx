import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE, PRODUCT } from "../Constants/apiroutes.js";
import useInView from "../utils/useInView.js";

// ── Accordion ─────────────────────────────────────────────────────────────────
const Accordion = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #E8DDD0" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left transition-all duration-200"
      >
        <span
          className="text-[12px] font-bold uppercase tracking-[0.16em]"
          style={{ fontFamily: "'Jost', sans-serif", color: "#1f1b15" }}
        >
          {title}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="#8C7B6B" strokeWidth="1.5"
          className="flex-shrink-0 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-400"
        style={{ maxHeight: open ? "500px" : "0px" }}
      >
        <p
          className="pb-5 text-[14px] font-light leading-relaxed"
          style={{ fontFamily: "'Jost', sans-serif", color: "#4A3728" }}
        >
          {content}
        </p>
      </div>
    </div>
  );
};

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ rating = 4, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        width={size} height={size}
        viewBox="0 0 24 24"
        fill={star <= rating ? "#C47B1E" : "none"}
        stroke="#C47B1E"
        strokeWidth="1.5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

// ── Mock reviews (replace with API later) ────────────────────────────────────
const mockReviews = [
  {
    id: 1, name: "Anjali K.", initials: "AK", rating: 5,
    text: "The texture of the silk-cotton blend is exquisite. It feels like wearing art. It's breathable yet looks extremely premium.",
  },
  {
    id: 2, name: "Riya M.", initials: "RM", rating: 4,
    text: "True to size and the color is even more vibrant in person. I love that Naarisa supports local weavers. Worth every penny.",
  },
  {
    id: 3, name: "Sana P.", initials: "SP", rating: 5,
    text: "Fast shipping and lovely packaging. The tunic has a wonderful weight to it. A perfect blend of tradition and modernity.",
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
const ProductPage = () => {
  const { slug }    = useParams();
  const navigate    = useNavigate();

  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [sizeError, setSizeError]         = useState(false);

  const reviewsRef = useInView(0.1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE.ROUTE}${PRODUCT.GET_BY_SLUG(slug)}`);
        if (res.data.success) {
          setData(res.data);
          // Auto select first available size
          const firstAvailable = res.data.currentVariant?.sizes?.find(s => s.quantity > 0);
          if (firstAvailable) setSelectedSize(firstAvailable.size);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (!data) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>
        Product not found.
      </p>
    </div>
  );

  const { product, currentVariant, allVariants } = data;
  const images   = currentVariant?.images || [];
  const sizes    = currentVariant?.sizes  || [];
  const discount = product.basePrice && currentVariant.discountPrice
    ? Math.round(((product.basePrice - currentVariant.discountPrice) / product.basePrice) * 100)
    : null;

  const totalStock = sizes.reduce((sum, s) => sum + s.quantity, 0);
  const lowStock   = totalStock > 0 && totalStock <= 5;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    // TODO: connect cart
    alert(`Added ${product.name} (${selectedSize}) to cart!`);
  };

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      {/* ── Breadcrumb ── */}
      <div
        className="mx-auto max-w-[1200px] px-4 pt-5 sm:px-6 md:px-10 xl:px-12"
      >
        <p
          className="text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
        >
          <span
            className="cursor-pointer hover:text-[#C47B1E] transition-colors"
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <span className="mx-2">/</span>
          <span
            className="cursor-pointer hover:text-[#C47B1E] transition-colors"
            onClick={() => navigate("/products")}
          >
            {product.category}
          </span>
          <span className="mx-2">/</span>
          <span style={{ color: "#1f1b15" }}>{product.name}</span>
        </p>
      </div>

      {/* ── Main Product Section ── */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">

          {/* ── LEFT — Images ── */}
          <div className="flex gap-3">

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="hidden flex-col gap-2 sm:flex">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="overflow-hidden transition-all duration-200"
                    style={{
                      width: "68px",
                      aspectRatio: "3/4",
                      border: selectedImage === i
                        ? "2px solid #C47B1E"
                        : "2px solid transparent",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`View ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 overflow-hidden" style={{ aspectRatio: "3/4" }}>
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #F5E6D0, #C4A882)" }}
                >
                  <span
                    className="text-[13px] font-bold uppercase tracking-widest"
                    style={{ color: "#8C7B6B" }}
                  >
                    Naarisa
                  </span>
                </div>
              )}

              {/* New Collection badge */}
              {currentVariant.isActive && (
                <div
                  className="absolute left-0 top-4 px-3 py-1.5"
                  style={{
                    backgroundColor: "#2B2112",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "#F5E6D0",
                  }}
                >
                  NEW COLLECTION
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT — Details ── */}
          <div className="flex flex-col">

            {/* Product Name */}
            <h1
              className="mb-3 text-[28px] font-normal leading-tight sm:text-[32px] lg:text-[36px]"
              style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}
            >
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mb-4 flex items-center gap-3 flex-wrap">
              <span
                className="text-[24px] font-semibold sm:text-[26px]"
                style={{ fontFamily: "'Jost', sans-serif", color: "#1f1b15" }}
              >
                ₹{currentVariant.discountPrice?.toLocaleString("en-IN") || product.basePrice?.toLocaleString("en-IN")}
              </span>

              {currentVariant.discountPrice && currentVariant.discountPrice < product.basePrice && (
                <>
                  <span
                    className="text-[16px] line-through"
                    style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
                  >
                    ₹{product.basePrice?.toLocaleString("en-IN")}
                  </span>
                  <span
                    className="px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      backgroundColor: "#2D6B5A",
                      color: "#fff",
                    }}
                  >
                    SAVE {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Offer strip */}
            <div
              className="mb-4 flex items-center justify-between px-4 py-3"
              style={{
                backgroundColor: "#F5E6D0",
                border: "1px solid #E8DDD0",
              }}
            >
              <span
                className="text-[12px] font-normal"
                style={{ fontFamily: "'Jost', sans-serif", color: "#4A3728" }}
              >
                Flat discount on first order
              </span>
              <span
                className="px-3 py-1 text-[11px] font-bold"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  backgroundColor: "#2B2112",
                  color: "#F5E6D0",
                  letterSpacing: "0.08em",
                }}
              >
                EXTRA 10% OFF
              </span>
            </div>

            {/* Low stock warning */}
            {lowStock && (
              <div className="mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4727A" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span
                  className="text-[13px] font-semibold"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#C4727A" }}
                >
                  Only {totalStock} left in stock!
                </span>
              </div>
            )}

            {/* Color Variants */}
            {allVariants.length > 1 && (
              <div className="mb-5">
                <p
                  className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
                >
                  Color: <span style={{ color: "#1f1b15", textTransform: "capitalize" }}>
                    {currentVariant.color.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  {allVariants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/product/${v.slug}`)}
                      title={v.color.name}
                      className="transition-all duration-200"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: v.color.hex,
                        border: v.slug === slug
                          ? "2px solid #C47B1E"
                          : "2px solid #E8DDD0",
                        outline: v.slug === slug ? "2px solid #C47B1E" : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
                >
                  Select Size
                </p>
                <button
                  className="text-[11px] font-bold uppercase tracking-[0.14em] underline transition-colors hover:text-[#C47B1E]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
                >
                  Size Chart
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const outOfStock = s.quantity === 0;
                  const isSelected = selectedSize === s.size;
                  return (
                    <button
                      key={s.size}
                      disabled={outOfStock}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setSizeError(false);
                      }}
                      className="transition-all duration-200"
                      style={{
                        width: "48px",
                        height: "48px",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "13px",
                        fontWeight: isSelected ? 700 : 400,
                        backgroundColor: isSelected ? "#2B2112" : outOfStock ? "#F5E6D0" : "#fff",
                        color: isSelected ? "#fff" : outOfStock ? "#C4A882" : "#1f1b15",
                        border: sizeError && !selectedSize
                          ? "1px solid #C4727A"
                          : isSelected
                          ? "1px solid #2B2112"
                          : "1px solid #E8DDD0",
                        textDecoration: outOfStock ? "line-through" : "none",
                        cursor: outOfStock ? "not-allowed" : "pointer",
                      }}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>

              {sizeError && (
                <p
                  className="mt-2 text-[12px]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#C4727A" }}
                >
                  Please select a size to continue
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="mb-6 flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 text-[13px] font-bold uppercase tracking-[0.14em] transition-all duration-300"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  backgroundColor: "#AB721E",
                  color: "#fff",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#8B6914"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#AB721E"}
              >
                Add to Cart
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 text-[13px] font-bold uppercase tracking-[0.14em] transition-all duration-300"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  backgroundColor: "transparent",
                  color: "#1f1b15",
                  border: "1px solid #1f1b15",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1f1b15";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#1f1b15";
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Accordions */}
            <div>
              <Accordion title="Description" content={product.description} />
              <Accordion title="Fabric & Care" content={product.fabricCare} />
              <Accordion title="Styling Tips" content={product.stylingTips} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Customer Reviews ── */}
      <div
        className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 md:px-10 xl:px-12"
        ref={reviewsRef.ref}
      >
        {/* Reviews Header */}
        <div
          className="mb-8 flex items-start justify-between transition-all duration-700"
          style={{
            opacity: reviewsRef.inView ? 1 : 0,
            transform: reviewsRef.inView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div>
            <h2
              className="mb-1 text-[22px] font-normal italic sm:text-[26px]"
              style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}
            >
              Customer Stories
            </h2>
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span
                className="text-[13px]"
                style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
              >
                Based on 48 reviews
              </span>
            </div>
          </div>

          <button
            className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300"
            style={{
              fontFamily: "'Jost', sans-serif",
              border: "1px solid #1f1b15",
              color: "#1f1b15",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1f1b15";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#1f1b15";
            }}
          >
            Write a Review
          </button>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockReviews.map((review, index) => (
            <div
              key={review.id}
              className="p-5 transition-all duration-700"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E8DDD0",
                opacity: reviewsRef.inView ? 1 : 0,
                transform: reviewsRef.inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <StarRating rating={review.rating} size={13} />
              <p
                className="my-4 text-[14px] font-light italic leading-relaxed"
                style={{ fontFamily: "'EB Garamond', serif", color: "#4A3728" }}
              >
                "{review.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: "#F5E6D0", color: "#AB721E" }}
                >
                  {review.initials}
                </div>
                <span
                  className="text-[12px] font-semibold uppercase tracking-[0.1em]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#1f1b15" }}
                >
                  {review.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-10 xl:px-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div
          className="animate-pulse"
          style={{ aspectRatio: "3/4", backgroundColor: "#E8DDD0" }}
        />
        <div className="flex flex-col gap-4 pt-4">
          <div className="h-8 w-3/4 animate-pulse rounded" style={{ backgroundColor: "#E8DDD0" }} />
          <div className="h-6 w-1/3 animate-pulse rounded" style={{ backgroundColor: "#E8DDD0" }} />
          <div className="h-12 w-full animate-pulse rounded" style={{ backgroundColor: "#E8DDD0" }} />
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 w-12 animate-pulse" style={{ backgroundColor: "#E8DDD0" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductPage;