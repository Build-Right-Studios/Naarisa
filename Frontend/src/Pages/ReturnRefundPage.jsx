import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { RotateCcw, CreditCard, AlertCircle, MessageCircle, Tag } from "lucide-react";

const sections = [
  {
    icon: RotateCcw,
    title: "Returns",
    body: "You may request a return within 7 days of delivery. To be eligible, the product must be unused, unworn, unwashed, and returned with its original tags and packaging intact.",
  },
  {
    icon: CreditCard,
    title: "Refunds",
    body: "Once we receive and inspect the returned item, your refund will be initiated. Refunds are usually processed back to the original payment method. For COD or wallet-related cases, our team may ask for your bank account or UPI details. Refund timelines may vary depending on your bank or payment provider.",
  },
  {
    icon: AlertCircle,
    title: "Damaged, missing, or wrong items",
    body: "If you receive a damaged, defective, or incorrect product, please contact us as soon as possible with your order number and clear photos or videos of the issue. This helps us resolve the matter quickly.",
  },
  {
    icon: MessageCircle,
    title: "How to raise a request",
    body: "To start a return , simply contact our support team with your order details. Please keep your order number ready for faster assistance.",
  },
  {
    icon: Tag,
    title: "Important notes",
    body: "Items bought during special sale offers, customized products, or clearly marked non-returnable items may not be eligible for return unless they arrive damaged or incorrect. Any return request may be declined if the product shows signs of use, damage, missing tags, or missing packaging.",
  },
];

const ReturnRefundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">

      {/* Hero banner */}
      <div className="bg-[#2B2112] px-5 py-20 text-center sm:px-6 md:px-10">
        <p className="font-['Jost'] text-[11px] font-bold tracking-[0.22em] text-[#AB721E] uppercase mb-4">
          Policies
        </p>
        <h1 className="font-['Cormorant_Garamond'] text-[42px] sm:text-[54px] font-light italic text-[#F9F3EB] leading-tight">
          Return & Refund Policy
        </h1>
        <p className="mt-5 font-['Jost'] text-[14px] font-light leading-relaxed text-[#C4A882] max-w-md mx-auto">
          At Naarisa, we want you to feel confident with every order. If something does not fit right or is not what you expected, we are here to help.
        </p>
      </div>

      {/* Thin gold rule */}
      <div className="h-[2px] bg-[#AB721E] opacity-30" />

      {/* Policy sections */}
      <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-6 md:px-10">
        <div className="flex flex-col gap-0">
          {sections.map(({ icon: Icon, title, body }, i) => (
            <div key={i}>
              <div className="flex gap-5 py-10">
                {/* Icon */}
                <div className="shrink-0 mt-1">
                  <div className="w-9 h-9 rounded-full border border-[#D4B896] flex items-center justify-center">
                    <Icon size={16} className="text-[#AB721E]" />
                  </div>
                </div>
                {/* Text */}
                <div className="flex flex-col gap-3">
                  <h2 className="font-['Cormorant_Garamond'] text-[22px] font-semibold text-[#2B2112] leading-snug">
                    {title}
                  </h2>
                  <p className="font-['Jost'] text-[14px] font-light leading-[1.8] text-[#5C4A35]">
                    {body}
                  </p>
                </div>
              </div>
              {/* Divider — skip after last item */}
              {i < sections.length - 1 && (
                <div className="h-px bg-[#E8DDD0]" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 border border-[#D4B896] bg-[#FDF9F4] px-8 py-10 text-center">
          <p className="font-['Cormorant_Garamond'] text-[26px] font-light italic text-[#2B2112] mb-2">
            Still have questions?
          </p>
          <p className="font-['Jost'] text-[13px] font-light text-[#7A6A57] mb-7 leading-relaxed">
            Our team is happy to help you through a return, exchange, or any concern you may have.
          </p>
          <Link
            to="/contact"
            className="
              inline-flex items-center gap-2
              bg-[#2B2112] px-8 py-3
              font-['Jost'] text-[13px] font-light tracking-[0.1em] uppercase
              text-[#F9F3EB]
              transition-all duration-300
              hover:bg-[#AB721E]
            "
          >
            Contact Us
            <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPage;