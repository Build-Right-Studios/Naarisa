import axios from "axios";
import { Order } from "../../../MongoDB/models.js";

const BASE_URL = (process.env.ITHINK_BASE_URL || "https://pre-alpha.ithinklogistics.com/api_v3").replace(/\/$/, "");

export const trackShipmentService = async (orderId, userId) => {
    const order = await Order.findById(orderId);
    if (!order) throw { status: 404, message: "Order not found" };
    if (userId && order.user?.toString() !== userId.toString()) {
        throw { status: 403, message: "Not authorized" };
    }

    const awb = order.delivery?.awbCode?.trim();
    if (!awb) throw { status: 400, message: "Shipment not created yet" };

    const url = `${BASE_URL}/order/track.json`;

    const body = {
        data: {
            awb_number_list: awb,
            access_token: process.env.ITHINK_ACCESS_TOKEN,
            secret_key: process.env.ITHINK_SECRET_KEY
        }
    };

    console.log("TRACK URL:", url, "AWB:", awb);

    let response;
    try {
        response = await axios.post(url, body, {
            headers: { "Content-Type": "application/json" },
            timeout: 20000
        });
    } catch (err) {
        console.error("Track Error:", err.response?.data || err.message);
        throw { status: 500, message: "iThink track failed" };
    }

    console.log("RAW:", JSON.stringify(response.data, null, 2));

    let container = response.data?.data ?? response.data;

    if (!container) {
        throw {
            status: 502,
            message: response.data?.msg || response.data?.message || "Unexpected response from iThink."
        };
    }

    if (Array.isArray(container) && container.length === 0) {
        throw { status: 404, message: `No tracking for AWB ${awb} on ${BASE_URL}` };
    }

    // Try exact AWB match first (this is what production will use)
    let trackInfo = container[awb];

    // Staging/pre-alpha fallback: sandbox always returns dummy data under its own fixed key
    if (!trackInfo && !Array.isArray(container) && typeof container === "object") {
        const firstKey = Object.keys(container)[0];
        trackInfo = firstKey ? container[firstKey] : null;
    }

    if (!trackInfo && Array.isArray(container)) {
        trackInfo = container[0];
    }

    if (!trackInfo) {
        throw { status: 404, message: `No tracking data found for AWB ${awb}` };
    }

    return {
        awbCode: awb,
        courierName: order.delivery.courierName || trackInfo.logistic || "",
        currentStatus: trackInfo.current_status,
        scans: (trackInfo.scan_details || trackInfo.scans || trackInfo.shipment_track || []).map((s) => ({
            date: s.scan_date_time || s.date || "",
            status: s.status || "",
            location: s.scan_location || s.location || "",
            remark: s.remark || ""
        }))
    };
};