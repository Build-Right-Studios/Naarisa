import { assignCourierService } from "../Service/assignCourierService.js"

export const assignCourier = async (req,res)=>{

    try{

        const data = await assignCourierService(

            req.params.orderId,

            req.body.courierId

        );

        res.json(data);

    }

    catch(err){

        console.error(err);

        res.status(err.status||500).json({

            message:err.message

        });

    }

};