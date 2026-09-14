import axios from "axios";
import { Order } from "../../../MongoDB/models.js";

export const createShipmentService = async (
    orderId,
    length,
    breadth,
    height,
    weight
) => {
    // 1. Find Order
    const order = await Order.findById(orderId);
    if (!order) {
        throw {
            status: 404,
            message: "Order not found"
        };
    }

    // 2. Prevent Duplicate Shipment
    if (order.delivery?.shipmentId) {
        throw {
            status: 400,
            message: "Shipment already created."
        };
    }

    // 3. Validate Package Details
    const packageLength = Number(length);
    const packageBreadth = Number(breadth);
    const packageHeight = Number(height);
    const packageWeight = Number(weight);

    if (
        !packageLength ||
        !packageBreadth ||
        !packageHeight ||
        !packageWeight
    ) {
        throw {
            status: 400,
            message: "Valid package length, breadth, height and weight are required."
        };
    }

    // 4. Payment Details
    const isPaid = order.payment.status === "paid";
    const paymentMode = isPaid ? "Prepaid" : "COD";
    const totalAmount = Number(order.pricing.total);
    const advanceAmount = isPaid ? totalAmount : 0;
    const codAmount = isPaid ? 0 : totalAmount;

    // 5. Create iThink Products
    const products = order.items.map((item) => ({
        product_name: item.productName,
        product_sku: item.variant ? item.variant.toString() : "",
        product_quantity: Number(item.quantity),
        product_price: Number(item.priceAtOrder),
        // Your current Order schema does not store discount per individual item.
        product_discount: 0,
        // Your current schema also does not contain tax / HSN information.
        // These can be added later if required.
        product_img_url: item.image || ""
    }));

    // 6. Create iThink Shipment Payload
    const shipment = {
        // Order
        waybill: "",
        order: order.customOrderId,
        sub_order: "",
        order_date: formatOrderDate(order.createdAt),
        total_amount: totalAmount,

        // Shipping Customer
        name: order.address.name,
        company_name: "",
        add: order.address.line1,
        add2: order.address.line2 || "",
        add3: "",
        pin: order.address.pincode,
        city: order.address.city,
        state: order.address.state,
        country: order.address.country,
        phone: order.address.phone,
        alt_phone: "",
        email: order.address.email || "",

        // Billing
        is_billing_same_as_shipping: "yes",
        billing_name: order.address.name,
        billing_company_name: "",
        billing_add: order.address.line1,
        billing_add2: order.address.line2 || "",
        billing_add3: "",
        billing_pin: order.address.pincode,
        billing_city: order.address.city,
        billing_state: order.address.state,
        billing_country: order.address.country,
        billing_phone: order.address.phone,
        billing_alt_phone: "",
        billing_email: order.address.email || "",

        // Products
        products,

        // Package
        shipment_length: packageLength,
        shipment_width: packageBreadth,
        shipment_height: packageHeight,
        weight: packageWeight,

        // Charges
        shipping_charges: Number(order.pricing.shippingCharge || 0),
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: Number(order.pricing.discount || 0),
        first_attemp_discount: 0,
        cod_charges: 0,

        // Payment
        advance_amount: advanceAmount,
        cod_amount: codAmount,
        payment_mode: paymentMode,

        // Optional Fields
        reseller_name: "",
        eway_bill_number: "",
        gst_number: "",
        what3words: "",

        // iThink Address
        return_address_id: Number(process.env.ITHINK_RETURN_ADDRESS_ID)
    };

    // 7. Complete iThink Request
    const body = {
        data: {
            shipments: [shipment],
            pickup_address_id: Number(process.env.ITHINK_PICKUP_ADDRESS_ID),
            access_token: process.env.ITHINK_ACCESS_TOKEN,
            secret_key: process.env.ITHINK_SECRET_KEY
        }
    };

    // Optional courier configuration.
    // If ITHINK_LOGISTICS is present in .env, it will be sent to iThink.
    // If it is not present, iThink can handle courier selection according to your account.
    if (process.env.ITHINK_LOGISTICS) {
        body.data.logistics = process.env.ITHINK_LOGISTICS;
    }
    if (process.env.ITHINK_S_TYPE) {
        body.data.s_type = process.env.ITHINK_S_TYPE;
    }

    // 8. Call iThink Logistics
    let response;
    try {
        response = await axios.post(
            `${process.env.ITHINK_BASE_URL}/order/add.json`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache"
                },
                timeout: 30000
            }
        );
    } catch (error) {
        console.error("iThink API Error:", error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message:
                error.response?.data?.html_message ||
                error.response?.data?.message ||
                "Failed to create shipment with iThink Logistics."
        };
    }

    // 9. Process iThink Response
    const data = response.data;
    console.log("iThink Create Shipment Response:", JSON.stringify(data, null, 2));

    /*
        iThink returns shipment results like:
        data: {
            "1": {
                status: "Success",
                remark: "",
                waybill: "1369010531020",
                refnum: "GK0034",
                logistic_name: "delhivery",
                tracking_url: "..."
            }
        }
    */
    const shipmentResponse = data?.data?.["1"];

    if (!shipmentResponse) {
        throw {
            status: 502,
            message: data?.html_message || "Invalid response received from iThink Logistics."
        };
    }

    if (shipmentResponse.status && shipmentResponse.status.toLowerCase() !== "success") {
        throw {
            status: 400,
            message: shipmentResponse.remark || "iThink Logistics rejected the shipment."
        };
    }

    // 10. Save Shipment Information
    order.delivery.provider = "ithink";
    order.delivery.shipmentId = shipmentResponse.refnum || order.customOrderId;
    order.delivery.providerOrderId = shipmentResponse.refnum || order.customOrderId;
    order.delivery.awbCode = shipmentResponse.waybill || "";
    order.delivery.trackingNumber = shipmentResponse.waybill || "";
    order.delivery.trackingUrl = shipmentResponse.tracking_url || "";
    order.delivery.courierName = shipmentResponse.logistic_name || "";
    order.delivery.status = "shipment_created";
    order.delivery.pickupLocation = process.env.ITHINK_PICKUP_ADDRESS_ID;

    // 11. Save Package Details
    order.delivery.package = {
        length: packageLength,
        breadth: packageBreadth,
        height: packageHeight,
        weight: packageWeight
    };

    // 12. Status History
    order.delivery.statusHistory.push({
        status: "shipment_created",
        message: "Shipment created successfully with iThink Logistics.",
        timestamp: new Date()
    });

    // 13. Save Order
    await order.save();

    // 14. Return
    return {
        provider: "ithink",
        shipmentId: order.delivery.shipmentId,
        providerOrderId: order.delivery.providerOrderId,
        awbCode: order.delivery.awbCode,
        courierName: order.delivery.courierName,
        trackingUrl: order.delivery.trackingUrl,
        package: order.delivery.package,
        rawResponse: shipmentResponse
    };
};

// Helper
const formatOrderDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};