import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE, PRODUCT, USER } from "../Constants/apiRoutes.js";
import api from "../utils/axiosInstance.js";
import useInView from "../utils/useInView.js";
import useCartStore from "../Store/useCartStore.js";
import sizeChart from "../assets/Size Chart.jpeg";

// ── Accordion ─────────────────────────────────────────────────────────────────
const Accordion = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #E8DDD0" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left transition-all duration-200"
      >
        <span className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ fontFamily: "'Jost', sans-serif", color: "#1f1b15" }}>
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
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "500px" : "0px" }}>
        <>
          <style>{`
            .rich-accordion-content ul {
              list-style: disc;
              padding-left: 20px;
              margin: 4px 0;
            }
            .rich-accordion-content ol {
              list-style: decimal;
              padding-left: 20px;
              margin: 4px 0;
            }
            .rich-accordion-content li {
              margin-bottom: 4px;
              line-height: 1.6;
            }
            .rich-accordion-content b,
            .rich-accordion-content strong {
              font-weight: 700;
            }
            .rich-accordion-content i,
            .rich-accordion-content em {
              font-style: italic;
            }
            .rich-accordion-content u {
              text-decoration: underline;
            }
          `}</style>
          <div
            className="rich-accordion-content pb-5 text-[14px] font-light leading-relaxed"
            style={{ fontFamily: "'Jost', sans-serif", color: "#4A3728" }}
            dangerouslySetInnerHTML={{ __html: content || "" }}
          />
        </>
      </div>
    </div>
  );
};

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ rating = 4, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width={size} height={size} viewBox="0 0 24 24" fill={star <= rating ? "#C47B1E" : "none"} stroke="#C47B1E" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

// ── Interactive Star Picker ───────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: "none", border: "none", padding: "2px", cursor: "pointer" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill={star <= (hovered || value) ? "#C47B1E" : "none"}
            stroke="#C47B1E" strokeWidth="1.5"
            style={{ transition: "fill 0.15s ease" }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
};

