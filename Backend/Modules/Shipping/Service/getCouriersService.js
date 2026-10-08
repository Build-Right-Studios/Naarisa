import axios from "axios";
import { Order } from "../../../MongoDB/models.js";

export const getCouriersService = async (orderId, { length, breadth, height, weight }) => {
    const order = await Order.findById(orderId);
    if (!order) throw { status: 404, message: "Order not found" };

    const l = Number(length), b = Number(breadth), h = Number(height), w = Number(weight);
    if (!l || !b || !h || !w) {
        throw { status: 400, message: "Valid length, breadth, height and weight are required." };
    }
    if (w > 10) {
        throw { status: 400, message: "iThink rate check supports a maximum of 10 kg." };
    }

    const paymentMethod = order.payment.mode === "Prepaid" ? "Prepaid" : "COD";
    console.log("From Pincode : ", process.env.ITHINK_PICKUP_ADDRESS_ID)

    const body = {
        data: {
            from_pincode: "249408",
            to_pincode: order.address.pincode,
            shipping_length_cms: l,
            shipping_width_cms: b,
            shipping_height_cms: h,
            shipping_weight_kg: w,
            order_type: "forward",
            payment_method: paymentMethod,
            product_mrp: Number(order.pricing.total),
            access_token: process.env.ITHINK_ACCESS_TOKEN,
            secret_key: process.env.ITHINK_SECRET_KEY
        }
    };

    let response;
    try {
        console.log(
            "iThink RATE REQUEST:",
            JSON.stringify(body, null, 2)
        );
        response = await axios.post(
            `${process.env.ITHINK_BASE_URL}/rate/check.json`,
            body,
            { headers: { "Content-Type": "application/json" }, timeout: 30000 }
        );
        console.log(
            "iThink RATE RESPONSE:",
            JSON.stringify(response.data, null, 2)
        );
    } catch (error) {
        console.error("iThink rate error:", error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to fetch courier rates."
        };
    }

    const raw = response.data;
    if (raw?.status !== "success") {
        throw { status: 502, message: raw?.html_message || "iThink rate check failed." };
    }

    const list = Array.isArray(raw.data) ? raw.data : Object.values(raw.data || {});

    const couriers = list
        .filter((c) => c.pickup === "Y" && (paymentMethod === "COD" ? c.cod === "Y" : c.prepaid === "Y"))
        .map((c) => ({
            logistics: c.logistic_name,
            serviceType: c.logistic_service_type || "",
            rate: Number(c.rate),
            zone: c.logistics_zone,
            tat: c.delivery_tat
        }))
        .sort((a, b) => a.rate - b.rate);

    return {
        couriers,
        zone: raw.zone,
        expectedDeliveryDate: raw.expected_delivery_date
    };
};