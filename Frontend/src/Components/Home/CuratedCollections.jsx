import { Link } from "react-router-dom";
import useInView from "../../utils/useInView.js";

const collections = [
  {
    title: "Everyday Minimal",
    path: "/categories/everyday-minimal",
    gradient: "linear-gradient(135deg, #2B2112 0%, #4A3728 50%, #6B5A47 100%)",
    accent: "#C47B1E",
  },
  {
    title: "Festive Edit",
    path: "/categories/festive-edit",
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #4a1520 50%, #7A3B5E 100%)",
    accent: "#C4727A",
  },
  {
    title: "Accessories",
    path: "/categories/accessories",
    gradient: "linear-gradient(135deg, #F5E6D0 0%, #C4A882 50%, #AB721E 100%)",
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
          <AnimatedCard key={index} col={col} index={index} />
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
        transform: inView ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <Link
        to={col.path}
        className="group relative block w-full overflow-hidden"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Gradient Background */}
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          style={{ background: col.gradient }}
        />

        {/* Texture Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Accent line top */}
        <div
          className="absolute left-4 top-4 h-[1px] w-6 transition-all duration-500 group-hover:w-12 sm:left-5 sm:top-5 sm:w-8"
          style={{ backgroundColor: col.accent }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
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
              style={{ fontFamily: "'Jost', sans-serif", color: col.accent }}
            >
              Shop Now
            </span>
          </div>
        </div>

        {/* Hover border */}
        <div className="absolute inset-0 border border-transparent transition-all duration-500 group-hover:border-white/20" />
      </Link>
    </div>
  );
};

export default CuratedCollections;