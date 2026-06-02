import { Link } from "react-router-dom";
import shortkurtibanner from "../../assets/Short Kurtis Banner.png";
import longkurtibanner from "../../assets/Long Kurtis Banner.png";
import dressesbanner from "../../assets/Dresses Banner.png";
import useInView from "../../utils/useInView.js";

const collections = [
  {
    title: "Short Kurtis",
    path: "/categories/short-kurtis",
    image: shortkurtibanner,
    accent: "#C47B1E",
  },
  {
    title: "Long Kurtis",
    path: "/categories/long-kurtis",
    image: longkurtibanner,
    accent: "#C4727A",
  },
  {
    title: "Dresses",
    path: "/categories/dresses",
    image: dressesbanner,
    accent: "#2B2112",
  },
  {
    title: "Workweave Luxe",
    path: "/workweave",
    gradient: "linear-gradient(135deg, #0d1f1a 0%, #1a3d32 50%, #2D6B5A 100%)",
    accent: "#F5E6D0",
  },

];

const CuratedCollections = () => {
  const header = useInView();

  return (
    <section
      className="w-full overflow-hidden px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20 xl:px-12"
      style={{ backgroundColor: "#F9F3EB" }}
    >
      {/* Section Header */}
      <div
        ref={header.ref}
        className="mb-8 text-center transition-all duration-700 sm:mb-10"
        style={{
          opacity: header.inView ? 1 : 0,
          transform: header.inView ? "translateY(0)" : "translateY(24px)",
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

  const delays = [0, 150, 300, 450];
  const delay = delays[index] || 0;

  return (
    <div
      ref={ref}
      className="w-full transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? "translateY(0) scale(1)"
          : "translateY(32px) scale(0.97)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <Link
        to={col.path}
        className="group relative block w-full overflow-hidden"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Background Image / Gradient */}
        {col.image ? (
          <img
            src={col.image}
            alt={col.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{ background: col.gradient }}
          />
        )}

        {/* Dark Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" /> */}

        {/* Accent Line */}
        {/* <div
          className="absolute left-4 top-4 h-[1px] w-6 transition-all duration-500 group-hover:w-12 sm:left-5 sm:top-5 sm:w-8"
          style={{ backgroundColor: col.accent }}
        /> */}

        {/* Content */}
        {/* <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <h3
            className="mb-2 text-[22px] font-normal italic leading-tight text-white sm:mb-3 sm:text-[26px] md:text-[28px]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {col.title}
          </h3>

          <div className="flex items-center gap-2">
            <span
              className="h-[1px] w-4 transition-all duration-500 group-hover:w-6 sm:w-5"
              style={{ backgroundColor: col.accent }}
            />

            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: col.accent,
              }}
            >
              Shop Now
            </span>
          </div>
        </div> */}

        {/* Hover Border */}
        <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:border-white/20" />
      </Link>
    </div>
  );
};

export default CuratedCollections;