// ── Mobile Image Slider ───────────────────────────────────────────────────────
const MobileImageSlider = ({ images, badge }) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const goPrev = () => setCurrent((p) => (p - 1 + images.length) % images.length);
  const goNext = () => setCurrent((p) => (p + 1) % images.length);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {images.map((img, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
          <img src={img.url} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}
      {badge && (
        <div className="absolute left-0 top-4 z-10 px-3 py-1.5" style={{ backgroundColor: "#2B2112", fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#F5E6D0" }}>
          NEW COLLECTION
        </div>
      )}
      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center transition-all" style={{ background: "rgba(43,33,18,0.4)", backdropFilter: "blur(4px)", color: "#fff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={goNext} className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center transition-all" style={{ background: "rgba(43,33,18,0.4)", backdropFilter: "blur(4px)", color: "#fff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? "20px" : "6px", height: "3px", backgroundColor: i === current ? "#AB721E" : "rgba(255,255,255,0.6)", border: "none", padding: 0, transition: "all 0.3s ease" }} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Add to Cart Toast ─────────────────────────────────────────────────────────
const AddedToast = ({ visible }) => (
  <div
    style={{
      position: "fixed",
      bottom: "90px",
      left: "50%",
      transform: `translateX(-50%) translateY(${visible ? "0" : "12px"})`,
      opacity: visible ? 1 : 0,
      transition: "all 0.3s ease",
      backgroundColor: "#2B2112",
      color: "#F5E6D0",
      fontFamily: "'Jost', sans-serif",
      fontSize: "12px",
      fontWeight: 600,
      letterSpacing: "0.1em",
      padding: "10px 20px",
      zIndex: 100,
      pointerEvents: "none",
      whiteSpace: "nowrap",
    }}
  >
    ✓ Added to cart
  </div>
);

// ── Write Review Modal ────────────────────────────────────────────────────────
const WriteReviewModal = ({ variantId, onClose, onSubmitted }) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !rating || !text.trim()) {
      setError("Please fill in all fields and select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post(`${BASE.ROUTE}/api/product/${variantId}/reviews`, {
        name: name.trim(),
        rating,
        text: text.trim(),
      });

      onSubmitted();
      onClose();
    } catch (err) {
      console.error("Review submit error:", err);
      setError(
        err?.response?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(43,33,18,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md"
        style={{ backgroundColor: "#F9F3EB", border: "1px solid #E8DDD0" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E8DDD0" }}>
          <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", color: "#1f1b15", fontWeight: 400 }}>
            Write a Review
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C7B6B" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-6">

          {/* Rating */}
          <div>
            <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
              Your Rating *
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Name */}
          <div>
            <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anjali K."
              maxLength={60}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "14px",
                color: "#1f1b15",
                backgroundColor: "#fff",
                border: "1px solid #E8DDD0",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Review Text */}
          <div>
            <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8C7B6B", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Your Review *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about the fit, quality, and your experience…"
              rows={4}
              maxLength={600}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "14px",
                color: "#1f1b15",
                backgroundColor: "#fff",
                border: "1px solid #E8DDD0",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "#C4A882", textAlign: "right", marginTop: "4px" }}>
              {text.length}/600
            </p>
          </div>

          {error && (
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4727A" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-all duration-200"
            style={{
              fontFamily: "'Jost', sans-serif",
              backgroundColor: submitting ? "#C4A882" : "#2B2112",
              color: "#F5E6D0",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Size Chart Modal ──────────────────────────────────────────────────────────
const SizeChartModal = ({ onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "rgba(43,33,18,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative">
        <button
          onClick={onClose}
          aria-label="Close size chart"
          style={{
            position: "absolute",
            top: "-14px",
            right: "-14px",
            zIndex: 10,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "#2B2112",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5E6D0" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <img
          src={sizeChart}
          alt="Size Chart"
          style={{
            display: "block",
            maxWidth: "90vw",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const addItem = useCartStore((state) => state.addItem);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [toastVisible, setToastVisible] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const reviewsRef = useInView(0.1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`${BASE.ROUTE}${PRODUCT.GET_BY_SLUG(slug)}`);
        if (res.data.success) {
          console.log(res.data)
          setData(res.data);
          const variant = res.data.currentVariant;
          const sizesData = variant?.sizes || variant?._doc?.sizes || [];
          const firstAvailable = sizesData.find((s) => s.quantity > 0);
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

  // Fetch reviews when variant is known
  useEffect(() => {
    if (!data?.currentVariant?._id) return;
    fetchReviews(data.currentVariant._id);
  }, [data?.currentVariant?._id]);

  const fetchReviews = async (variantId) => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`${BASE.ROUTE}/api/product/${variantId}/reviews`);
      if (res.data.success) {
        setReviews(res.data.data.reviews);
        setReviewStats({
          totalReviews: res.data.data.totalReviews,
          averageRating: res.data.data.averageRating,
        });
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => { setSelectedImage(0); }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (!data) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>Product not found.</p>
    </div>
  );

  const { product, currentVariant, allVariants } = data;
  const doc = currentVariant?._doc || currentVariant;
  const images = doc?.images || [];
  const sizes = doc?.sizes || [];
  const discountPrice = doc?.discountPrice;
  const discount = product.basePrice && discountPrice
    ? Math.round(((product.basePrice - discountPrice) / product.basePrice) * 100)
    : null;
  const totalStock = sizes.reduce((sum, s) => sum + s.quantity, 0);  // sizes already uses doc now ✓
  const lowStock = totalStock > 0 && totalStock <= 5;
  const productDisplayName = `${product.name}${doc?.color?.name
    ? ` - ${doc.color.name.charAt(0).toUpperCase() + doc.color.name.slice(1)}`
    : ""
    }`;
  const variantId = currentVariant?._id || currentVariant?._doc?._id;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }

    // Resolve from _doc if top-level is undefined (unserialized Mongoose doc)
    const doc = currentVariant?._doc || currentVariant;

    addItem({
      productId: product._id,
      variantId: doc._id,
      name: product.name,
      color: doc.color?.name || "",
      size: selectedSize,
      price: doc.discountPrice || product.basePrice,
      image: doc.images?.[0]?.url || null,
      slug: doc.slug,
    });

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("naarisa-token");
    if (!token) {
      alert("Please login to add items to your wishlist");
      navigate("/login");
      return;
    }
    try {
      setWishlistLoading(true);
      await api.post(`${BASE.ROUTE}${USER.WISHLIST}`, { variantId }, { withCredentials: true });
      alert("Added to wishlist");
    } catch (error) {
      console.error("Wishlist error:", error);
      alert(error?.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    handleAddToCart();
    navigate("/cart");
  };

  // Initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("");
  };

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }} className="pb-24 lg:pb-0">

      <AddedToast visible={toastVisible} />

      {showReviewModal && (
        <WriteReviewModal
          variantId={variantId}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={() => fetchReviews(variantId)}
        />
      )}

      {showSizeChart && (
        <SizeChartModal onClose={() => setShowSizeChart(false)} />
      )}

      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-[1200px] px-4 pt-5 sm:px-6 md:px-10 xl:px-12">
        <p className="text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>
          <span className="cursor-pointer hover:text-[#C47B1E] transition-colors" onClick={() => navigate("/")}>Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-[#C47B1E] transition-colors" onClick={() => navigate("/products")}>{product.category}</span>
          <span className="mx-2">/</span>
          <span style={{ color: "#1f1b15" }}>{product.name}</span>
        </p>
      </div>

      {/* ── Main Product Section ── */}
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-16">

          {/* ── LEFT — Images ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="lg:hidden">
              {images.length > 0 ? (
                <MobileImageSlider images={images} badge={currentVariant.isActive} />
              ) : (
                <div className="w-full" style={{ aspectRatio: "4/5", background: "linear-gradient(135deg, #F5E6D0, #C4A882)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: "#8C7B6B" }}>Naarisa</span>
                </div>
              )}
            </div>

            <div className="hidden lg:flex gap-3">
              {images.length > 1 && (
                <div className="flex flex-col gap-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)} className="overflow-hidden transition-all duration-200 flex-shrink-0"
                      style={{ width: "68px", aspectRatio: "3/4", border: selectedImage === i ? "2px solid #C47B1E" : "2px solid transparent" }}>
                      <img src={img.url} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex-1 overflow-hidden" style={{ aspectRatio: "3/4" }}>
                {images.length > 0 ? (
                  <img src={images[selectedImage]?.url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ background: "linear-gradient(135deg, #F5E6D0, #C4A882)" }}>
                    <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: "#8C7B6B" }}>Naarisa</span>
                  </div>
                )}
                {doc?.isActive && (
                  <div className="absolute left-0 top-4 px-3 py-1.5" style={{ backgroundColor: "#2B2112", fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#F5E6D0" }}>
                    NEW COLLECTION
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT — Details ── */}
          <div className="flex flex-col">
            <h1 className="mb-3 text-[24px] font-normal leading-tight sm:text-[28px] lg:text-[34px]" style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}>
              {productDisplayName}
            </h1>

            {/* Rating summary under title */}
            {reviewStats.totalReviews > 0 && (
              <div className="mb-3 flex items-center gap-2 cursor-pointer" onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}>
                <StarRating rating={Math.round(reviewStats.averageRating)} size={13} />
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#8C7B6B" }}>
                  {reviewStats.averageRating} ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            <div className="mb-4 flex items-center gap-3 flex-wrap">
              <span className="text-[22px] font-semibold sm:text-[24px]" style={{ fontFamily: "'Jost', sans-serif", color: "#1f1b15" }}>
                ₹{(discountPrice || product.basePrice)?.toLocaleString("en-IN")}
              </span>
              {discountPrice && discountPrice < product.basePrice && (
                <>
                  <span className="text-[15px] line-through" style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>
                    ₹{product.basePrice?.toLocaleString("en-IN")}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-bold" style={{ fontFamily: "'Jost', sans-serif", backgroundColor: "#2D6B5A", color: "#fff" }}>
                    SAVE {discount}%
                  </span>
                </>
              )}
            </div>

            {/* <div className="mb-4 flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#F5E6D0", border: "1px solid #E8DDD0" }}>
              <span className="text-[12px] font-normal" style={{ fontFamily: "'Jost', sans-serif", color: "#4A3728" }}>Flat discount on first order</span>
              <span className="px-3 py-1 text-[11px] font-bold" style={{ fontFamily: "'Jost', sans-serif", backgroundColor: "#2B2112", color: "#F5E6D0", letterSpacing: "0.08em" }}>EXTRA 10% OFF</span>
            </div> */}

            {lowStock && (
              <div className="mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4727A" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span className="text-[13px] font-semibold" style={{ fontFamily: "'Jost', sans-serif", color: "#C4727A" }}>Only {totalStock} left in stock!</span>
              </div>
            )}

            {allVariants.length > 1 && (
              <div className="mb-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>
                  Color: <span style={{ color: "#1f1b15", textTransform: "capitalize" }}>{currentVariant.color?.name}</span>
                </p>
                <div className="flex gap-2">
                  {allVariants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/product/${v.slug}`)}
                      title={v.color?.name || ""}
                      style={{
                        width: "28px", height: "28px",
                        borderRadius: "50%",
                        backgroundColor: v.color?.hex || "#ccc",
                        border: v.slug === slug ? "2px solid #C47B1E" : "2px solid #E8DDD0",
                        outline: v.slug === slug ? "2px solid #C47B1E" : "none",
                        outlineOffset: "2px",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>Select Size</p>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-[11px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-[#C47B1E]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const outOfStock = s.quantity === 0;
                  const isSelected = selectedSize === s.size;
                  return (
                    <button key={s.size} disabled={outOfStock} onClick={() => { setSelectedSize(s.size); setSizeError(false); }}
                      style={{
                        width: "48px", height: "48px",
                        fontFamily: "'Jost', sans-serif", fontSize: "13px",
                        fontWeight: isSelected ? 700 : 400,
                        backgroundColor: isSelected ? "#2B2112" : outOfStock ? "#F5E6D0" : "#fff",
                        color: isSelected ? "#fff" : outOfStock ? "#C4A882" : "#1f1b15",
                        border: sizeError && !selectedSize ? "1px solid #C4727A" : isSelected ? "1px solid #2B2112" : "1px solid #E8DDD0",
                        textDecoration: outOfStock ? "line-through" : "none",
                        cursor: outOfStock ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="mt-2 text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: "#C4727A" }}>Please select a size to continue</p>
              )}
            </div>

            <div className="mb-6 hidden flex-col gap-3 lg:flex">
              <button onClick={handleAddToCart} className="w-full py-4 text-[13px] font-bold uppercase tracking-[0.14em] transition-all duration-300"
                style={{ fontFamily: "'Jost', sans-serif", backgroundColor: "#AB721E", color: "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B6914")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#AB721E")}
              >
                Add to Cart
              </button>
              <button onClick={handleAddToWishlist} disabled={wishlistLoading} className="w-full py-4 text-[13px] font-bold uppercase tracking-[0.14em] transition-all duration-300"
                style={{ fontFamily: "'Jost', sans-serif", backgroundColor: "transparent", color: "#1f1b15", border: "1px solid #1f1b15", opacity: wishlistLoading ? 0.7 : 1 }}
              >
                {wishlistLoading ? "Adding..." : "Add To Wishlist"}
              </button>
            </div>

            <div>
              <Accordion title="Description" content={currentVariant?.description || product.description || ""} />
              <Accordion title="Fabric & Care" content={currentVariant?.fabricCare || ""} />
              <Accordion title="Returns & Exchanges" content={currentVariant?.returnExchange || ""} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Customer Reviews ── */}
      <div id="reviews-section" className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 md:px-10 xl:px-12" ref={reviewsRef.ref}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="mb-1 text-[22px] font-normal italic sm:text-[26px]" style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}>
              Customer Stories
            </h2>
            {reviewStats.totalReviews > 0 ? (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(reviewStats.averageRating)} />
                <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}>
                  {reviewStats.averageRating} out of 5 · {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            ) : (
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#8C7B6B" }}>
                No reviews yet. Be the first!
              </p>
            )}
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300"
            style={{ fontFamily: "'Jost', sans-serif", border: "1px solid #1f1b15", color: "#1f1b15" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1f1b15"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1f1b15"; }}
          >
            Write a Review
          </button>
        </div>

        {reviewsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 animate-pulse" style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0" }}>
                <div style={{ height: "14px", width: "80px", backgroundColor: "#E8DDD0", marginBottom: "16px" }} />
                <div style={{ height: "60px", backgroundColor: "#E8DDD0", marginBottom: "16px" }} />
                <div style={{ height: "12px", width: "100px", backgroundColor: "#E8DDD0" }} />
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review._id} className="p-5" style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0" }}>
                <StarRating rating={review.rating} size={13} />
                <p className="my-4 text-[14px] font-light italic leading-relaxed" style={{ fontFamily: "'EB Garamond', serif", color: "#4A3728" }}>
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: "#F5E6D0", color: "#AB721E" }}>
                    {getInitials(review.name)}
                  </div>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ fontFamily: "'Jost', sans-serif", color: "#1f1b15" }}>
                    {review.name || "Anonymous"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-left">
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "18px", color: "#8C7B6B" }}>
              No reviews yet for this variant.
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", color: "#C4A882", marginTop: "8px" }}>
              Share your experience and help others decide.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky Add to Cart — Mobile ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{ backgroundColor: "#F9F3EB", borderTop: "1px solid #E8DDD0", padding: "12px 16px", boxShadow: "0 -4px 20px rgba(43,33,18,0.08)" }}>
        <div className="flex gap-3">
          <button onClick={handleAddToCart} className="flex-1 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-all duration-200"
            style={{ fontFamily: "'Jost', sans-serif", backgroundColor: "#AB721E", color: "#fff" }}>
            Add to Cart
          </button>
          <button onClick={handleAddToWishlist} disabled={wishlistLoading} className="flex-1 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-all duration-200"
            style={{ fontFamily: "'Jost', sans-serif", backgroundColor: "#2B2112", color: "#F5E6D0", border: "none", opacity: wishlistLoading ? 0.7 : 1 }}>
            {wishlistLoading ? "Adding..." : "Wishlist"}
          </button>
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
        <div className="animate-pulse w-full" style={{ aspectRatio: "4/5", backgroundColor: "#E8DDD0" }} />
        <div className="flex flex-col gap-4 pt-4">
          <div className="h-8 w-3/4 animate-pulse rounded" style={{ backgroundColor: "#E8DDD0" }} />
          <div className="h-6 w-1/3 animate-pulse rounded" style={{ backgroundColor: "#E8DDD0" }} />
          <div className="h-12 w-full animate-pulse rounded" style={{ backgroundColor: "#E8DDD0" }} />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 w-12 animate-pulse" style={{ backgroundColor: "#E8DDD0" }} />)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductPage;