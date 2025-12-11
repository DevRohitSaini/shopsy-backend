import express from "express";
import CartController from "../controllers/cart.controller.js";

const router = express.Router();

// Add item to cart
router.post("/add", CartController._populate, CartController.addItem);

// Get cart items
router.get("/", CartController._populate, CartController.getCart);

// Update cart item quantity
router.put("/update",CartController._populate, CartController.updateCart);

// Remove item from cart 
router.delete("/remove", CartController._populate, CartController.removeItem);

export default router;