import mongoose from "mongoose";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Products.js";
import Cart from "../models/Cart.js";
import { generateOrderID, runWithTransaction } from "../config/utills.js";

class OrderController {
    // -----------------------------
    // CREATE ORDER (Guest + User)
    // -----------------------------
    createOrder = async (req, res) => {

        try {
            const result = await runWithTransaction(async (session) => {
                const {
                    userData, // for guest: { name, email, phone }
                    items,
                    shippingAddress,
                    shippingMethod,
                    payment
                } = req.body;

                if (!items || items.length === 0) {
                    return res.status(400).json({ isSuccess: false, message: "No items in order" });
                }

                // -----------------------------
                // USER OR GUEST
                // -----------------------------                
                if (!userData || !userData.email) {
                    return res.status(400).json({ isSuccess: false, message: "user details required" });
                }

                let user = await this.createGuestUserIfNotExists(userData, session);

                // -----------------------------
                // PRODUCTS & STOCK
                // -----------------------------
                let orderItems = [];
                const stockRollback = [];
                let subtotal = 0;

                // Validate products & calculate price from DB
                for (const item of items) {
                    const productQuery = Product.findById(item.product);
                    if (session) productQuery.session(session);
                    const product = await productQuery;

                    if (!product || !product.isActive) {
                        throw new Error("Product not available");
                    }

                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name}`);
                    }

                    subtotal += product.price * item.quantity;

                    orderItems.push({
                        product: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity
                    });

                    // Save previous stock for rollback
                    stockRollback.push({
                        productId: product._id,
                        quantity: item.quantity
                    });

                    // Reduce stock
                    product.stock -= item.quantity;
                    if (session) {
                        await product.save({ session });
                    } else {
                        await product.save();
                    }
                }

                // -----------------------------
                // CREATE ORDER
                // -----------------------------
                const shippingFee = shippingMethod?.fee || 0;
                const tax = req.body.tax || 0;
                const discount = req.body.discount || 0;
                const total = subtotal + shippingFee + tax - discount;

                const orderID = generateOrderID();
                if (!orderID) {
                    throw new Error("Order ID generation failed");
                }

                const orderData = {
                    orderID: orderID,
                    user: user._id,
                    isGuestCheckout: req.body.isGuestCheckout,
                    items: orderItems,
                    pricing: { subtotal, shippingFee, tax, discount, total },
                    shippingAddress,
                    additionalInformation: req.body.additionalInformation || "",
                    shippingMethod,
                    payment: {
                        method: payment?.method || "COD",
                        status: payment?.status || "PENDING",
                        transactionID: payment?.transactionID || null
                    },
                    status: "PLACED"
                };

                let order;

                try {
                    if (session) {
                        // Transaction-supported environment
                        [order] = await Order.create([orderData], { session });
                    } else {
                        // No transaction support
                        order = await Order.create(orderData);
                    }

                    // Clear cart after order creation SUCCESS
                    await this.clearCartAfterOrder({
                        userId: user?._id || null,
                        guestCartId: req.body?.guestCartId || null,
                        isGuestCheckout: req.body.isGuestCheckout,
                        session
                    });
                } catch (error) {
                    // 🔁 Manual rollback ONLY if no transaction
                    if (!session && stockRollback?.length) {
                        try {
                            await Promise.all(
                                stockRollback.map(rb =>
                                    Product.findByIdAndUpdate(
                                        rb.productId,
                                        { $inc: { stock: rb.quantity } }
                                    )
                                )
                            );
                        } catch (rollbackError) {
                            console.error("Stock rollback failed:", rollbackError);
                        }
                    }

                    throw error;
                }

                // Send confirmation email
                // await sendOrderConfirmationEmail(user.email, order);

                return order;

            });

            res.status(201).json({
                isSuccess: true,
                message: "Order placed successfully",
                orderID: result.orderID
            });
        } catch (error) {
            console.error("Failed to create order: ", error);
            res.status(500).json({ isSuccess: false, message: error.message });
        }
    };

    // -----------------------------
    // GUEST USER CREATION
    // -----------------------------
    createGuestUserIfNotExists = async ({ firstName, lastName, email, phone }, session) => {
        try {

            if (!email) {
                throw new Error("Email is required for guest user");
            }

            //Check existing user
            let user;
            if (session) {
                user = await Customer.findOne({ email }).session(session);
            } else {
                user = await Customer.findOne({ email });
            }

            if (user) return user;

            const userData = {
                firstName,
                lastName,
                email,
                phone,
                password: "123456",
                isAutoCreated: true,
            };

            if (session) {
                user = await Customer.create([userData], { session });
                user = user[0];
            } else {
                user = await Customer.create(userData);
            }
            //await sendAccountEmail(email, tempPassword); // Send email with temp password
            return user;

        } catch (error) {
            console.error("Guest user creation failed:", error);
            throw new Error("Guest user creation failed");
        }
    }

    // -----------------------------
    // Clears cart after successful order
    // -----------------------------
    clearCartAfterOrder = async ({
        userId,
        guestCartId,
        isGuestCheckout,
        session = null
    }) => {
        const query = isGuestCheckout
            ? { guestCartId }
            : { userId };

        if (session) {
            await Cart.deleteOne(query).session(session);
        } else {
            await Cart.deleteOne(query);
        }
    };

    _populate = async (req, res, next) => {
        try {
            const { orderID } = req.params;
            if (!orderID) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Order ID is required"
                });
            }

            const order = await Order.findOne({ orderID })
                .populate("items.product","image")
                .populate("user","firstName lastName email phone");

            if (!order) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Order not found"
                });
            }
            req.order = order;
            next();
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }

    }
    // -----------------------------
    // FETCH ORDER BY ID
    // -----------------------------
    fetchOrderByID = async (req, res) => {
        try {
            const order = req.order;
            res.json({ isSuccess: true, order });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Failed to fetch order::', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    // -----------------------------
    // FETCH ORDER BY USER
    // -----------------------------
    fetchOrderByUser = async (req, res) => {
        try {
            const { user } = req.params;
            if (!user) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "user ID is required"
                });
            }

            const order = await Order.findOne({ user })
            .select("orderID pricing.total createdAt status");

            if (!order) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Order not found"
                });
            }
            res.json({ isSuccess: true, order });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Failed to fetch order::', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

}

export default new OrderController();