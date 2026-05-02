import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000 + 45 * 60 * 1000 + 22 * 1000);

function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins: Math.floor((diff / (1000 * 60)) % 60),
      secs: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function SilkCanvas() {
  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
      {/* Layered SVG silk simulation */}
      <svg
        viewBox="0 0 480 620"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="silk1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d4a2e" />
            <stop offset="30%" stopColor="#6b7a4a" />
            <stop offset="60%" stopColor="#8a9a60" />
            <stop offset="80%" stopColor="#c5c98a" />
            <stop offset="100%" stopColor="#4a5534" />
          </linearGradient>
          <linearGradient id="silk2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e3820" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#7a8a50" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#b8c47a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3a4528" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="sheen" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#e8edc0" stopOpacity="0" />
            <stop offset="35%" stopColor="#d4db9a" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#f0f4d0" stopOpacity="0.6" />
            <stop offset="65%" stopColor="#c8d080" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e8edc0" stopOpacity="0" />
          </linearGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Base */}
        <rect width="480" height="620" fill="url(#silk1)" />

        {/* Flowing wave paths - dark folds */}
        <path d="M-40,80 C80,60 160,140 280,100 C360,75 420,140 520,110" stroke="#1e2816" strokeWidth="70" fill="none" strokeOpacity="0.6" filter="url(#blur1)" />
        <path d="M-40,200 C60,170 180,250 300,210 C390,180 440,260 540,230" stroke="#252f18" strokeWidth="55" fill="none" strokeOpacity="0.7" filter="url(#blur1)" />
        <path d="M-40,340 C100,310 200,390 320,355 C400,330 460,395 560,360" stroke="#1a2210" strokeWidth="65" fill="none" strokeOpacity="0.65" filter="url(#blur1)" />
        <path d="M-40,480 C70,450 190,520 310,490 C400,468 450,530 550,500" stroke="#232d16" strokeWidth="50" fill="none" strokeOpacity="0.6" filter="url(#blur1)" />
        <path d="M-40,590 C90,560 200,620 330,590 C420,568 460,620 560,590" stroke="#1e2814" strokeWidth="60" fill="none" strokeOpacity="0.55" filter="url(#blur1)" />

        {/* Highlight / sheen waves */}
        <path d="M-40,130 C80,105 180,185 300,150 C380,125 430,190 530,160" stroke="#c5cb85" strokeWidth="18" fill="none" strokeOpacity="0.5" filter="url(#blur2)" />
        <path d="M-40,265 C100,240 200,310 320,275 C400,252 455,315 555,285" stroke="#d8e090" strokeWidth="14" fill="none" strokeOpacity="0.45" filter="url(#blur2)" />
        <path d="M-40,405 C90,378 195,450 315,415 C398,390 452,452 552,422" stroke="#bcc470" strokeWidth="20" fill="none" strokeOpacity="0.4" filter="url(#blur2)" />
        <path d="M-40,540 C80,514 185,575 308,545 C395,522 448,580 548,555" stroke="#c8d080" strokeWidth="12" fill="none" strokeOpacity="0.5" filter="url(#blur2)" />

        {/* Bright sheen overlay */}
        <path d="M160,0 C200,80 210,200 190,340 C175,450 185,540 170,620" stroke="url(#sheen)" strokeWidth="90" fill="none" filter="url(#blur2)" />
        <path d="M260,0 C290,100 295,220 275,370 C260,470 268,560 250,620" stroke="url(#sheen)" strokeWidth="50" fill="none" strokeOpacity="0.5" filter="url(#blur2)" />

        {/* Overall dark overlay for depth */}
        <rect width="480" height="620" fill="url(#silk2)" />
      </svg>
    </div>
  );
}

