import axios from "axios";

export const checkCodServiceabilityService = async (pincode) => {
  if (!/^\d{6}$/.test(pincode)) {
    throw { status: 400, message: "Invalid pincode" };
  }

  try {
    const response = await axios.post(
      `${process.env.ITHINK_BASE_URL}/pincode/check.json`,
      {
        data: {
          pincode,
          access_token: process.env.ITHINK_ACCESS_TOKEN,
          secret_key: process.env.ITHINK_SECRET_KEY,
        },
      },
      {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        timeout: 15000,
      }
    );

    // TEMP — remove once this is confirmed working end-to-end
    console.log("iThink Pincode Raw Response:", JSON.stringify(response.data));

    const payload = response.data?.data;

    if (!payload || typeof payload !== "object") {
      return { serviceable: false, codAvailable: false, prepaidAvailable: false };
    }

    // Shape B (v3 — confirmed your account's format):
    // { "<pincode>": { "<courier>": { cod: "Y"/"N", prepaid: "Y"/"N", ... }, ... } }
    const pincodeEntry = payload[pincode];
    if (pincodeEntry && typeof pincodeEntry === "object" && !Array.isArray(pincodeEntry)) {
      const couriers = Object.values(pincodeEntry);
      if (couriers.length === 0) {
        return { serviceable: false, codAvailable: false, prepaidAvailable: false };
      }
      const codAvailable = couriers.some((c) => c.cod === "Y");
      const prepaidAvailable = couriers.some((c) => c.prepaid === "Y");
      return { serviceable: true, codAvailable, prepaidAvailable };
    }

    // Shape A (v1 — kept as a fallback only): { delivery_codes: [ { postal_code: {...} } ] }
    if (Array.isArray(payload.delivery_codes) && payload.delivery_codes.length > 0) {
      const codes = payload.delivery_codes;
      const codAvailable = codes.some((c) => c.postal_code?.cod === "Y");
      const prepaidAvailable = codes.some((c) => c.postal_code?.pre_paid === "Y");
      return { serviceable: true, codAvailable, prepaidAvailable };
    }

    console.warn("iThink Pincode Check: unrecognized response shape for", pincode);
    return { serviceable: false, codAvailable: false, prepaidAvailable: false };

  } catch (error) {
    console.error("iThink Pincode Check Error:", error.response?.data || error.message);
    return { serviceable: true, codAvailable: false, prepaidAvailable: true, checkFailed: true };
  }
};