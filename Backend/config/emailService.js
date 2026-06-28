import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (email, orderData) => {
  const { customOrderId, items, pricing, address } = orderData;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
            ${item.productName}
            <div style="font-size:13px;color:#6b7280;">
              ${item.variantName} • Size ${item.size}
            </div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;">
            ₹${item.priceAtOrder.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>
body{
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
    color:#222;
}

.container{
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border:1px solid #e5e7eb;
}

.section{
    padding:24px;
    border-bottom:1px solid #f1f1f1;
}

h2,h3{
    margin:0 0 16px;
    color:#111827;
}

p{
    margin:6px 0;
    color:#4b5563;
    font-size:14px;
}

.order-id{
    display:inline-block;
    margin-top:10px;
    padding:10px 14px;
    background:#f3f4f6;
    border-radius:6px;
    font-weight:600;
}

table{
    width:100%;
    border-collapse:collapse;
}

th{
    text-align:left;
    padding:12px;
    background:#f9fafb;
    font-size:14px;
}

.footer{
    padding:24px;
    text-align:center;
    font-size:12px;
    color:#6b7280;
}
</style>

</head>

<body>

<div class="container">

<div class="section">
<h2>Order Confirmed</h2>

<p>Thank you for shopping with <strong>Naarisa</strong>.</p>

<div class="order-id">
Order ID: ${customOrderId}
</div>

<p>
<strong>Order Date:</strong>
${new Date().toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
})}
</p>
</div>


<div class="section">

<h3>Order Summary</h3>

<table>

<thead>
<tr>
<th>Product</th>
<th style="text-align:center;">Qty</th>
<th style="text-align:right;">Price</th>
</tr>
</thead>

<tbody>
${itemsHtml}
</tbody>

</table>

</div>


<div class="section">

<h3>Payment Summary</h3>

<table>

<tr>
<td style="padding:8px 0;">Subtotal</td>
<td style="padding:8px 0;text-align:right;">
₹${pricing.subtotal.toFixed(2)}
</td>
</tr>

<tr>
<td style="padding:8px 0;">Discount</td>
<td style="padding:8px 0;text-align:right;color:#16a34a;">
-₹${pricing.discount.toFixed(2)}
</td>
</tr>

<tr>
<td style="padding-top:12px;font-weight:600;">
Total
</td>

<td style="padding-top:12px;text-align:right;font-weight:600;">
₹${pricing.total.toFixed(2)}
</td>

</tr>

</table>

</div>


<div class="section">

<h3>Delivery Address</h3>

<p>
<strong>${address.name}</strong><br>

${address.line1}<br>

${address.line2 ? `${address.line2}<br>` : ""}

${address.city}, ${address.state} - ${address.pincode}<br>

${address.country}<br><br>

Phone: +91 ${address.phone}
</p>

</div>


<div class="section">

<p>
Your order has been received and is being processed.
</p>

<p>
We'll send you another email when your order has been shipped.
</p>

</div>


<div class="footer">

<p>
This is an automated email. Please do not reply to this email.
</p>

<p>
If you need assistance, contact us at
<strong>support@naarisa.com</strong>.
</p>

<p>
© ${new Date().getFullYear()} Naarisa
</p>

</div>

</div>

