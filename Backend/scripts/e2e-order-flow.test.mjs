// End-to-end test of checkout, payment confirmation, pending-order cleanup, late payments,
// Shiprocket tracking, search and admin auth against a REAL MongoDB replica set (any Atlas
// cluster, including a free M0). Razorpay, MSG91, Resend and Shiprocket are stubbed, so no
// payment, SMS, email or courier call leaves this machine.
//
//   1. Put MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/naarisa_e2e?retryWrites=true&w=majority
//      in Backend/.env.test (gitignored). The database name MUST be naarisa_e2e — it is wiped.
//   2. npm run test:e2e
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// ── env ──────────────────────────────────────────────────────────────────────
for (const line of fs.readFileSync(path.join(here, "..", ".env.test"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}
Object.assign(process.env, {
  JWT_SECRET: "e2e-jwt-secret",
  RAZORPAY_KEY_ID: "rzp_test_e2e",
  RAZORPAY_KEY_SECRET: "e2e-key-secret",
  RAZORPAY_WEBHOOK_SECRET: "e2e-webhook-secret",
  IMAGEKIT_PUBLIC_KEY: "x", IMAGEKIT_PRIVATE_KEY: "x", IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/x",
  RESEND_API_KEY: "re_e2e", RESEND_FROM_EMAIL: "Test <t@example.com>",
  MSG91_AUTH_KEY: "x", MSG91_ORDER_CONFIRMATION_FLOW: "flow_confirm",
  SHIPROCKET_BASE_URL: "https://shiprocket.stub/v1/external", SHIPROCKET_EMAIL: "x", SHIPROCKET_PASSWORD: "x",
  SHIPROCKET_WEBHOOK_TOKEN: "e2e-token",
});
if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI in Backend/.env.test (see the top of this file)");
const dbName = process.env.MONGO_URI.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/)?.[1];
if (dbName !== "naarisa_e2e") throw new Error(`Refusing to run: database must be "naarisa_e2e", got "${dbName}"`);

// ── stubs ────────────────────────────────────────────────────────────────────
const calls = { sms: 0, email: 0, refunds: [], shiprocket: [] };
const { default: axios } = await import("axios");
let shiprocketTrack = null;
axios.post = async (url) => {
  if (url.includes("msg91")) { calls.sms++; return { data: { type: "success" } }; }
  if (url.includes("shiprocket.stub") && url.endsWith("/auth/login")) return { data: { token: "sr-token" } };
  throw new Error(`Unexpected axios.post ${url}`);
};
axios.get = async (url) => {
  if (url.includes("shiprocket.stub")) { calls.shiprocket.push(url); return { data: shiprocketTrack }; }
  throw new Error(`Unexpected axios.get ${url}`);
};
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (String(url).includes("resend")) { calls.email++; return new Response(JSON.stringify({ id: "email_1" }), { status: 200, headers: { "content-type": "application/json" } }); }
  return realFetch(url, opts);
};

const { razorpay } = await import("../Modules/Payment/config.js");
let rzpSeq = 0;
let rzpPayments = {};          // razorpayOrderId → [{id, status}]
let refundShouldFail = false;
razorpay.orders.create = async ({ amount }) => ({ id: `order_e2e_${++rzpSeq}`, amount, currency: "INR" });
razorpay.orders.fetchPayments = async (orderId) => ({ items: rzpPayments[orderId] || [] });
razorpay.payments.refund = async (paymentId, body) => {
  await new Promise((r) => setTimeout(r, 50));
  if (refundShouldFail) throw { error: { description: "stub refund failure" } };
  const refund = { id: `rfnd_${calls.refunds.length + 1}`, paymentId, ...body };
  calls.refunds.push(refund);
  return refund;
};

// What Razorpay's API reports for a payment id (payments not recorded here "don't exist")
const rzpPaymentRecords = {};
const recordPayment = (razorpayOrderId, paymentId, amount, status = "captured") => {
  rzpPaymentRecords[paymentId] = { id: paymentId, order_id: razorpayOrderId, amount, status };
};
razorpay.payments.fetch = async (paymentId) => {
  const record = rzpPaymentRecords[paymentId];
  if (!record) throw { statusCode: 400, error: { description: "The id provided does not exist" } };
  return record;
};

