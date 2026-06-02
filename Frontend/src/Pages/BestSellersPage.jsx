import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../utils/axiosInstance.js";
import { PRODUCT } from "../Constants/apiRoutes.js";

import desktopBanner from "../assets/Naarisa - Bestseller Desktop.png";
import mobileBanner from "../assets/Naarisa - Bestseller Mobile.png";

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

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        backgroundColor: "#fff",
      }}
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
            }}
          >
            NAARISA
          </div>
        )}
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
              fontWeight: 600,
              fontSize: "14px",
              color: "#1f1b15",
            }}
          >
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
        </div>

        {product.color?.hex && (
          <div
            style={{
              display: "flex",
              gap: "5px",
              marginTop: "8px",
            }}
          >
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
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const BestSellersPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(PRODUCT.BEST_SELLERS);

        console.log("Best Sellers:", res.data);

        setProducts(res.data?.data?.products || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#F9F3EB",
        minHeight: "100vh",
      }}
    >
      {/* Banner */}

      <div>
        <img
          src={desktopBanner}
          alt="Bestsellers"
          className="hidden md:block w-full"
        />

        <img
          src={mobileBanner}
          alt="Bestsellers"
          className="block md:hidden w-full"
        />
      </div>

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

          <span style={{ margin: "0 8px" }}>
            /
          </span>

          <span
            style={{
              color: "#1f1b15",
            }}
          >
            Bestsellers
          </span>
        </p>

        {/* Heading */}

        <div
          style={{
            padding: "16px 0 32px",
          }}
        >
          <h1
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "clamp(24px,3vw,36px)",
              color: "#1f1b15",
              fontWeight: 400,
            }}
          >
            Bestsellers
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

        {/* Grid */}

        <div
          className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
          style={{
            paddingBottom: "80px",
          }}
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : products.length ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
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
                No bestsellers available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestSellersPage;