import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 */
// GET ALL with Pagination /api/categories?page=1&limit=10
router.get("/", async (req, res) => {
  try {
    const { page, limit } = req.query;

    // If no pagination params → return ALL categories
    if (!page && !limit) {
      const categories = await Category.find();
      return res.json({
        data: categories,
        totalItems: categories.length
      });
    }

    // Pagination mode
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [categories, total] = await Promise.all([
      Category.find().skip(skip).limit(limitNum),
      Category.countDocuments()
    ]);

    res.json({
      data: categories,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});



/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