// ── app modules ──────────────────────────────────────────────────────────────
const { default: mongoose } = await import("mongoose");
const { Product, Variant, User, Coupon, CouponUsage, Order, Admin, Category } = await import("../MongoDB/models.js");
const { placeOrderService } = await import("../Modules/Order/Service/placeOrderService.js");
const { confirmOrderAndNotify } = await import("../Modules/Payment/Service/orderConfirmationService.js");
const { verifyPaymentService } = await import("../Modules/Payment/Service/verifyPaymentService.js");
const { handleRazorpayWebhook, verifyWebhookSignature } = await import("../Modules/Payment/Service/razorpayWebhookService.js");
const { expirePendingOrder } = await import("../Utils/cleanupExpiredOtps.js");
const { processTrackingWebhook, syncOrderTracking } = await import("../Modules/Shipping/Service/trackingService.js");
const { trackShipmentService } = await import("../Modules/Shipping/Service/trackShipmentService.js");
const { getAllProductsQuery } = await import("../Modules/Product/Query/getAllProductsQuery.js");
const { isAdmin } = await import("../Middleware/isAdmin.js");
const { generateAccessToken } = await import("../Utils/jwt.js");
const { getWebsiteCoupons } = await import("../Modules/Coupons/Controller/getWebsiteCoupons.js");

// ── tiny runner ──────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const quiet = async (fn) => { const log = console.log; console.log = () => {}; try { return await fn(); } finally { console.log = log; } };
const test = async (name, fn) => {
  try { await quiet(fn); passed++; process.stdout.write(`  ✔ ${name}\n`); }
  catch (e) { failed++; process.stdout.write(`  ✘ ${name}\n      ${e?.stack || JSON.stringify(e)}\n`); }
};
const eq = (actual, expected, label = "") => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
};
const expectStatus = async (promise, status) => {
  try { await promise; throw new Error("did not throw"); } catch (e) { eq(e.status, status, e.message); }
};
const settle = () => new Promise((r) => setTimeout(r, 150)); // let fire-and-forget notifications run
const stockOf = async (variantId, size = "M") => (await Variant.findById(variantId)).sizes.find((s) => s.size === size).quantity;
const sign = (orderId, paymentId) => crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

// ── seed ─────────────────────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI);
await mongoose.connection.db.dropDatabase();
await Promise.all([Order, Variant, Product, User, Coupon, CouponUsage, Admin, Category].map((m) => m.init()));

const product = await Product.create({ name: "E2E Kurti", category: "Short Kurti", basePrice: 1000, tags: ["cotton"] });
const variant = await Variant.create({
  productId: product._id, color: { name: "blue", hex: "#0000ff" }, slug: "e2e-kurti-blue",
  images: [{ url: "https://ik.imagekit.io/x/a.jpg", fileId: "f1" }], sizes: [{ size: "M", quantity: 10 }],
  discountPrice: 800, description: "d", fabricCare: "f",
});
const user = await User.create({
  name: "Tester", phone: "9999999999", email: "account@example.com",
  addresses: [{ name: "Tester", phone: "9999999999", email: "saved@example.com", line1: "12 Main St", line2: "Old Town", city: "Haridwar", state: "Uttarakhand", pincode: "249401" }],
});
const otherUser = await User.create({ name: "Other", phone: "8888888888" });
const coupon = await Coupon.create({ code: "E2E10", discountType: "percentage", discountValue: 10, expiryDate: new Date(Date.now() + 864e5), maxUses: 100 });

const items = (qty = 2) => [{ productId: String(product._id), variantId: String(variant._id), size: "M", quantity: qty }];
const inlineAddress = { name: "Tester", phone: "9999999999", line1: "1 Inline Rd", line2: "Sector 4", city: "Haridwar", state: "Uttarakhand", pincode: "249401", country: "India" };
const place = (opts = {}) => quiet(() => placeOrderService({ user, items: items(opts.qty), address: inlineAddress, addressId: opts.addressId, couponCode: opts.coupon }));
const makeStale = (orderId) => Order.collection.updateOne({ _id: orderId }, { $set: { createdAt: new Date(Date.now() - 31 * 60 * 1000) } });