</body>
</html>
`;

  try {
    const response = await resend.emails.send({
      from: "Naarisa <onboarding@resend.dev>",
      to: email,
      subject: `Order Confirmation | ${customOrderId}`,
      html: htmlContent,
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      throw new Error(response.error.message);
    }

    console.log(`Order confirmation email sent to ${email}`);
    return response.data;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    throw error;
  }
};

export const sendOrderShippedEmail = async (email, customOrderId, orderData = {}) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .section {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .order-id {
            background-color: #dbeafe;
            padding: 12px;
            border-radius: 4px;
            font-family: monospace;
            font-weight: 600;
            color: #0369a1;
            margin: 10px 0;
          }
          .button {
            display: inline-block;
            background-color: #0369a1;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 15px;
            font-weight: 600;
          }
          .button:hover {
            background-color: #0284c7;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <h2 style="margin-top: 0;">Your Order is On The Way! 📦</h2>
            <p>Great news! Your order has been shipped and is heading your way.</p>
            
            <div class="order-id">Order ID: ${customOrderId}</div>
            
            <p>
              <strong>Shipped Date:</strong> ${new Date().toLocaleDateString("en-IN")}
            </p>
          </div>

          ${orderData.trackingUrl
      ? `
            <div class="section">
              <h3>Track Your Order</h3>
              <p>Click the button below to track your shipment in real-time:</p>
              <a href="${orderData.trackingUrl}" class="button">Track Package</a>
            </div>
          `
      : ""
    }

          <div class="section" style="background-color: #f0f9ff;">
            <p style="margin: 0; color: #0c4a6e;">
              📞 Need help? Contact our support team at support@naarisa.com
            </p>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            <p>© ${new Date().getFullYear()} Naarisa. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Naarisa <onboarding@resend.dev>",
      to: email,
      subject: `Your Order is Shipped - ${customOrderId}`,
      html: htmlContent
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      throw new Error(response.error.message);
    }

    console.log(`Shipped email sent to ${email}`);
    return response.data;
  } catch (error) {
    console.error("Failed to send shipped email:", error);
    throw error;
  }
};

export const sendContactFormEmail = async (contactData) => {
  const {
    name,
    email,
    phone,
    subject,
    message,
  } = contactData;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>

body{
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
    color:#222;
}

.container{
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border:1px solid #e5e7eb;
}

.header{
    padding:28px;
    border-bottom:1px solid #e5e7eb;
}

.section{
    padding:24px;
    border-bottom:1px solid #f1f1f1;
}

.info-row{
    margin-bottom:18px;
}

.label{
    font-size:12px;
    font-weight:600;
    color:#6b7280;
    text-transform:uppercase;
    letter-spacing:.08em;
    margin-bottom:6px;
}

.value{
    font-size:15px;
    color:#111827;
    word-break:break-word;
}

.message-box{
    background:#f9fafb;
    border:1px solid #e5e7eb;
    padding:16px;
    white-space:pre-wrap;
    line-height:1.7;
    color:#374151;
}

.footer{
    padding:20px;
    text-align:center;
    font-size:12px;
    color:#6b7280;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h2 style="margin:0;">
New Contact Form Submission
</h2>

<p style="margin-top:10px;">
A customer has submitted a new enquiry from the Naarisa website.
</p>

</div>


<div class="section">

<div class="info-row">
<div class="label">Full Name</div>
<div class="value">${name}</div>
</div>

<div class="info-row">
<div class="label">Email</div>
<div class="value">
<a href="mailto:${email}">
${email}
</a>
</div>
</div>

<div class="info-row">
<div class="label">Phone</div>
<div class="value">
${phone || "Not provided"}
</div>
</div>

<div class="info-row">
<div class="label">Subject</div>
<div class="value">
${subject}
</div>
</div>

<div class="info-row">
<div class="label">Submitted On</div>
<div class="value">
${new Date().toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
})}
</div>
</div>

</div>


<div class="section">

<div class="label">
Customer Message
</div>

<div class="message-box">
${message}
</div>

</div>


<div class="footer">

This email was automatically generated from the Naarisa Contact Us form.

</div>

</div>

</body>
</html>
`;

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.CONTACT_EMAIL || "naarisa23@gmail.com",
      // to: "aryeshsrivastava@gmail.com",
      replyTo: email,
      subject: `New Contact Form | ${subject}`,
      html: htmlContent,
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      throw new Error(response.error.message);
    }

    console.log(`Contact form email received from ${email}`);

    return response.data;
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    throw error;
  }
};

// export const sendPaymentFailedEmail = async (email, customOrderId, reason = "") => {
//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="utf-8">
//         <style>
//           body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
//           .section { background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
//           .alert { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; }
//           .order-id { background-color: #fee2e2; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: 600; color: #991b1b; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="section alert">
//             <h2 style="margin-top: 0; color: #991b1b;">Payment Could Not Be Processed</h2>
//             <p>We were unable to process your payment for order <strong>${customOrderId}</strong>.</p>
//             <p style="color: #7f1d1d;"><strong>Reason:</strong> ${reason || "Payment declined"}</p>
//           </div>

//           <div class="section">
//             <h3>What to do next?</h3>
//             <ol>
//               <li>Check your payment details and try again</li>
//               <li>Contact your bank if the issue persists</li>
//               <li>Try a different payment method</li>
//             </ol>
//             <p>Your order cart has been saved. You can complete the payment anytime.</p>
//           </div>

//           <div class="section" style="background-color: #f0fdf4;">
//             <p>Need help? Contact us at support@naarisa.com</p>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;

//   try {
//     const response = await resend.emails.send({
//       from: process.env.RESEND_FROM_EMAIL || "Naarisa <onboarding@resend.dev>",
//       to: email,
//       subject: `Payment Failed - Order ${customOrderId}`,
//       html: htmlContent
//     });

//     if (response.error) {
//       throw new Error(response.error.message);
//     }

//     return response.data;
//   } catch (error) {
//     console.error("Failed to send payment failed email:", error);
//     throw error;
//   }
// };