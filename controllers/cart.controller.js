import Cart from "../models/Cart.js";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

class CartController {

    _populate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) return next();

            const token = authHeader.split(" ")[1];
            if (!token) return next();

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded?.id) {
                req.customer = await Customer.findById(decoded.id).select("-password");
            }

            next(); // ✔ only once

        } catch (err) {
            console.log("error:=>", err);
            return res.status(401).json({ message: "Token invalid or expired" });
        }
    };

    addItem = async (req, res) => {
        try {
            const { productId, quantity } = req.body;

            let cart;

            // Logged-in user
            if (req.customer && req.customer._id) {
                cart = await Cart.findOne({ userId: req.customer._id });
            }
            // Guest User
            else if (req.headers["guest-cart-id"]) {
                cart = await Cart.findOne({ guestCartId: req.headers["guest-cart-id"] });
            }
            else {
                return res.status(400).json({ message: "User or Guest Cart missing" });
            }

            // If cart not exists create new one
            if (!cart) {
                cart = await Cart.create({
                    userId: req.user?._id || null,
                    guestCartId: req.headers["guest-cart-id"] || null,
                    items: []
                });
            }

            // Check if product already exists
            const existingItem = cart.items.find(
                i => i.productId.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += Number(quantity);
            } else {
                cart.items.push({
                    productId,
                    quantity
                });
            }

            await cart.save();

            const populatedCart = await Cart.findById(cart._id).populate(
                "items.productId",
                "name price image"
            );

            const prices = populatedCart.items.map(item =>
                (item.productId?.price || 0) * item.quantity
            );

            // FIX: numeric reducer
            const getCartTotal = prices.reduce((acc, val) => acc + Number(val), 0);

            res.json({
                isSuccess: true,
                message: "Item added to cart",
                subtotal: getCartTotal,
                itemCount: populatedCart.items.length,
                data: populatedCart
            });

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    getCart = async (req, res) => {
        try {
            let cart;

            if (req.customer && req.customer._id) {
                cart = await Cart.findOne({ userId: req.customer._id }).populate(
                    "items.productId",
                    "name price image"
                );
            } else if (req.headers["guest-cart-id"]) {
                cart = await Cart.findOne({ guestCartId: req.headers["guest-cart-id"] }).populate(
                    "items.productId",
                    "name price image"
                );
            }

            if (!cart) {
                return res.json({ items: [], total: 0 });
            }

            const prices = cart.items.map(item =>
                (item.productId?.price || 0) * item.quantity
            );

            // FIX: numeric reducer
            const getCartTotal = prices.reduce((acc, val) => acc + Number(val), 0);

            res.json({
                isSuccess: true,
                subtotal: getCartTotal,
                itemCount: cart.items.length,
                data: cart
            });


        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    updateCart = async (req, res) => {
        try {
            const { productId, quantity } = req.body;

            let cart;

            if (req.customer) cart = await Cart.findOne({ userId: req.customer._id });
            else cart = await Cart.findOne({ guestCartId: req.headers["guest-cart-id"] });

            if (!cart) return res.json({ message: "Cart not found" });

            const item = cart.items.find(
                i => i.productId.toString() === productId
            );

            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    cart.items = cart.items.filter(
                        i => i.productId.toString() !== productId
                    );
                }
            }

            await cart.save();

            const populatedCart = await Cart.findById(cart._id).populate(
                "items.productId",
                "name price image"
            );

            const prices = populatedCart.items.map(item =>
                (item.productId?.price || 0) * item.quantity
            );

            // FIX: numeric reducer
            const getCartTotal = prices.reduce((acc, val) => acc + Number(val), 0);

            res.json({
                isSuccess: true,
                message: "Cart updated",
                subtotal: getCartTotal,
                itemCount: populatedCart.items.length,
                data: populatedCart
            });

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    removeItem = async (req, res) => {
        try {
            const { productId } = req.body;

            let cart;

            if (req.customer) cart = await Cart.findOne({ userId: req.customer._id });
            else cart = await Cart.findOne({ guestCartId: req.headers["guest-cart-id"] });

            if (!cart) return res.json({ message: "Cart not found" });

            cart.items = cart.items.filter(
                i => i.productId.toString() !== productId
            );

            await cart.save();

             const populatedCart = await Cart.findById(cart._id).populate(
                "items.productId",
                "name price image"
            );

            const prices = populatedCart.items.map(item =>
                (item.productId?.price || 0) * item.quantity
            );

            // FIX: numeric reducer
            const getCartTotal = prices.reduce((acc, val) => acc + Number(val), 0);

            res.json({
                isSuccess: true,
                message: "Item removed",
                subtotal: getCartTotal,
                itemCount: populatedCart.items.length,
                data: populatedCart
            });

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

}
export default new CartController();
