import Wishlist from "../models/wishlist.js";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

class WishlistController {

    _populate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return next();

            const token = authHeader.split(" ")[1];
            if (!token) return next();

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded?._id) {
                req.customer = await Customer.findById(decoded._id);
            }

            next(); // ✔ only once

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    };

    addItem = async (req, res) => {
        try {
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({ isSuccess: false, message: "Product missing" });
            }

            const filter = req.customer?._id
                ? { userId: req.customer._id }
                : { guestId: req.headers["guest-cart-id"] };

            let wishlist = await Wishlist.findOne(filter);

            if (!wishlist) {
                wishlist = await Wishlist.create({
                    userId: req.customer?._id || null,
                    guestId: req.headers["guest-cart-id"] || null,
                    products: [{ productId }]
                });
            } else {
                const exists = wishlist.products.some(
                    p => p.productId.toString() === productId
                );

                if (exists) {
                    return res.json({
                        isSuccess: false,
                        message: "Item already in wishlist"
                    });
                }

                wishlist.products.push({ productId }); // ✅ FIX
                await wishlist.save();
            }

            res.json({
                isSuccess: true,
                message: "Item added to wishlist",
                itemCount: wishlist.products.length,
                data: wishlist
            });

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    getWishlist = async (req, res) => {
        try {
            const filter = req.customer?._id
                ? { userId: req.customer._id }
                : { guestId: req.headers["guest-cart-id"] };

            const wishlist = await Wishlist.findOne(filter).populate(
                "products.productId",
                "name price image"
            );

            if (!wishlist) {
                return res.json({ data: [] });
            }

            res.json({
                isSuccess: true,
                itemCount: wishlist.products.length,
                data: wishlist
            });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }

    }

    removeFromWishlist = async (req, res) => {
        try {
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ isSuccess: false, message: "Product ID missing" });
            }

            const filter = req.customer?._id
                ? { userId: req.customer._id }
                : { guestId: req.headers["guest-cart-id"] };

            let wishlist = await Wishlist.findOne(filter);

            if (!wishlist) {
                return res.status(404).json({ isSuccess: false, message: "Wishlist not found" });
            }

            wishlist.products = wishlist.products.filter(
                i => i.productId.toString() !== productId
            );

            await wishlist.save();

            res.json({
                success: true,
                message: "Item removed",
                itemCount: wishlist.products.length,
                data: wishlist
            });

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    ItemCount = async (req, res) => {
        try {
            const filter = req.customer?._id
                ? { userId: req.customer._id }
                : { guestId: req.headers["guest-cart-id"] };

            let wishlist = await Wishlist.findOne(filter);

            if (!wishlist) {
                return res.json({ data: [] });
            }

            res.json({
                isSuccess: true,
                itemCount: wishlist.products.length,
            });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

}
export default new WishlistController();
