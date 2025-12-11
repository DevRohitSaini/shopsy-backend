import express from "express";
// import jwt from "jsonwebtoken";
// import Customer from "../models/Customer.js";
// import Cart from "../models/Cart.js";
import CartController from "../controllers/cart.controller.js";

const router = express.Router();

// Add item to cart
router.post("/add", CartController._populate, CartController.addItem)

// async (req, res) => {
//     try {

//         const authHeader = req.headers.authorization;
//         console.log("authHeader:", authHeader);
//         if (authHeader != undefined) {
//             const token = authHeader.split(" ")[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             if (decoded?.id) {
//                 req.customer = await Customer.findById(decoded.id).select("-password");
//             }
//         }

//         const { productId, quantity } = req.body;

//         let cart;

//         // Logged-in user
//         if (req.customer && req.customer._id) {
//             cart = await Cart.findOne({ userId: req.customer._id });
//         }
//         // Guest User
//         else if (req.headers["guest-cart-id"]) {
//             cart = await Cart.findOne({ guestCartId: req.headers["guest-cart-id"] });
//         }
//         else {
//             return res.status(400).json({ message: "User or Guest Cart missing" });
//         }

//         // If cart not exists create new one
//         if (!cart) {
//             cart = await Cart.create({
//                 userId: req.user?._id || null,
//                 guestCartId: req.headers["guest-cart-id"] || null,
//                 items: []
//             });
//         }

//         // Check if product already exists
//         const existingItem = cart.items.find(
//             i => i.productId.toString() === productId
//         );

//         if (existingItem) {
//             existingItem.quantity += Number(quantity);
//         } else {
//             cart.items.push({
//                 productId,
//                 quantity
//             });
//         }

//         await cart.save();

//         //     const populatedCart = await Cart.findById(cart._id)
//         //         .populate("items.productId", "name price image");

//         //     // Calculate subtotal
//         // let subtotal = 0;
//         // populatedCart.items.forEach(item => {
//         //   if (item.productId?.price) {
//         //     subtotal += item.productId.price * item.quantity;
//         //   }
//         // });

//         res.json({
//             isSuccess: true,
//              isSuccess: true,
//             message: "Item added to cart",
//         });

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: err.message });
//     }
// };

// // Get cart items

router.get("/", CartController._populate, CartController.getCart);

// // Update cart item quantity
router.put("/update", CartController._populate, CartController.updateCart);

// // Remove item from cart 
router.delete("/remove", CartController._populate, CartController.removeItem);

export default router;