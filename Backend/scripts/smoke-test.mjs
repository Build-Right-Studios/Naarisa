// Post-deploy smoke test for a running backend. Read-only: it only reads public data and
// sends requests that must be rejected (no token / no signature), so it is safe to run
// against production.
//
//   npm run smoke -- https://your-service.onrender.com
const base = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage: npm run smoke -- https://your-backend-url");
  process.exit(1);
}

let passed = 0, failed = 0;
const check = async (name, fn) => {
  const started = Date.now();
  try {
    await fn();
    passed++;
    console.log(`  ✔ ${name} (${Date.now() - started} ms)`);
  } catch (error) {
    failed++;
    console.log(`  ✘ ${name}\n      ${error.message}`);
  }
};
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};
const request = async (path, options = {}) => {
  const res = await fetch(base + path, { ...options, signal: AbortSignal.timeout(60000) });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, headers: res.headers, body };
};
const expectStatus = async (path, status, options) => {
  const res = await request(path, options);
  expect(res.status === status, `${options?.method || "GET"} ${path} → ${res.status}, expected ${status}`);
  return res;
};
const post = (body = {}, headers = {}) => ({ method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });

console.log(`Smoke test: ${base}\n`);

console.log("Public endpoints");
await check("server is up", async () => {
  await expectStatus("/", 200); // the first request can take a while if the service was asleep
});
await check("categories list", async () => {
  const { body } = await expectStatus("/api/category", 200);
  expect(body.success && Array.isArray(body.data) && body.data.length > 0, "expected at least one category");
  expect(body.data.every((c) => c.slug && c.name), "every category needs a slug and name");
});
await check("event bar list", async () => {
  const { body } = await expectStatus("/api/announcement", 200);
  expect(body.success && Array.isArray(body.data), "expected an array");
});
await check("home banners", async () => {
  await expectStatus("/api/banners/get-active-banners", 200);
});
await check("catalog with pagination", async () => {
  const { body } = await expectStatus("/api/product/products?limit=1", 200);
  expect(body.success && body.data?.pagination, "expected pagination");
});
await check("search treats special characters literally", async () => {
  await expectStatus("/api/product/search?q=%28kurti*", 200);
});

console.log("\nProtected endpoints reject outsiders");
await check("admin signup needs an admin token", () => expectStatus("/api/auth/signup", 401, post({})));
await check("admin category list needs a token", () => expectStatus("/api/category/all", 401));
await check("creating a category needs a token", () => expectStatus("/api/category", 401, post({ label: "x" })));
await check("creating an event bar needs a token", () => expectStatus("/api/announcement", 401, post({ message: "x" })));
await check("customer profile needs a token", () => expectStatus("/api/user/profile", 401));
await check("Shiprocket webhook needs its token", () => expectStatus("/api/shipment/tracking/webhook", 401, post({ awb: "1" })));
await check("Razorpay webhook needs a signature", () => expectStatus("/api/payment/razorpay", 400, post({ event: "payment.captured" })));
await check("Razorpay webhook rejects a wrong signature", () =>
  expectStatus("/api/payment/razorpay", 400, post({ event: "payment.captured" }, { "x-razorpay-signature": "0".repeat(64) })));

console.log("\nCORS");
const preflight = (origin) =>
  request("/api/category", { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Method": "GET" } });
await check("storefront origin is allowed", async () => {
  const res = await preflight("https://www.naarisa.com");
  expect(res.headers.get("access-control-allow-origin") === "https://www.naarisa.com", "www.naarisa.com not allowed");
});
await check("admin origin is allowed", async () => {
  const res = await preflight("https://naarisa-admin.vercel.app");
  expect(res.headers.get("access-control-allow-origin") === "https://naarisa-admin.vercel.app", "admin origin not allowed");
});
await check("unknown origins are not allowed", async () => {
  const res = await preflight("https://example.com");
  expect(!res.headers.get("access-control-allow-origin"), "example.com should not be allowed");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
