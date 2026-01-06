import express from "express";
import WishlistController from "../controllers/wishlistController.js";

const router = express.Router();

// Add item to Wishlist
router.post("/add", WishlistController._populate, WishlistController.addItem)

// Get Wishlist items
router.get("/", WishlistController._populate, WishlistController.getWishlist);

//Remove item from Wishlist 
router.delete("/remove/:productId", WishlistController._populate, WishlistController.removeFromWishlist);

//Get Wishlist itmem count
router.get("/counter", WishlistController._populate, WishlistController.ItemCount);

export default router;