import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Brand tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#F9F3EB",
  surface: "#FFFFFF",
  border: "#E8DDD0",
  ink: "#1f1b15",
  mid: "#8C7B6B",
  light: "#C4A882",
  gold: "#AB721E",
  serif: "'EB Garamond', serif",
  sans: "'Jost', sans-serif",
};

const TermsPage = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections = [
    {
      id: 1,
      title: "Business Details",
      content: `Brand Name: Naarisa
Operated By: Mohan Exclusive
Legal Entity Name: MOHAN LAL KUMAR
Trade Name: MOHAN EXCLUSIVE
GSTIN: 05ABAPK2165M1ZQ
Business Type: Proprietorship
Business Address: 1, Gurudwara Road, Kathra Bazar Jwalapur, Haridwar, Uttarakhand, 249407
Website: www.naarisa.com
Email: naarisa23@gmail.com
Phone: +91-9897139380

Naarisa is an online ethnic wear brand offering women's ethnic wear, including kurtis, kurti sets, dresses, co-ord sets, and related fashion products.`,
    },
    {
      id: 2,
      title: "Acceptance of Terms",
      content: `By visiting our website, creating an account, placing an order, or using any service provided by Naarisa, you confirm that:
• You have read and understood these Terms & Conditions
• You agree to follow these Terms & Conditions
• You are legally capable of entering into a binding agreement under applicable laws
• The information provided by you is true, accurate, and complete

If you do not agree with these Terms & Conditions, please do not use our website or services.`,
    },
    {
      id: 3,
      title: "Use of Website",
      content: `You agree to use the Naarisa website only for lawful purposes and in a manner that does not harm the website, the brand, other customers, or any third party.

You agree not to:
• Use the website for fraudulent or unlawful activities
• Provide false, incorrect, or misleading information
• Attempt to interfere with the website's security or functionality
• Copy, reproduce, or misuse any website content, product images, brand assets, or designs without permission
• Place fake orders or intentionally misuse offers, discounts, returns, or refund processes
• Use automated tools, bots, or scripts to access or scrape the website

Naarisa reserves the right to restrict, suspend, or terminate access to the website if we suspect misuse, fraud, or violation of these Terms & Conditions.`,
    },
    {
      id: 4,
      title: "Account Registration",
      content: `You may be required to create an account or verify your mobile number/email address to place an order or access certain features.

When creating an account or using OTP-based login, you are responsible for:
• Providing accurate contact details
• Keeping your login details secure
• Ensuring that your mobile number and email address are active and accessible
• Informing us if you suspect unauthorized use of your account

Naarisa will not be responsible for any loss caused due to incorrect information shared by you or unauthorized use of your account due to your negligence.`,
    },
    {
      id: 5,
      title: "Product Information",
      content: `We make reasonable efforts to display product information accurately, including product names, descriptions, prices, sizes, colors, images, fabrics, and care instructions.

However, please note:
• Product colors may slightly vary due to lighting, photography, screen settings, or device display differences
• Minor variations in print, embroidery, fabric texture, or shade may occur, especially in ethnic wear and handcrafted-style products
• Measurements are provided to help customers choose the right size, but slight variation may occur due to fabric type, stitching, or manual measurement
• Product availability may change without prior notice
• For Naarisa, size measurements may refer to garment measurements, not body measurements, wherever clearly mentioned on the size chart or product page

Customers are requested to read the product description, size chart, fabric details, and care instructions carefully before placing an order.`,
    },
    {
      id: 6,
      title: "Pricing",
      content: `All product prices listed on the website are in Indian Rupees unless stated otherwise.

Prices may include or exclude applicable taxes, shipping charges, or other fees depending on the final checkout page.

Naarisa reserves the right to:
• Change product prices at any time
• Correct pricing errors
• Modify or withdraw offers, discounts, or promotions
• Cancel orders placed due to incorrect pricing or technical errors

If an order is affected by a pricing error, we may contact you before processing the order or cancel the order and issue a refund, where applicable.`,
    },
    {
      id: 7,
      title: "Offers, Discounts and Promotions",
      content: `From time to time, Naarisa may offer discounts, coupon codes, sale prices, promotional offers, or launch offers.

These offers may be subject to specific conditions, including:
• Validity period
• Minimum order value
• Product/category exclusions
• One-time use restrictions
• Non-transferability
• Availability of stock
• Restrictions on combining multiple offers

Naarisa reserves the right to modify, pause, cancel, or withdraw any offer without prior notice.

In case of suspected misuse of offers, coupon codes, referral benefits, or promotional campaigns, Naarisa may cancel the order or restrict the customer account.`,
    },
    {
      id: 8,
      title: "Orders and Order Acceptance",
      content: `When you place an order on our website, you are making an offer to purchase the selected product(s).

An order is considered accepted only after Naarisa confirms it through order confirmation communication such as website confirmation, email, SMS, WhatsApp, or any other approved communication channel.

Naarisa reserves the right to cancel or refuse any order in situations including but not limited to:
• Product unavailability
• Payment failure
• Incorrect pricing
• Incorrect product listing
• Suspicious or fraudulent order activity
• Incomplete or incorrect shipping details
• Delivery not serviceable at the provided address
• Technical or system errors

If payment has already been made for a cancelled order, the refund will be processed as per our refund process and timelines.`,
    },
    {
      id: 9,
      title: "Payments",
      content: `Naarisa may provide multiple payment options, including but not limited to:
• UPI
• Debit card
• Credit card
• Net banking
• Wallets
• Cash on Delivery, if available
• Other payment methods supported by our payment partners

All online payments are processed through secure third-party payment gateway partners.

Naarisa does not store your complete card number, CVV, UPI PIN, net banking password, or other sensitive banking credentials.

You agree not to hold Naarisa responsible for payment failures, delays, or errors caused by banks, payment gateways, UPI networks, card networks, or other third-party payment service providers.`,
    },
    {
      id: 10,
      title: "Cash on Delivery",
      content: `If Cash on Delivery is available, it may be subject to:
• Serviceable PIN codes
• Order value limits
• Product/category restrictions
• Additional COD charges, if applicable
• Past order history
• Internal verification checks

Naarisa reserves the right to disable or reject Cash on Delivery for certain orders, locations, or customers if fraud risk, repeated cancellations, or delivery issues are identified.

Customers choosing Cash on Delivery are requested to keep the exact amount ready at the time of delivery.`,
    },
    {
      id: 11,
      title: "Shipping and Delivery",
      content: `Naarisa aims to process and ship orders within the timeline mentioned on the website or order confirmation page.

Estimated delivery timelines may depend on:
• Customer location
• Product availability
• Courier partner serviceability
• Public holidays
• Weather conditions
• Operational delays
• Payment verification
• High-demand sale periods

Typical delivery timelines may range from 3 to 10 working days, depending on the delivery location.

Delivery timelines are estimates and not guaranteed. Naarisa will not be liable for delays caused by courier partners, natural events, strikes, logistics issues, incorrect address details, or circumstances beyond our control.

Customers are responsible for providing complete and accurate delivery details, including:
• Full name
• Mobile number
• Complete address
• PIN code
• Landmark, if required

If delivery fails due to incorrect address, unavailable customer, unreachable phone number, or refusal to accept the order, additional shipping charges may apply for re-shipment.`,
    },
    {
      id: 12,
      title: "Delivery Communication",
      content: `Naarisa may contact you through SMS, email, WhatsApp, phone call, or other communication channels for service-related updates such as:
• OTP verification
• Order confirmation
• Payment confirmation
• Shipping update
• Delivery update
• Failed delivery attempt
• Return or exchange update
• Refund update
• Customer support assistance

By placing an order or sharing your contact details, you agree to receive such transaction and service-related communication.`,
    },
    {
      id: 13,
      title: "Cancellation Policy",
      content: `Customers may request cancellation before the order has been shipped.

Once an order has been shipped, cancellation may not be possible. In such cases, the customer may request a return or exchange after delivery, subject to the Return & Exchange Policy.

Naarisa may cancel an order due to:
• Product unavailability
• Payment failure
• Pricing or listing error
• Incomplete or incorrect address
• Suspicious or fraudulent activity
• Courier serviceability issues
• Operational reasons

If a prepaid order is cancelled, the refund will be processed to the original payment method or as per the applicable refund process.`,
    },
    {
      id: 14,
      title: "Return and Exchange Policy",
      content: `Naarisa wants customers to be happy with their purchase. However, returns and exchanges are subject to the policy applicable at the time of purchase.

A product may be eligible for return or exchange only if:
• The request is raised within the allowed return/exchange window
• The product is unused, unwashed, undamaged, and unaltered
• Original tags, labels, packaging, and invoice are intact
• The product is not marked as final sale, non-returnable, or non-exchangeable
• The issue is verified by our team, where required

Products may not be eligible for return/exchange in cases such as:
• Product has been used, washed, altered, damaged, or stained
• Tags or original packaging are missing
• Return request is raised after the allowed timeline
• Product was purchased under a final sale or clearance offer
• Damage is caused due to customer handling
• Slight color variation due to screen/lighting difference
• Minor measurement variation within acceptable tolerance

Customers are requested to check the product and size carefully before placing an order.

The detailed Return, Exchange and Refund Policy, once published separately on the website, will form part of these Terms & Conditions.`,
    },
    {
      id: 15,
      title: "Refunds",
      content: `Refunds, if applicable, will be processed after the returned product is received and inspected by Naarisa or its logistics partner.

Refund timelines may vary depending on:
• Payment method
• Bank processing time
• Payment gateway timelines
• Product inspection status
• Courier return delivery timeline

Refunds may be issued to:
• Original payment method
• Customer bank account
• Store credit
• Wallet/credit note

The mode of refund may depend on the original payment method and Naarisa's refund process at the time of purchase.

Shipping charges, COD charges, convenience fees, or gift wrapping charges may not be refundable unless specifically stated.`,
    },
    {
      id: 16,
      title: "Damaged, Defective or Wrong Product",
      content: `If you receive a damaged, defective, or incorrect product, please contact us within the timeline mentioned in our Return & Exchange Policy.

You may be required to share:
• Order ID
• Product images
• Packaging images
• Unboxing video, if requested
• Description of the issue

After verification, Naarisa may offer a replacement, exchange, return, store credit, or refund depending on product availability and issue validation.

Claims may be rejected if the product appears used, damaged after delivery, altered, washed, or if the issue is reported after the allowed timeline.`,
    },
    {
      id: 17,
      title: "Size and Fit",
      content: `Naarisa provides size charts to help customers choose the right product size.

Please note:
• Size charts may refer to garment measurements, not body measurements, wherever mentioned
• Fit may vary depending on fabric, cut, design, and style
• Slight measurement variation may occur due to manual measurement or garment construction

Customers are advised to compare the size chart with a similar well-fitting garment before placing an order.

Naarisa will not be responsible for size selection errors if the product size chart and product description were made available before purchase.`,
    },
    {
      id: 18,
      title: "Product Care",
      content: `Customers are requested to follow the wash care and fabric care instructions mentioned on the product page, product tag, or packaging.

Naarisa will not be responsible for product damage caused by:
• Incorrect washing
• Harsh detergents
• Bleaching
• Machine wash where hand wash/dry clean is recommended
• Direct sunlight exposure
• Ironing at incorrect temperature
• Mishandling or improper storage`,
    },
    {
      id: 19,
      title: "Intellectual Property",
      content: `All content available on the Naarisa website, including but not limited to:
• Brand name
• Logo
• Product images
• Product descriptions
• Website design
• Graphics
• Banners
• Text
• Videos
• Social media content
• Styling concepts

is owned by or licensed to Naarisa/Mohan Exclusive and is protected under applicable intellectual property laws.

You may not copy, reproduce, distribute, modify, publish, display, sell, or exploit any content from the website without prior written permission from Naarisa.`,
    },
    {
      id: 20,
      title: "User Reviews, Feedback and Content",
      content: `Customers may share reviews, ratings, feedback, photos, or comments about products or their shopping experience.

By submitting such content, you grant Naarisa the right to use, display, reproduce, edit, or publish the content for website, marketing, customer experience, and promotional purposes.

You agree not to submit content that is:
• False or misleading
• Abusive or offensive
• Defamatory
• Illegal
• Spam or promotional in nature
• Infringing on third-party rights

Naarisa reserves the right to remove or moderate user-generated content at its discretion.`,
    },
    {
      id: 21,
      title: "Third-Party Services",
      content: `Naarisa may use third-party service providers for:
• Payment processing
• Shipping and logistics
• SMS, email, and WhatsApp communication
• Website hosting
• Analytics
• Marketing
• Customer support

These third-party services may have their own terms and policies. Naarisa is not responsible for service interruptions, delays, technical issues, or errors caused by third-party providers.`,
    },
    {
      id: 22,
      title: "Privacy",
      content: `Your use of the website is also governed by our Privacy Policy.

Our Privacy Policy explains how we collect, use, store, and protect your personal information.

By using our website, you also agree to the terms of our Privacy Policy.`,
    },
    {
      id: 23,
      title: "Fraud Prevention and Customer Safety",
      content: `For customer safety, please note:
• Naarisa will never ask for your UPI PIN, card PIN, CVV, net banking password, or full card details
• Naarisa will never ask you to download unknown apps for refunds or delivery support
• Naarisa will never ask you to transfer money to a personal account for order confirmation or refund processing
• Refunds, if applicable, will be processed through official business/payment channels
• Customers should verify suspicious calls, messages, or payment requests before taking action

Naarisa reserves the right to cancel orders, block accounts, or take legal action in cases of suspected fraud, misuse, or unlawful activity.`,
    },
    {
      id: 24,
      title: "Limitation of Liability",
      content: `Naarisa will make reasonable efforts to provide accurate information, quality products, and timely services. However, we do not guarantee that the website will always be error-free, uninterrupted, or fully secure.

To the maximum extent permitted by law, Naarisa shall not be liable for:
• Indirect, incidental, or consequential losses
• Loss caused by incorrect customer information
• Delays caused by courier partners or third-party services
• Payment gateway failures
• Website downtime or technical errors
• Product color variation due to screen settings or photography
• Customer misuse, mishandling, or incorrect product care
• Events beyond our reasonable control

Our liability, if any, shall be limited to the value of the product purchased by the customer.`,
    },
    {
      id: 25,
      title: "Force Majeure",
      content: `Naarisa shall not be responsible for delays, non-performance, or failure to fulfill obligations due to events beyond our reasonable control, including but not limited to:
• Natural disasters
• Floods
• Fire
• Pandemic
• Government restrictions
• Strikes
• Transport disruptions
• Internet or technology failures
• Courier/logistics disruptions
• War, riots, or civil disturbances`,
    },
    {
      id: 26,
      title: "Changes to Website and Services",
      content: `Naarisa reserves the right to modify, suspend, or discontinue any part of the website, product collection, service, feature, offer, or policy at any time without prior notice.

We may update product details, pricing, policies, and website content from time to time.`,
    },
    {
      id: 27,
      title: "Changes to Terms & Conditions",
      content: `Naarisa may update these Terms & Conditions from time to time.

The updated version will be posted on this page with a revised effective date. Customers are encouraged to review this page periodically.

Your continued use of the website after any update means that you accept the updated Terms & Conditions.`,
    },
    {
      id: 28,
      title: "Governing Law and Jurisdiction",
      content: `These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India.

Any disputes arising out of or related to the use of the Naarisa website, products, orders, or services shall be subject to the jurisdiction of the courts located in Haridwar, Uttarakhand, unless otherwise required under applicable law.`,
    },
    {
      id: 29,
      title: "Contact Us",
      content: `For questions related to these Terms & Conditions, orders, payments, shipping, returns, exchanges, refunds, or customer support, you can contact us at:

Naarisa
Operated by Mohan Exclusive
Legal Entity Name: MOHAN LAL KUMAR
Trade Name: MOHAN EXCLUSIVE
GSTIN: 05ABAPK2165M1ZQ
Address: 1, Gurudwara Road, Kathra Bazar Jwalapur, Haridwar, Uttarakhand, 249407
Website: www.naarisa.com
Email: naarisa23@gmail.com
Phone: +91-9897139380`,
    },
  ];

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh" }}>
      {/* ── Breadcrumb ── */}
      <div style={{ margin: "0 auto", maxWidth: "1200px", paddingLeft: "20px", paddingRight: "20px" }}>
        <p style={{
          fontFamily: T.sans, fontSize: "11px", letterSpacing: "0.14em",
          color: T.mid, textTransform: "uppercase", padding: "24px 0 0",
        }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Home
          </span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: T.ink }}>Terms & Conditions</span>
        </p>
      </div>

      {/* ── Hero ── */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        padding: "48px clamp(16px, 5vw, 40px) 40px",
        marginBottom: "0",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{ maxWidth: "900px", width: "100%" }}>
          <p style={{
            fontFamily: T.sans, fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: T.gold, marginBottom: "12px",
          }}>
            Please read carefully
          </p>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 400, color: T.ink, lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            Terms & Conditions
          </h1>
          <p style={{
            fontFamily: T.sans, fontSize: "14px", color: T.mid,
            lineHeight: 1.7, maxWidth: "900px",
          }}>
            <strong>Effective Date:</strong>  17 June 2026 <br />
            Welcome to <strong>Naarisa.</strong> <br />
            These Terms & Conditions govern your access to and use of our website www.naarisa.com, including browsing products, creating an account, placing orders, making payments, requesting returns/exchanges, and using any services provided through the website.
            By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully before using the website or placing an order.

          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        width: "100%",
        paddingLeft: "clamp(16px, 5vw, 40px)",
        paddingRight: "clamp(16px, 5vw, 40px)",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{ padding: "48px 0", maxWidth: "900px", width: "100%" }}>

          {sections.map((section) => (
            <div
              key={section.id}
              style={{
                marginBottom: "32px",
                borderBottom: `1px solid ${T.border}`,
                paddingBottom: "32px",
              }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{
                  fontFamily: T.serif,
                  fontSize: "clamp(20px, 4vw, 28px)",
                  fontWeight: 400,
                  color: T.ink,
                  margin: 0,
                  textAlign: "left",
                }}>
                  {section.id}. {section.title}
                </h2>
                <span style={{
                  fontFamily: T.sans,
                  fontSize: "20px",
                  color: T.gold,
                  flexShrink: 0,
                  marginLeft: "16px",
                  transition: "transform 0.3s ease",
                  transform: expandedSections[section.id] ? "rotate(180deg)" : "rotate(0deg)",
                }}>
                  ▼
                </span>
              </button>

              {expandedSections[section.id] && (
                <div style={{
                  animation: "slideDown 0.3s ease-out",
                }}>
                  <p style={{
                    fontFamily: T.sans,
                    fontSize: "14px",
                    color: T.ink,
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}>
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ── Animation ── */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          h2 {
            font-size: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TermsPage;