console.log(`Connected to ${dbName}; running tests\n`);
console.log("Checkout and payment");

let first;
await test("place order: server-side pricing, coupon, stock reserved, email falls back to account", async () => {
  first = await place({ coupon: "E2E10" });
  eq(first.pricing, { subtotal: 1600, discount: 160, total: 1440 }, "pricing");
  const order = await Order.findById(first.orderId);
  eq([order.status, order.payment.status], ["payment_pending", "pending"], "status");
  eq(order.address.email, "account@example.com", "address.email");
  eq(order.address.line2, "Sector 4", "line2");
  eq(await stockOf(variant._id), 8, "stock");
});

await test("saved address keeps its email (resolveAddress)", async () => {
  const r = await place({ addressId: String(user.addresses[0]._id), qty: 1 });
  const order = await Order.findById(r.orderId);
  eq([order.address.email, order.address.line2], ["saved@example.com", "Old Town"]);
  await Order.deleteOne({ _id: r.orderId });
  await Variant.updateOne({ _id: variant._id, "sizes.size": "M" }, { $inc: { "sizes.$.quantity": 1 } });
});

await test("verify-payment + webhook racing on one order → confirmed once, coupon counted once, one SMS + one email", async () => {
  const before = { ...calls };
  recordPayment(first.razorpayOrderId, "pay_1", 144000);
  const event = { event: "payment.captured", payload: { payment: { entity: { order_id: first.razorpayOrderId, id: "pay_1" } } } };
  const [verified] = await Promise.all([
    verifyPaymentService({ razorpayOrderId: first.razorpayOrderId, razorpayPaymentId: "pay_1", razorpaySignature: sign(first.razorpayOrderId, "pay_1") }),
    handleRazorpayWebhook(event),
    confirmOrderAndNotify(first.orderId, "pay_1"),
  ]);
  await settle();
  eq(verified.status, "confirmed", "verify response");
  const order = await Order.findById(first.orderId);
  eq([order.status, order.payment.status, order.payment.razorpayPaymentId], ["confirmed", "paid", "pay_1"]);
  eq(order.timeline.filter((t) => t.status === "confirmed").length, 1, "confirmed timeline entries");
  eq((await Coupon.findById(coupon._id)).usedCount, 1, "coupon usedCount");
  eq((await CouponUsage.findOne({ couponId: coupon._id, userId: user._id })).usageCount, 1, "per-user usage");
  eq([calls.sms - before.sms, calls.email - before.email], [1, 1], "[sms, email] sent");
});

await test("verify-payment after the webhook already confirmed → success, not 500", async () => {
  const r = await verifyPaymentService({ razorpayOrderId: first.razorpayOrderId, razorpayPaymentId: "pay_1", razorpaySignature: sign(first.razorpayOrderId, "pay_1") });
  eq(r.status, "confirmed");
});

await test("verify-payment with a bad signature → 400", async () => {
  try { await verifyPaymentService({ razorpayOrderId: first.razorpayOrderId, razorpayPaymentId: "pay_1", razorpaySignature: "bad" }); throw new Error("did not throw"); }
  catch (e) { eq(e.status, 400); }
});

await test("webhook signature check (constant-time) accepts the right HMAC only", async () => {
  const body = Buffer.from('{"a":1}');
  const good = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
  eq([verifyWebhookSignature(body, good), verifyWebhookSignature(body, "x"), verifyWebhookSignature(body, good.slice(0, -1) + "0")], [true, false, false]);
});

