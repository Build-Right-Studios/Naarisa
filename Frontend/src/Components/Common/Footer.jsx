import { Link } from "react-router-dom";
import { FiInstagram } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import {
  ShieldCheck,
  RefreshCcw,
  Truck,
  BadgeCheck,
  Banknote,
} from "lucide-react";

const footerLinks = {
  shop: [
    { title: "New Arrivals", path: "/new-in" },
    { title: "Bestsellers", path: "/best-sellers" },
    { title: "All Products", path: "/all-products" },
    { title: "Long Kurtis", path: "/categories/long-kurtis" },
    { title: "Short Kurtis", path: "/categories/short-kurtis" },
    { title: "Kurta Sets", path: "/categories/kurta-sets" },
    { title: "Dresses", path: "/categories/dresses" },
  ],
  customerCare: [
    { title: "Contact Us", path: "/contact" },
    { title: "Return & Refund Policy", path: "/return-refund-policy" },
  ],
  company: [
    { title: "About Us", path: "/about" },
    { title: "Terms and Conditions", path: "/terms-and-condition" },
    { title: "Privacy Policy", path: "/privacy-policy" },
  ],
};

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Payments", sub: "100% safe & secure" },
  { icon: RefreshCcw, label: "Easy Returns", sub: "Hassle-free returns" },
  { icon: Truck, label: "Fast Shipping", sub: "Pan India delivery" },
  { icon: BadgeCheck, label: "Quality Assured", sub: "Premium fabrics" },
  // { icon: Banknote, label: "COD Available", sub: "Pay on delivery" },
];

const ColumnHeading = ({ children }) => (
  <p className="font-['Jost'] text-[11px] font-bold tracking-[0.16em] text-[#AB721E] uppercase mb-6">
    {children}
  </p>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="font-['Jost'] text-[14px] font-light text-[#F0E6D6] transition-colors duration-300 hover:text-[#AB721E]"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  return (
    <footer className="w-full bg-[#2B2112]">
      {/* Main footer grid */}
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-6 md:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">

          {/* BRAND COLUMN */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <h2 className="font-['Cormorant_Garamond'] text-[38px] font-light tracking-widest text-[#F9F3EB] leading-none uppercase">
              Naarisa
            </h2>
            <p className="font-['Jost'] text-[13px] font-light leading-relaxed text-[#C4A882]">
              Contemporary ethnic wear designed for modern Indian women.
              Thoughtfully crafted kurta sets, dresses, co-ords, and festive
              styles that blend comfort, elegance, and everyday versatility.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-1">
              <a
                href="https://www.instagram.com/naarisa.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#F0E6D6] transition-colors duration-300 hover:text-[#AB721E]"
              >
                <FiInstagram size={22} />
              </a>
              <a
                href="https://wa.me/919897139380"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-[#F0E6D6] transition-colors duration-300 hover:text-[#AB721E]"
              >
                <IoLogoWhatsapp size={22} />
              </a>
            </div>
          </div>

          {/* SHOP COLUMN */}
          <div className="flex flex-col">
            <ColumnHeading>Shop</ColumnHeading>
            <ul className="flex flex-col gap-3">
              {footerLinks.shop.map((link, i) => (
                <FooterLink key={i} to={link.path}>
                  {link.title}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* CUSTOMER CARE COLUMN */}
          <div className="flex flex-col">
            <ColumnHeading>Customer Care</ColumnHeading>
            <ul className="flex flex-col gap-3">
              {footerLinks.customerCare.map((link, i) => (
                <FooterLink key={i} to={link.path}>
                  {link.title}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* COMPANY COLUMN */}
          <div className="flex flex-col">
            <ColumnHeading>Company</ColumnHeading>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link, i) => (
                <FooterLink key={i} to={link.path}>
                  {link.title}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* CONTACT COLUMN */}
          <div className="flex flex-col">
            <ColumnHeading>Contact</ColumnHeading>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:naarisa23@gmail.com"
                className="font-['Jost'] text-[14px] font-light text-[#F0E6D6] transition-colors duration-300 hover:text-[#AB721E] break-all"
              >
                naarisa23@gmail.com
              </a>
              <a
                href="tel:+919897139380"
                className="font-['Jost'] text-[14px] font-light text-[#F0E6D6] transition-colors duration-300 hover:text-[#AB721E]"
              >
                +91 98971 39380
              </a>
              <p className="font-['Jost'] text-[12px] font-light leading-relaxed text-[#C4A882]">
                Mon – Sat: 10 AM – 7 PM
                <br />
                Typically responds within 2–4 hours.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#3D3020]" />

      {/* Trust badges strip */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10 xl:px-12">
        <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 md:grid-cols-4">
          {trustBadges.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} className="flex items-center gap-3">
              <Icon size={26} className="text-[#AB721E] shrink-0" />
              <div>
                <p className="font-['Jost'] text-[11px] font-bold tracking-[0.08em] text-[#F9F3EB] uppercase">
                  {label}
                </p>
                <p className="font-['Jost'] text-[11px] font-light text-[#C4A882]">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3D3020]">
        <div className="mx-auto max-w-[1400px] px-5 py-5 sm:px-6 md:px-10 xl:px-12">
          <p className="font-['Jost'] text-[12px] font-light text-[#7A6A57] text-center">
            © 2026 Naarisa. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;