export default function NarisaLanding() {
  const { days, hours, mins, secs } = useCountdown(LAUNCH_DATE);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pad = (n) => String(n).padStart(2, "0");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div
      style={{
        fontFamily: "'Jost', sans-serif",
        background: "#e8f0dc",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

        .cormorant { font-family: 'Cormorant Garamond', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fade-up-1 { animation: fadeUp .8s ease both; }
        .fade-up-2 { animation: fadeUp .8s .15s ease both; }
        .fade-up-3 { animation: fadeUp .8s .3s ease both; }
        .fade-up-4 { animation: fadeUp .8s .45s ease both; }
        .fade-up-5 { animation: fadeUp .8s .6s ease both; }
        .fade-up-6 { animation: fadeUp .8s .75s ease both; }
        .img-fade  { animation: fadeIn 1.2s .1s ease both; }

        .notify-btn {
          background: #4a5e34;
          color: #f0f4e8;
          border: none;
          cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .notify-btn:hover {
          background: #3a4d28;
          transform: scale(1.02);
        }
        .email-input {
          background: #f5f8f0;
          border: 1.5px solid #d0dbbe;
          outline: none;
          transition: border .2s;
          color: #2a3420;
        }
        .email-input::placeholder { color: #9aaa88; }
        .email-input:focus { border-color: #7a9060; }

        .countdown-num {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          color: #1e2814;
          line-height: 1;
        }

        .caption-pill {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nav-pill {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.85);
        }
      `}</style>

      {/* Navbar */}
      <nav className="px-6 pt-5 pb-0">
        <div className="max-w-5xl mx-auto nav-pill rounded-full px-7 py-3.5 flex items-center justify-between shadow-sm">
          <span className="cormorant text-2xl font-medium text-[#1e2814] tracking-wide italic">
            Naarisa
          </span>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#4a5a3a] font-light tracking-wide">
            <a href="#" className="hover:text-[#1e2814] transition-colors">Our Story</a>
            <a href="#" className="hover:text-[#1e2814] transition-colors">The Atelier</a>
            <a href="#" className="text-[#1e2814] font-medium">Coming Soon</a>
          </div>

          {/* Cart icon */}
          <button className="text-[#3a4a2a] hover:text-[#1e2814] transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16 grid md:grid-cols-2 gap-12 items-center">

        {/* Left — Image */}
        <div className="relative img-fade">
          {/* Decorative circle behind */}
          <div
            className="absolute rounded-full"
            style={{
              width: "85%",
              height: "85%",
              background: "rgba(180,196,150,0.35)",
              top: "10%",
              left: "5%",
              zIndex: 0,
            }}
          />

          {/* Silk image card */}
          <div
            className="relative z-10 shadow-2xl"
            style={{
              borderRadius: "2rem",
              overflow: "hidden",
              aspectRatio: "3/4",
              maxWidth: "420px",
              boxShadow: "0 24px 80px rgba(30,40,20,0.22)",
            }}
          >
            <SilkCanvas />
          </div>

          {/* Caption pill */}
          <div
            className="caption-pill absolute bottom-8 right-0 z-20 px-6 py-3 rounded-full shadow-lg"
            style={{ border: "1px solid rgba(255,255,255,0.7)" }}
          >
            <span className="cormorant italic text-[#2a3820] text-lg tracking-wide">
              Hand-loomed. Digital-soul.
            </span>
          </div>
        </div>

        {/* Right — Content */}
        <div className="flex flex-col justify-center">
          <p
            className="fade-up-1 text-xs font-semibold tracking-[.2em] text-[#6a7a50] uppercase mb-5"
          >
            The Awakening
          </p>

          <h1 className="cormorant fade-up-2 text-[3.6rem] leading-[1.08] font-medium text-[#1a2210] mb-5">
            The Digital Silk
            <br />
            <em>is Unfolding</em>
          </h1>

          <p className="fade-up-3 text-[#5a6a48] text-base font-light leading-relaxed mb-10 max-w-sm">
            A new era of effortless ethnic wear for the modern woman is almost here.
            Join the inner circle for early access and exclusive previews.
            Let's get started.
          </p>

          {/* Countdown */}
          <div className="fade-up-4 flex items-start gap-7 mb-10">
            {[
              { val: pad(days),  label: "DAYS" },
              { val: pad(hours), label: "HOURS" },
              { val: pad(mins),  label: "MINS" },
              { val: pad(secs),  label: "SECS" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="countdown-num text-5xl">{val}</span>
                <span className="text-[10px] tracking-[.18em] text-[#8a9a72] font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="fade-up-5 flex gap-0 mb-5 max-w-sm">
            {submitted ? (
              <div className="w-full email-input rounded-full px-6 py-3.5 text-[#4a5e34] font-medium text-sm">
                ✓ You're on the list. We'll be in touch!
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-input flex-1 rounded-full px-6 py-3.5 text-sm"
                  style={{ borderRadius: "9999px 0 0 9999px", borderRight: "none" }}
                  required
                />
                <button
                  type="submit"
                  className="notify-btn px-7 py-3.5 text-sm font-medium tracking-wide"
                  style={{ borderRadius: "0 9999px 9999px 0" }}
                >
                  Notify Me
                </button>
              </>
            )}
          </form>

          {/* Scarcity note */}
          <p className="fade-up-6 flex items-center gap-2 text-[11px] tracking-[.14em] text-[#8a9a72] uppercase font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Limited slots available for early access
          </p>
        </div>
      </main>
    </div>
  );
}