await test("forged payments: correctly signed events for payments Razorpay doesn't confirm are ignored", async () => {
  const r = await place({ qty: 1 });
  const err = console.error; console.error = () => {};
  try {
    // signed webhook for a payment id Razorpay has never seen
    await handleRazorpayWebhook({ event: "payment.captured", payload: { payment: { entity: { order_id: r.razorpayOrderId, id: "pay_forged" } } } });
    eq((await Order.findById(r.orderId)).status, "payment_pending", "forged webhook");
    // signed checkout callback for a payment id Razorpay has never seen
    await expectStatus(verifyPaymentService({ razorpayOrderId: r.razorpayOrderId, razorpayPaymentId: "pay_forged", razorpaySignature: sign(r.razorpayOrderId, "pay_forged") }), 400);
    // a real payment, but for the wrong amount
    recordPayment(r.razorpayOrderId, "pay_short", 100);
    await expectStatus(verifyPaymentService({ razorpayOrderId: r.razorpayOrderId, razorpayPaymentId: "pay_short", razorpaySignature: sign(r.razorpayOrderId, "pay_short") }), 400);
    // a payment that was never completed
    recordPayment(r.razorpayOrderId, "pay_created", 80000, "created");
    await handleRazorpayWebhook({ event: "order.paid", payload: { payment: { entity: { order_id: r.razorpayOrderId, id: "pay_created" } } } });
    eq((await Order.findById(r.orderId)).status, "payment_pending", "uncaptured payment");
    // the checkout callback may arrive while the payment is still "authorized" (auto-capture pending)
    recordPayment(r.razorpayOrderId, "pay_auth_ok", 80000, "authorized");
    const ok = await verifyPaymentService({ razorpayOrderId: r.razorpayOrderId, razorpayPaymentId: "pay_auth_ok", razorpaySignature: sign(r.razorpayOrderId, "pay_auth_ok") });
    eq(ok.status, "confirmed", "authorized payment via checkout callback");
  } finally { console.error = err; }
});

console.log("\nPending-order cleanup");

let expired;
await test("stale unpaid order, no Razorpay payment → cancelled (kept, not deleted), stock released", async () => {
  expired = await place();
  const stockBefore = await stockOf(variant._id);
  await makeStale(expired.orderId);
  eq(await expirePendingOrder(await Order.findById(expired.orderId)), "cancelled");
  const order = await Order.findById(expired.orderId);
  eq([order.status, order.payment.status], ["cancelled", "failed"]);
  eq(await stockOf(variant._id), stockBefore + 2, "stock released");
});

await test("running cleanup again on the same order does nothing (no double stock release)", async () => {
  const stock = await stockOf(variant._id);
  eq(await expirePendingOrder(await Order.findById(expired.orderId)), "skipped");
  eq(await stockOf(variant._id), stock);
});

await test("stale order whose payment WAS captured (webhook missed) → confirmed, not cancelled", async () => {
  const r = await place();
  await makeStale(r.orderId);
  rzpPayments[r.razorpayOrderId] = [{ id: "pay_missed", status: "failed" }, { id: "pay_captured", status: "captured" }];
  eq(await expirePendingOrder(await Order.findById(r.orderId)), "confirmed");
  const order = await Order.findById(r.orderId);
  eq([order.status, order.payment.razorpayPaymentId], ["confirmed", "pay_captured"]);
});

await test("stale order with an authorized (uncaptured) payment → left pending for next run", async () => {
  const r = await place();
  await makeStale(r.orderId);
  rzpPayments[r.razorpayOrderId] = [{ id: "pay_auth", status: "authorized" }];
  eq(await expirePendingOrder(await Order.findById(r.orderId)), "awaiting_capture");
  eq((await Order.findById(r.orderId)).status, "payment_pending");
});

console.log("\nLate payments (after the order expired)");

await test("late payment, stock still available → order revived and confirmed, stock re-reserved", async () => {
  const stock = await stockOf(variant._id);
  const result = await confirmOrderAndNotify(expired.orderId, "pay_late");
  const order = await Order.findById(expired.orderId);
  eq([result.status, order.status, order.payment.status, order.payment.razorpayPaymentId], ["confirmed", "confirmed", "paid", "pay_late"]);
  eq(await stockOf(variant._id), stock - 2, "stock re-reserved");
});

