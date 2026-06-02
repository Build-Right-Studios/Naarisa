import { useNavigate } from "react-router-dom";
import useInView from "../utils/useInView.js";

// ── Core Values Data ──────────────────────────────────────────────────────────
const coreValues = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AB721E" strokeWidth="1.5">
        <path d="M12 2a9 9 0 0 1 9 9c0 4.97-9 13-9 13S3 15.97 3 11a9 9 0 0 1 9-9z"/>
        <circle cx="12" cy="11" r="3"/>
      </svg>
    ),
    title: "Sustainability",
    description: "We source organic fibers and use small-batch production to minimize our footprint and honor the earth.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AB721E" strokeWidth="1.5">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    ),
    title: "Craftsmanship",
    description: "Every stitch is a tribute to the master weavers who have preserved their art for generations.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AB721E" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    title: "Modern Design",
    description: "We strip away the excess to let the silhouette and the story of the fabric take center stage.",
  },
];

// ── Grid image placeholders ───────────────────────────────────────────────────
const gridImages = [
  { gradient: "linear-gradient(135deg, #2B2112 0%, #4A3728 60%, #8B6914 100%)", label: "Craft" },
  { gradient: "linear-gradient(160deg, #C4A882 0%, #AB721E 50%, #8B6914 100%)", label: "Collection" },
  { gradient: "linear-gradient(135deg, #3A2010 0%, #6B4A2A 50%, #C4A882 100%)", label: "Atelier" },
  { gradient: "linear-gradient(160deg, #1a0a0a 0%, #4A3728 50%, #C47B1E 100%)", label: "Heritage" },
];

