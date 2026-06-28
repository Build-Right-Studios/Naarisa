import axios from "axios";
import { Order } from "../../../MongoDB/models.js";
import { getShiprocketToken } from "../../../config/shiprocket.js";

export const createShipmentService = async (orderId) => {

    const order = await Order.findById(orderId);

    if (!order)
        throw {
            status:404,
            message:"Order not found"
        };

    if(order.delivery.shipmentId){
        throw{
            status:400,
            message:"Shipment already created."
        }
    }

    const token = await getShiprocketToken();

    const body = {

        order_id: order.customOrderId,

        order_date: order.createdAt,

        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,

        billing_customer_name: order.address.name,

        billing_last_name: "",

        billing_address: order.address.line1,

        billing_address_2: order.address.line2,

        billing_city: order.address.city,

        billing_pincode: order.address.pincode,

        billing_state: order.address.state,

        billing_country: order.address.country,

        billing_email: order.address.email,

        billing_phone: order.address.phone,

        shipping_is_billing: true,

        order_items: order.items.map(item=>({

            name:item.productName,

            sku:item.variant.toString(),

            units:item.quantity,

            selling_price:item.priceAtOrder

        })),

        payment_method:
            order.payment.status==="paid"
            ? "Prepaid"
            : "COD",

        shipping_charges:0,

        giftwrap_charges:0,

        transaction_charges:0,

        total_discount:order.pricing.discount,

        sub_total:order.pricing.total,

        length:30,

        breadth:25,

        height:5,

        weight:0.7
    };

    const response = await axios.post(

        `${process.env.SHIPROCKET_BASE_URL}/orders/create/adhoc`,

        body,

        {

            headers:{

                Authorization:`Bearer ${token}`,

                "Content-Type":"application/json"

            }

        }

    );

    const data = response.data;

    order.delivery.shipmentId = data.shipment_id;

    order.delivery.shiprocketOrderId = data.order_id;

    order.delivery.status = "shipment_created";

    order.delivery.pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

    order.delivery.statusHistory.push({

        status:"shipment_created",

        message:"Shipment created successfully.",

        timestamp:new Date()

    });

    await order.save();

    console.log(data)

    return data;

}