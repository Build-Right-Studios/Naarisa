import { getCouriersService } from "../Service/getCouriersService.js";

export const getCouriers = async (req, res) => {
    try {

        const couriers = await getCouriersService(req.params.orderId);
        console.log(couriers)
        res.json(couriers);

    } catch (err) {

        console.error(err);

        res.status(err.status || 500).json({
            message: err.message
        });

    }
};