// ── About Page ────────────────────────────────────────────────────────────────
const AboutPage = () => {
  const navigate  = useNavigate();
  const story     = useInView(0.1);
  const values    = useInView(0.1);
  const grid      = useInView(0.1);

  return (
    <div style={{ backgroundColor: "#F9F3EB", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(480px, 70vh, 700px)" }}
      >
        {/* Gradient placeholder — replace with real image */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #1a0f05 0%, #2B2112 30%, #4A3728 60%, #8B6914 85%, #C47B1E 100%)",
          }}
        />

        {/* Woven texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg, transparent, transparent 3px,
              rgba(255,255,255,0.06) 3px, rgba(255,255,255,0.06) 4px
            ), repeating-linear-gradient(
              90deg, transparent, transparent 6px,
              rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 7px
            )`,
          }}
        />

        {/* Light vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(196,123,30,0.25) 0%, transparent 65%)" }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "160px", background: "linear-gradient(to bottom, transparent, #F9F3EB)", zIndex: 2 }}
        />

        {/* Hero Text */}
        <div
          className="absolute inset-0 flex items-center justify-center text-center px-6"
          style={{ zIndex: 3 }}
        >
          <div>
            <p
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em]"
              style={{ fontFamily: "'Jost', sans-serif", color: "rgba(245,230,208,0.6)" }}
            >
              Our Story
            </p>
            <h1
              className="text-[32px] sm:text-[42px] lg:text-[52px] font-normal italic leading-tight text-white"
              style={{ fontFamily: "'EB Garamond', serif", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
            >
              Modern Ethnic with a
              <br />Heritage Heart
            </h1>
            <div
              className="mx-auto mt-5 h-[1px] w-12"
              style={{ backgroundColor: "#AB721E" }}
            />
          </div>
        </div>
      </div>

      {/* ── THE NAARISA STORY ── */}
      <section
        className="w-full overflow-hidden px-4 py-16 sm:px-6 md:px-10 xl:px-12 sm:py-20"
        style={{ backgroundColor: "#F9F3EB" }}
      >
        <div
          ref={story.ref}
          className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          {/* LEFT — Text */}
          <div
            className="transition-all duration-1000"
            style={{
              opacity: story.inView ? 1 : 0,
              transform: story.inView ? "translateX(0)" : "translateX(-32px)",
            }}
          >
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em]"
              style={{ fontFamily: "'Jost', sans-serif", color: "#AB721E" }}
            >
              Est. 2024
            </p>

            <h2
              className="mb-5 text-[30px] sm:text-[36px] font-normal leading-tight"
              style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}
            >
              The Naarisa Story
            </h2>

            <p
              className="mb-5 text-[15px] font-light leading-[1.9]"
              style={{ fontFamily: "'Jost', sans-serif", color: "#4A3728" }}
            >
              Naarisa was born from a desire to redefine the dialogue
              between traditional craftsmanship and contemporary luxury.
              We believe that heritage isn't a relic of the past, but a living,
              breathing pulse that informs how we move through the modern world.
            </p>

            {/* Pull quote */}
            <div
              className="mb-8 pl-5"
              style={{ borderLeft: "2px solid #AB721E" }}
            >
              <p
                className="text-[15px] leading-[1.8] italic"
                style={{ fontFamily: "'EB Garamond', serif", color: "#4A3728" }}
              >
                "Our goal is to create 'breathable luxury'—garments that feel like a
                second skin, carrying the weight of centuries-old techniques with the
                lightness of modern silhouettes."
              </p>
            </div>

            <button
              className="inline-flex items-center gap-3 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300"
              style={{
                fontFamily: "'Jost', sans-serif",
                backgroundColor: "#AB721E",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#8B6914"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#AB721E"}
            >
              Discover Our Process
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          {/* RIGHT — Overlapping images */}
          <div
            className="relative transition-all duration-1000"
            style={{
              opacity: story.inView ? 1 : 0,
              transform: story.inView ? "translateX(0)" : "translateX(32px)",
              transitionDelay: "150ms",
              height: "460px",
            }}
          >
            {/* Main large image — top right */}
            <div
              className="absolute right-0 top-0 overflow-hidden"
              style={{
                width: "72%",
                height: "62%",
                background: "linear-gradient(135deg, #F5E6D0 0%, #C4A882 50%, #8B6914 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    rgba(43,33,18,0.1) 0px, rgba(43,33,18,0.1) 1px,
                    transparent 1px, transparent 8px
                  )`,
                }}
              />
              <div className="absolute bottom-3 right-3">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(43,33,18,0.4)" }}>Finest Weaves</p>
              </div>
            </div>

            {/* Overlapping smaller image — bottom left */}
            <div
              className="absolute bottom-0 left-0 overflow-hidden"
              style={{
                width: "58%",
                height: "55%",
                background: "linear-gradient(160deg, #2B2112 0%, #4A3728 40%, #8B6914 80%, #C47B1E 100%)",
                border: "4px solid #F9F3EB",
                zIndex: 2,
              }}
            >
              {/* Woven texture */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg, transparent, transparent 4px,
                    rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 5px
                  ), repeating-linear-gradient(
                    90deg, transparent, transparent 8px,
                    rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px
                  )`,
                }}
              />
              {/* Light rays */}
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 60% 30%, rgba(196,123,30,0.5) 0%, transparent 60%)" }}
              />
              <div className="absolute bottom-3 left-3">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(245,230,208,0.6)" }}>Artisan Craft</p>
              </div>
            </div>

            {/* Decorative corner accents */}
            <div
              className="absolute right-0 top-0 h-10 w-10"
              style={{
                borderRight: "2px solid #C47B1E",
                borderTop: "2px solid #C47B1E",
                transform: "translate(6px, -6px)",
                zIndex: 3,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section
        className="w-full overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:px-10 xl:px-12"
        style={{ backgroundColor: "#F5E6D0" }}
      >
        {/* Header */}
        <div
          ref={values.ref}
          className="mb-12 text-center transition-all duration-700"
          style={{
            opacity: values.inView ? 1 : 0,
            transform: values.inView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2
            className="mb-2 text-[28px] sm:text-[34px] font-normal italic"
            style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}
          >
            Our Core Values
          </h2>
          <p
            className="text-[13px] font-light"
            style={{ fontFamily: "'Jost', sans-serif", color: "#8C7B6B" }}
          >
            Foundations of an Artisanal Future
          </p>
          <div
            className="mx-auto mt-4 h-[1px] transition-all duration-1000"
            style={{
              backgroundColor: "#AB721E",
              width: values.inView ? "40px" : "0px",
              transitionDelay: "300ms",
            }}
          />
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-5 sm:grid-cols-3">
          {coreValues.map((val, index) => (
            <div
              key={index}
              className="transition-all duration-700"
              style={{
                opacity: values.inView ? 1 : 0,
                transform: values.inView ? "translateY(0)" : "translateY(28px)",
                transitionDelay: `${index * 120}ms`,
                backgroundColor: "#fff",
                border: "1px solid #E8DDD0",
                padding: "32px 28px",
              }}
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center"
                style={{ backgroundColor: "#F5E6D0", border: "1px solid #E8DDD0" }}
              >
                {val.icon}
              </div>
              <h3
                className="mb-3 text-[20px] font-normal"
                style={{ fontFamily: "'EB Garamond', serif", color: "#1f1b15" }}
              >
                {val.title}
              </h3>
              <p
                className="text-[13px] font-light leading-[1.8]"
                style={{ fontFamily: "'Jost', sans-serif", color: "#4A3728" }}
              >
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTAGRAM / LIFESTYLE GRID ── */}
      <section
        ref={grid.ref}
        className="w-full"
        style={{ backgroundColor: "#2B2112" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {gridImages.map((img, index) => (
            <div
              key={index}
              className="relative overflow-hidden transition-all duration-700"
              style={{
                aspectRatio: "1/1",
                background: img.gradient,
                opacity: grid.inView ? 1 : 0,
                transform: grid.inView ? "scale(1)" : "scale(0.96)",
                transitionDelay: `${index * 80}ms`,
                cursor: "pointer",
              }}
            >
              {/* Texture */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px,
                    transparent 1px, transparent 10px
                  )`,
                }}
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
                style={{ backgroundColor: "rgba(43,33,18,0.5)" }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'Jost', sans-serif", color: "#F5E6D0" }}
                >
                  {img.label}
                </p>
              </div>

              {/* Label bottom */}
              <div className="absolute bottom-3 left-3">
                <p
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(245,230,208,0.4)" }}
                >
                  Naarisa
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;