await test("late payment, stock gone, webhook + verify racing → exactly one refund, status refund_initiated", async () => {
  await Variant.updateOne({ _id: variant._id, "sizes.size": "M" }, { $set: { "sizes.$.quantity": 10 } });
  const r = await place();
  await makeStale(r.orderId);
  await expirePendingOrder(await Order.findById(r.orderId));
  await Variant.updateOne({ _id: variant._id, "sizes.size": "M" }, { $set: { "sizes.$.quantity": 0 } });
  const refundsBefore = calls.refunds.length;
  recordPayment(r.razorpayOrderId, "pay_oos", 160000);
  const results = await Promise.allSettled([
    verifyPaymentService({ razorpayOrderId: r.razorpayOrderId, razorpayPaymentId: "pay_oos", razorpaySignature: sign(r.razorpayOrderId, "pay_oos") }),
    confirmOrderAndNotify(r.orderId, "pay_oos"),
  ]);
  eq(results[0].status === "rejected" && results[0].reason.status, 409, "verify-payment tells the customer (409)");
  eq(calls.refunds.length - refundsBefore, 1, "refunds issued");
  eq(calls.refunds.at(-1).amount, 160000, "refund amount (paise)");
  const order = await Order.findById(r.orderId);
  eq([order.status, order.payment.status, order.refund.status, order.refund.razorpayRefundId], ["refund_initiated", "paid", "initiated", calls.refunds.at(-1).id]);
  eq(await stockOf(variant._id), 0, "stock untouched");
});

await test("late payment where the refund API fails → refund.status failed (flagged for manual refund)", async () => {
  await Variant.updateOne({ _id: variant._id, "sizes.size": "M" }, { $set: { "sizes.$.quantity": 2 } });
  const r = await place();
  await makeStale(r.orderId);
  await expirePendingOrder(await Order.findById(r.orderId));
  await Variant.updateOne({ _id: variant._id, "sizes.size": "M" }, { $set: { "sizes.$.quantity": 0 } });
  refundShouldFail = true;
  const err = console.error; console.error = () => {};
  try { await confirmOrderAndNotify(r.orderId, "pay_fail"); } finally { console.error = err; refundShouldFail = false; }
  const order = await Order.findById(r.orderId);
  eq([order.status, order.refund.status], ["refund_initiated", "failed"]);
  await Variant.updateOne({ _id: variant._id, "sizes.size": "M" }, { $set: { "sizes.$.quantity": 10 } });
});

await test("first-time coupons ignore abandoned (cancelled, unpaid) orders", async () => {
  await Coupon.create({ code: "WELCOME", discountType: "flat", discountValue: 100, expiryDate: new Date(Date.now() + 864e5), firstTimeUserOnly: true });
  await Order.create({ customOrderId: "ORD_ABANDON1", user: otherUser._id, items: [{ product: product._id, variant: variant._id, size: "M", quantity: 1, priceAtOrder: 800, productName: "x", variantName: "blue" }], pricing: { subtotal: 800, total: 800 }, address: inlineAddress, payment: { razorpayOrderId: "order_abandon", status: "failed" }, status: "cancelled" });
  let body;
  await getWebsiteCoupons({ user: otherUser }, { status: () => ({ json: (b) => { body = b; } }) });
  eq(body.coupons.some((c) => c.code === "WELCOME"), true, "WELCOME visible");
});

console.log("\nShipment tracking");

let shipped;
await test("Shiprocket webhook: IN TRANSIT → delivery in_transit, order dispatched, scans stored in IST order", async () => {
  const r = await place({ qty: 1 });
  await confirmOrderAndNotify(r.orderId, "pay_ship");
  await Order.updateOne({ _id: r.orderId }, { "delivery.awbCode": "AWB123", "delivery.shipmentId": "S1", "delivery.shiprocketOrderId": "999", "delivery.status": "pickup_requested" });
  shipped = r;
  const order = await processTrackingWebhook({
    awb: "AWB123", sr_order_id: 999, current_status: "IN TRANSIT", shipment_status: "IN TRANSIT", shipment_status_id: 18,
    scans: [
      { date: "2026-10-14 18:30:00", activity: "In transit to hub", location: "Delhi", "sr-status-label": "IN TRANSIT" },
      { date: "2026-10-14 10:00:00", activity: "Picked up", location: "Haridwar", "sr-status-label": "PICKED UP" },
    ],
  });
  eq([order.delivery.status, order.status], ["in_transit", "dispatched"]);
  eq(order.delivery.trackingEvents.map((e) => e.activity), ["Picked up", "In transit to hub"], "events oldest first");
  eq(order.delivery.trackingEvents[0].date.toISOString(), "2026-10-14T04:30:00.000Z", "IST parsed");
});

