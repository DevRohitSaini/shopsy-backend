// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
        orderID: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },
        isGuestCheckout: {
            type: Boolean,
            default: false
        },
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: String, // snapshot
            price: Number, // snapshot
            quantity: {
                type: Number,
                required: true
            }
        }],
        pricing: {
            subtotal: Number,
            shippingFee: Number,
            tax: Number,
            discount: Number,
            total: Number
        },
        shippingAddress: {
            fullName: String,
            phone: String,
            houseNumber: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            postcode: String,
            country: {
                type: String,
                default: "India"
            }
        },
        additionalInformation: {
            type: String
        },
        shippingMethod: {
            code: {
                type: String,
                default: "standard"
            },  // "standard", "express"
            label: String,
            estimatedDays: Number,
            fee: Number
        },
        payment: {
            method: {
                type: String,
                default: "COD"
            },// "COD", "UPI", "CARD"
            status: {
                type: String,
                enum: ["PENDING", "PAID", "FAILED" ],
                default: "PENDING"
            },
            transactionID: String
        },
        status: {
            type: String,
            enum: ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED" ],
            default: "PLACED"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);