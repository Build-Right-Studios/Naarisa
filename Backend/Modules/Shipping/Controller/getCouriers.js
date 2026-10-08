import { getCouriersService } from "../Service/getCouriersService.js";

export const getCouriers = async (req, res) => {
    try {
        const result = await getCouriersService(req.params.orderId, req.body);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({
            message: err.message
        });

    }
};