import axios from "axios";
import { Order } from "../../../MongoDB/models.js";
import { getShiprocketToken } from "../../../config/shiprocket.js";

export const getCouriersService = async (orderId) => {

    const order = await Order.findById(orderId);

    if (!order)
        throw {
            status:404,
            message:"Order not found"
        };

    const token = await getShiprocketToken();

    const response = await axios.get(

        `${process.env.SHIPROCKET_BASE_URL}/courier/serviceability`,

        {

            headers:{
                Authorization:`Bearer ${token}`
            },

            params:{

                pickup_postcode:249404,

                delivery_postcode:order.address.pincode,

                weight:0.7,

                cod:order.payment.status==="paid" ? 0 : 1,

                order_id:order.delivery.shiprocketOrderId

            }

        }

    );

    return response.data.data.available_courier_companies;

};