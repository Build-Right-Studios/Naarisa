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

const PrivacyPolicyPage = () => {
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
Legal Entity Name: MOHAN LAL KUMAR
Trade Name: MOHAN EXCLUSIVE
GSTIN: 05ABAPK2165M1ZQ
Business Type: Proprietorship
Business Address: 1, Gurudwara Road, Kathra Bazar Jwalapur, Haridwar, Uttarakhand, 249407
Website: www.naarisa.com
Email: naarisa23@gmail.com
Phone: +91-9897139380`,
    },
    {
      id: 2,
      title: "Information We Collect",
      content: `When you visit or shop from Naarisa, we may collect certain information from you to provide a smooth shopping, delivery, and customer service experience.

Personal Information
We may collect personal details such as:
• Full name
• Mobile number
• Email address
• Shipping address
• Billing address
• City, state, and PIN code
• Order details
• Return or exchange request details
• Customer support communication

Account and Login Information
If you create an account or log in using OTP, we may collect:
• Mobile number
• Email address
• OTP verification status
• Login activity related to your account

Order and Transaction Information
When you place an order, we may collect:
• Product details
• Order ID
• Payment status
• Invoice details
• Delivery status
• Return or exchange status

Please note that we do not store your complete debit card, credit card, UPI PIN, net banking password, or other sensitive banking information on our website. Payments are processed through secure third-party payment gateways.

Device and Website Usage Information
When you visit our website, we may automatically collect certain technical information such as:
• IP address
• Browser type
• Device type
• Operating system
• Pages visited on our website
• Time spent on the website
• Referring website or source
• Cookies and similar tracking data`,
    },
    {
      id: 3,
      title: "How We Use Your Information",
      content: `We use your information to operate our website, process your orders, improve our services, and communicate with you.

Your information may be used for the following purposes:
• To create and manage your account
• To verify your login through OTP
• To process and confirm your orders
• To deliver products to your shipping address
• To send order confirmation, shipping, delivery, return, exchange, and customer service updates
• To process cancellations, returns, exchanges, and refunds
• To respond to your questions, complaints, or support requests
• To send invoices and transaction-related communication
• To improve our website, products, and customer experience
• To prevent fraud, misuse, or unauthorized activity
• To comply with legal, tax, regulatory, and business requirements`,
    },
    {
      id: 4,
      title: "SMS, Email and WhatsApp Communication",
      content: `By using Naarisa, creating an account, placing an order, or sharing your contact details with us, you agree that we may contact you through SMS, email, phone call, or WhatsApp for service-related communication.

We may use your mobile number and email address to send:
• OTP for login or verification
• Order confirmation
• Payment confirmation
• Shipping updates
• Delivery updates
• Return or exchange updates
• Refund updates
• Customer support messages
• Important account or service-related notifications

These communications are necessary to complete your transaction and provide customer support.

We may also send promotional offers, product updates, new arrival alerts, or marketing messages only where permitted under applicable law or where you have provided consent. You may opt out of promotional communication as per the options provided in such messages or by contacting us.`,
    },
    {
      id: 5,
      title: "Payments and Financial Information",
      content: `All online payments made on Naarisa are processed through secure third-party payment gateway partners.

We may receive limited payment-related information such as:
• Payment status
• Transaction ID
• Payment method type
• Order amount
• Refund status, if applicable

We do not store your complete card details, UPI PIN, CVV, net banking password, or other confidential banking credentials.

You should never share your OTP, UPI PIN, card PIN, banking password, or any sensitive financial information with anyone claiming to be from Naarisa. Naarisa will never ask you for such sensitive information over phone calls, SMS, email, or WhatsApp.`,
    },
    {
      id: 6,
      title: "Sharing of Information",
      content: `We may share your information with trusted third-party service providers only when necessary to operate our business and serve you better.

Your information may be shared with:
• Payment gateway partners
• Delivery and logistics partners
• SMS, email, and WhatsApp communication service providers
• Website hosting and technology service providers
• Customer support tools
• Analytics and marketing tools
• Legal, tax, or regulatory authorities, if required by law

We share only the information necessary for these partners to perform their services. For example, delivery partners may need your name, phone number, address, and order details to deliver your order.

We do not sell your personal information to third parties.`,
    },
    {
      id: 7,
      title: "Cookies and Tracking Technologies",
      content: `Our website may use cookies and similar technologies to improve your browsing experience.

Cookies help us:
• Keep you logged in
• Remember your preferences
• Understand how customers use our website
• Improve website speed and performance
• Show relevant products and recommendations
• Measure marketing and website performance

You can choose to disable cookies through your browser settings. However, some features of the website may not work properly if cookies are disabled.`,
    },
    {
      id: 8,
      title: "Data Security",
      content: `We take reasonable steps to protect your personal information from unauthorized access, misuse, loss, alteration, or disclosure.

We may use security measures such as:
• Secure website hosting
• SSL encryption
• Restricted access to customer data
• Secure payment gateway integrations
• Internal data handling controls

However, no website, online platform, or electronic storage system can be guaranteed to be 100% secure. By using our website, you understand and accept the risks associated with online data transmission.`,
    },
    {
      id: 9,
      title: "Data Retention",
      content: `We retain your personal information only for as long as necessary to fulfill the purposes mentioned in this Privacy Policy.

We may retain your data for:
• Order processing
• Delivery and customer support
• Return, exchange, and refund handling
• Legal, accounting, tax, and regulatory compliance
• Fraud prevention and dispute resolution
• Improving our services

When your information is no longer required, we may delete, anonymize, or securely store it as required by applicable law and business needs.`,
    },
    {
      id: 10,
      title: "Your Rights and Choices",
      content: `You may contact us to request:
• Access to your personal information
• Correction of incorrect or outdated information
• Deletion of your personal information, where legally permitted
• Withdrawal of consent for promotional communication
• Assistance with account-related privacy concerns

Please note that certain information may need to be retained for legal, tax, fraud prevention, order history, or dispute resolution purposes.

To make a privacy-related request, you can contact us at:
Email: naarisa23@gmail.com`,
    },
    {
      id: 11,
      title: "Marketing Communication",
      content: `If you subscribe to our updates, offers, or promotional messages, we may send you information about:
• New arrivals
• Offers and discounts
• Product launches
• Styling ideas
• Brand updates
• Festive collections

You may opt out of promotional emails, SMS, or WhatsApp messages by following the unsubscribe/opt-out option provided in the communication, or by contacting us at naarisa23@gmail.com.

Please note that even if you opt out of promotional communication, we may still send you important service-related messages such as OTP, order confirmation, delivery updates, return/exchange updates, and refund-related communication.`,
    },
    {
      id: 12,
      title: "Children's Privacy",
      content: `Our website is intended for use by individuals who are capable of entering into a legally binding agreement under applicable Indian laws.

We do not knowingly collect personal information from children without appropriate consent. If we become aware that such information has been collected without proper consent, we may take steps to delete it.`,
    },
    {
      id: 13,
      title: "Third-Party Links",
      content: `Our website may contain links to third-party websites, payment pages, delivery tracking pages, or social media platforms.

Once you leave our website or interact with a third-party platform, their privacy policy and terms will apply. Naarisa is not responsible for the privacy practices, content, or security of third-party websites or platforms.

We recommend that you read the privacy policies of any third-party services you use.`,
    },
    {
      id: 14,
      title: "Fraud Awareness and Customer Safety",
      content: `To protect our customers, please note:
• Naarisa will never ask for your UPI PIN, card PIN, CVV, banking password, or full card details
• Naarisa will never ask you to transfer money to a personal account for refunds
• Naarisa will never ask you to download unknown apps for refund or delivery support
• Refunds, if applicable, will be processed through approved business/payment channels
• Please verify any suspicious communication before taking action

If you receive any suspicious call, SMS, email, or WhatsApp message claiming to be from Naarisa, please contact us immediately.`,
    },
    {
      id: 15,
      title: "Changes to This Privacy Policy",
      content: `We may update this Privacy Policy from time to time to reflect changes in our business, website, legal requirements, or customer service practices.

The updated Privacy Policy will be posted on this page with a revised effective date. We encourage you to review this page periodically.

Your continued use of our website after any changes means that you accept the updated Privacy Policy.`,
    },
    {
      id: 16,
      title: "Contact Us",
      content: `For any privacy-related questions, concerns, or requests, you can contact us at:

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
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", width: "100%" }}>
      {/* ── Breadcrumb ── */}
      <div style={{
        width: "100%",
        paddingLeft: "clamp(16px, 5vw, 40px)",
        paddingRight: "clamp(16px, 5vw, 40px)",
        boxSizing: "border-box",
      }}>
        <p style={{
          fontFamily: T.sans, fontSize: "11px", letterSpacing: "0.14em",
          color: T.mid, textTransform: "uppercase", padding: "24px 0 0",
        }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Home
          </span>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: T.ink }}>Privacy Policy</span>
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
            Your privacy matters to us
          </p>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 400, color: T.ink, lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontFamily: T.sans, fontSize: "14px", color: T.mid,
            lineHeight: 1.7, maxWidth: "900px",
          }}>
            <strong>Effective Date:</strong>  17 June 2026 <br />
            Welcome to <strong>Naarisa.</strong> <br />
            Naarisa is a women's ethnic wear brand created to bring beautiful, everyday Indian fashion to the modern Naari. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you visit our website, browse our products, create an account, place an order, contact us, or use any of our services.
            By accessing or using our website www.naarisa.com, you agree to the terms of this Privacy Policy.

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

export default PrivacyPolicyPage;