await test("webhook with an unknown status leaves the status unchanged; unknown AWB is ignored", async () => {
  const warn = console.warn; console.warn = () => {};
  try {
    const order = await processTrackingWebhook({ awb: "AWB123", current_status: "SOMETHING NEW", scans: [] });
    eq([order.delivery.status, order.status], ["in_transit", "dispatched"]);
    eq(await processTrackingWebhook({ awb: "NOPE", current_status: "DELIVERED" }), null);
    eq(await processTrackingWebhook({ current_status: "DELIVERED" }), null, "no awb / sr_order_id must not match any order");
  } finally { console.warn = warn; }
});

await test("admin sync with numeric shipment_status 7 + shipment_track_activities → delivered", async () => {
  shiprocketTrack = { tracking_data: { track_status: 1, shipment_status: 7, shipment_track: [{ current_status: "Delivered" }], shipment_track_activities: [{ date: "2026-10-16 12:00:00", activity: "Delivered to customer", location: "Haridwar", "sr-status-label": "DELIVERED" }], track_url: "https://shiprocket.co/tracking/AWB123", etd: "2026-10-16 18:00:00" } };
  const order = await syncOrderTracking(shipped.orderId);
  eq([order.delivery.status, order.status, Boolean(order.delivery.deliveredAt), order.delivery.trackingUrl], ["delivered", "delivered", true, "https://shiprocket.co/tracking/AWB123"]);
  eq(order.timeline.at(-1).status, "delivered", "timeline");
});

await test("sync when Shiprocket has no scans yet (track_status 0) keeps the status", async () => {
  const r = await place({ qty: 1 });
  await confirmOrderAndNotify(r.orderId, "pay_ship2");
  await Order.updateOne({ _id: r.orderId }, { "delivery.awbCode": "AWB456", "delivery.shipmentId": "S2", "delivery.status": "pickup_requested" });
  shiprocketTrack = { tracking_data: { track_status: 0, shipment_status: 0, error: "no activities found" } };
  const order = await syncOrderTracking(r.orderId);
  eq([order.delivery.status, order.status], ["pickup_requested", "confirmed"]);
});

await test("customer tracking: owner gets stored data in widget shape; other users get 403", async () => {
  const t = await trackShipmentService(shipped.orderId, user._id);
  eq([t.awbCode, t.currentStatus, t.currentStatusText, t.isPendingPickup, t.scans.length > 0], ["AWB123", "delivered", "Delivered", false, true]);
  try { await trackShipmentService(shipped.orderId, otherUser._id); throw new Error("did not throw"); } catch (e) { eq(e.status, 403); }
});

console.log("\nSearch and admin auth");

await test("catalog search matches name/colour words and treats regex characters literally", async () => {
  const run = (search) => getAllProductsQuery({ filter: { isActive: true }, skip: 0, limit: 10, sortOption: { createdAt: -1 }, sort: "newest", search });
  eq((await run("blue e2e")).total, 1, "'blue e2e'");
  eq((await run("red")).total, 0, "'red'");
  eq((await run("(kurti*")).total, 0, "'(kurti*' (no regex error)");
});

await test("isAdmin rejects a validly-signed token for an admin that no longer exists", async () => {
  const admin = await Admin.create({ name: "A", email: "a@example.com", password: "x" });
  const token = generateAccessToken(admin);
  const run = async () => { let status = 200, nextCalled = false; await isAdmin({ headers: { authorization: `Bearer ${token}` } }, { status: (s) => { status = s; return { send: () => {} }; } }, () => { nextCalled = true; }); return nextCalled ? "next" : status; };
  eq(await run(), "next", "existing admin");
  await Admin.deleteOne({ _id: admin._id });
  eq(await run(), 401, "deleted admin");
});

