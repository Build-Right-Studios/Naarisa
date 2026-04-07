import mongoose from "mongoose";

export const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        required: true
    }
}, { _id: false });