import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useState } from "react";

const footerLinks = {
  information: [
    { title: "Sustainability", path: "/sustainability" },
    { title: "Shipping & Returns", path: "/shipping-returns" },
    { title: "Contact Us", path: "/contact" },
  ],
  legal: [
    { title: "Privacy Policy", path: "/privacy-policy" },
    { title: "Terms of Service", path: "/terms-of-service" },
  ],
};

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: connect newsletter API
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="w-full bg-[#2B2112]">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-6 md:px-10 xl:px-12">

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND COLUMN */}
          <div className="flex flex-col gap-5">
            <h2
              className="
              font-['Cormorant_Garamond']
              text-[36px]
              font-light
              italic
              text-[#F9F3EB]
              leading-none
            "
            >
              Naarisa
            </h2>
            <p
              className="
              font-['Jost']
              text-[13px]
              font-light
              leading-relaxed
              text-[#C4A882]
            "
            >
              © 2024 Naarisa. Artisanal Craftsmanship,
              <br />
              Contemporary Luxury.
            </p>
          </div>

          {/* INFORMATION COLUMN */}
          <div className="flex flex-col gap-6">
            <p
              className="
              font-['Jost']
              text-[11px]
              font-bold
              tracking-[0.16em]
              text-[#AB721E]
              uppercase
            "
            >
              Information
            </p>
            <ul className="flex flex-col gap-4">
              {footerLinks.information.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="
                    font-['Jost']
                    text-[15px]
                    font-light
                    text-[#F0E6D6]
                    transition-all
                    duration-300
                    hover:text-[#AB721E]
                  "
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL COLUMN */}
          <div className="flex flex-col gap-6">
            <p
              className="
              font-['Jost']
              text-[11px]
              font-bold
              tracking-[0.16em]
              text-[#AB721E]
              uppercase
            "
            >
              Legal
            </p>
            <ul className="flex flex-col gap-4">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="
                    font-['Jost']
                    text-[15px]
                    font-light
                    text-[#F0E6D6]
                    transition-all
                    duration-300
                    hover:text-[#AB721E]
                  "
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER COLUMN */}
          <div className="flex flex-col gap-6">
            <p
              className="
              font-['Jost']
              text-[11px]
              font-bold
              tracking-[0.16em]
              text-[#AB721E]
              uppercase
            "
            >
              Newsletter
            </p>
            <p
              className="
              font-['Jost']
              text-[14px]
              font-light
              leading-relaxed
              text-[#F0E6D6]
            "
            >
              Join our circle for exclusive early access and
              stories from the loom.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex items-center border border-[#504537] bg-transparent"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="
                flex-1
                bg-transparent
                px-4
                py-3
                font-['Jost']
                text-[14px]
                font-light
                text-[#F0E6D6]
                placeholder-[#6B5A47]
                outline-none
              "
              />
              <button
                type="submit"
                className="
                flex
                items-center
                justify-center
                border-l
                border-[#504537]
                px-4
                py-3
                text-[#AB721E]
                transition-all
                duration-300
                hover:bg-[#AB721E]
                hover:text-[#2B2112]
              "
              >
                <FiArrowRight size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;