console.log("\nCategories and event bar");

const { ensureDefaultCategories } = await import("../Modules/Category/defaultCategories.js");
const categoryService = await import("../Modules/Category/Service/categoryService.js");
const announcementService = await import("../Modules/Announcement/Service/announcementService.js");

let suits;
await test("default categories are seeded once; a new category gets a slug, upper-case badge and sorts first", async () => {
  await ensureDefaultCategories();
  await ensureDefaultCategories();
  eq((await categoryService.getAllCategoriesService()).length, 5, "seeded once");
  suits = await categoryService.createCategoryService({ label: " Suits ", tagline: "Festive elegance", badge: "diwali", order: "0", showOnHome: "true" });
  eq([suits.name, suits.label, suits.slug, suits.badge, suits.isActive], ["Suits", "Suits", "suits", "DIWALI", true]);
  eq((await categoryService.getActiveCategoriesService()).map((c) => c.slug).slice(0, 2), ["suits", "short-kurtis"]);
  await expectStatus(categoryService.createCategoryService({ label: "suits" }), 409);
  await expectStatus(categoryService.createCategoryService({ label: "Short Kurtis" }), 409);
  await expectStatus(categoryService.createCategoryService({ label: "   " }), 400);
});

await test("editing a category keeps name + slug (product links and URLs); hidden categories leave the storefront list", async () => {
  const updated = await categoryService.updateCategoryService(String(suits._id), { label: "Festive Suits", isActive: "false" });
  eq([updated.name, updated.slug, updated.label, updated.isActive], ["Suits", "suits", "Festive Suits", false]);
  eq((await categoryService.getActiveCategoriesService()).some((c) => c.slug === "suits"), false);
  await categoryService.updateCategoryService(String(suits._id), { isActive: "true" });
});

await test("a category with products can't be deleted (409); an empty one can; product counts are reported", async () => {
  await Product.create({ name: "E2E Anarkali Suit", category: "Suits", basePrice: 2500 });
  eq((await categoryService.getAllCategoriesService()).find((c) => c.slug === "suits").productCount, 1);
  await expectStatus(categoryService.deleteCategoryService(String(suits._id)), 409);
  const empty = await categoryService.createCategoryService({ label: "Lehengas" });
  await categoryService.deleteCategoryService(String(empty._id));
  eq(await Category.exists({ _id: empty._id }), null);
});

await test("event bar: unsafe links, bad colours and reversed dates are rejected", async () => {
  await expectStatus(announcementService.createAnnouncementService({ message: "x", link: "javascript:alert(1)" }), 400);
  await expectStatus(announcementService.createAnnouncementService({ message: "x", link: "http://insecure.example" }), 400);
  await expectStatus(announcementService.createAnnouncementService({ message: "x", backgroundColor: "red" }), 400);
  await expectStatus(announcementService.createAnnouncementService({ message: "x", startsAt: "2026-11-02", endsAt: "2026-11-01" }), 400);
  await expectStatus(announcementService.createAnnouncementService({ message: "  " }), 400);
});

await test("event bar: only turned-on bars inside their schedule are live; turning one off hides it", async () => {
  const day = 864e5, now = Date.now();
  const live = await announcementService.createAnnouncementService({ message: "Diwali Special", link: "/categories/suits", linkText: "Shop now", endsAt: new Date(now + 7 * day) });
  await announcementService.createAnnouncementService({ message: "Scheduled", startsAt: new Date(now + day) });
  await announcementService.createAnnouncementService({ message: "Ended", endsAt: new Date(now - day) });
  await announcementService.createAnnouncementService({ message: "Hidden", isActive: false });
  eq((await announcementService.getLiveAnnouncementsService()).map((a) => a.message), ["Diwali Special"]);
  await announcementService.updateAnnouncementService(String(live._id), { isActive: false });
  eq((await announcementService.getLiveAnnouncementsService()).length, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
await mongoose.connection.db.dropDatabase();
await mongoose.disconnect();
process.exit(failed ? 1 : 0);
