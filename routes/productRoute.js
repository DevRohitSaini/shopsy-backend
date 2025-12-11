import express from "express";
import Product from "../models/Products.js";
import Category from "../models/Category.js";

const router = express.Router();

/**
 * @route   GET /api/products/search
 * @desc    Get search filter by name or category
 */

router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Please provide a search keyword" });
    }

    const regex = new RegExp(keyword, "i"); // case-insensitive match

    // 1️⃣ Search Products first (name match OR category name match)
    const products = await Product.find()
      .populate("category")
      .then((items) =>
        items.filter(
          (item) =>
            regex.test(item.name) ||
            (item.category && regex.test(item.category.name))
        )
      );

    // 2️⃣ If products found → return products
    if (products.length > 0) {
      return res.json({
        type: "product",
        count: products.length,
        data: products,
      });
    }

    // 3️⃣ If NO products → Search Categories
    const categories = await Category.find({
      name: { $regex: regex }
    });

    if (categories.length > 0) {
      return res.json({
        type: "category",
        count: categories.length,
        data: categories,
      });
    }

    // 4️⃣ Nothing found
    return res.status(404).json({
      message: "No matching product or category found",
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/products
 * @desc    Get all products
 */
// GET ALL with Pagination /api/products?page=1&limit=10
router.get("/", async (req, res) => {
  try {
    const { page, limit } = req.query;

    // If no pagination params → return ALL products
    if (!page && !limit) {
      const products = await Product.find().populate("category");
      return res.json({
        data: products,
        totalItems: products.length
      });
    }

    // Pagination mode
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find()
        .populate("category")
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments()
    ]);

    res.json({
      data: products,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});



/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
