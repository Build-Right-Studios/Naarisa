import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useInView from "../../utils/useInView.js";

const collections = [
  {
    title: "Short Kurtis",
    path: "/categories/short-kurtis",
    image: "https://ik.imagekit.io/llcblwlng/naarisa/homepage-banners/Short%20Kurtis%20Banner.png",
    accent: "#C47B1E",
  },
  {
    title: "Long Kurtis",
    path: "/categories/long-kurtis",
    image: "https://ik.imagekit.io/llcblwlng/naarisa/homepage-banners/Long%20Kurtis%20Banner.png",
    accent: "#C4727A",
  },
  {
    title: "Dresses",
    path: "/categories/dresses",
    image: "https://ik.imagekit.io/llcblwlng/naarisa/homepage-banners/Dresses%20Banner.png",
    accent: "#2B2112",
  },
  {
    title: "Kurti Sets",
    path: "/categories/kurti-sets",
    // gradient: "linear-gradient(135deg, #0d1f1a 0%, #1a3d32 50%, #2D6B5A 100%)",
    image: "https://ik.imagekit.io/llcblwlng/naarisa/homepage-banners/Kurti%20Set%20Banner.png",
    accent: "#F5E6D0",
  },

];

const CuratedCollections = () => {
  const header = useInView();
  const [headerAnimated, setHeaderAnimated] = useState(false);

  useEffect(() => {
    if (header.inView) setHeaderAnimated(true);
  }, [header.inView]);

  return (
    <section
      className="w-full overflow-hidden px-4 py-8 sm:px-6 sm:py-8 md:px-10 md:py-10 xl:px-12"
      style={{ backgroundColor: "#F9F3EB" }}
    >
      {/* Section Header */}
      <div
        ref={header.ref}
        className="mb-8 text-center transition-all duration-500 sm:mb-10"
        style={{
          opacity: headerAnimated ? 1 : 0,
          transform: headerAnimated ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ fontFamily: "'Jost', sans-serif", color: "#C47B1E" }}
        >
          Explore
        </p>

        <h2
          className="text-[28px] font-normal italic sm:text-[36px] md:text-[40px]"
          style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}
        >
          Curated Collections
        </h2>
      </div>

      {/* 2x2 Grid */}
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {collections.map((col, index) => (
          <AnimatedCard
            key={col.title}
            col={col}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

const AnimatedCard = ({ col, index }) => {
  const { ref, inView } = useInView();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView && !animated) {
      const raf = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [inView, animated]);

  const delays = [0, 80, 80, 160];

  return (
    <div
      ref={ref}
      className="w-full transition-all duration-300"
      style={{
        opacity: animated ? 1 : 0,
        transform: animated ? "translateY(0) scale(1)" : "translateY(12px) scale(0.99)",
        transitionDelay: `${delays[index] || 0}ms`,
      }}
    >
      <Link
        to={col.path}
        className="group relative block w-full overflow-hidden"
        style={{ aspectRatio: "4/3" }}
      >
        <img
          src={col.image}
          alt={col.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-400 group-hover:scale-105"
        />
        <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:border-white/20" />
      </Link>
    </div>
  );
};

export default CuratedCollections;