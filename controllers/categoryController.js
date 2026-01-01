import Category from "../models/Category.js";

class categoryController {
    /**
     * @route   GET /api/categories?page=1&limit=10
     * @desc    Get all categories
     */
    search = async (req, res) => {
        try {
            const { page, limit } = req.query;

            // If no pagination params → return ALL categories
            if (!page && !limit) {
                const categories = await Category.find();
                return res.json({
                    isSuccess: true,                    
                    totalItems: categories.length,
                    data: categories
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
                isSuccess: true,
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,                
                data: categories
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

    create = async (req, res) => {
        let newCategory = new Category(req.body);
        try {
            const category = await newCategory.save();
            res.status(201).json({
                isSuccess: true,
                data: category
            });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: err.message });
            }
        }
    }

    /**
     * @route   GET /api/categories/:id
     * @desc    Get single category by ID
     */

    _populate = async (req, res, next) => {
        // This is middleware to populate customer from ID parameter
        if (req.params.id && req.params.id != 'newcategory') {
            const {
                id,
            } = req.params;

            try {
                const category = await Category.findById(id).exec();

                if (!category) {
                    return res.status(404).json({ isSuccess: false, message: "Category not found" });
                }
                req.category = category;
                next();
            } catch (err) {
                if (err.status) {
                    res.status(err.status).json({ isSuccess: false, message: err.message });
                } else {
                    console.error('Error:', err);
                    res.status(500).json({ isSuccess: false, message: 'Internal server error' });
                }
            }
        } else {
            res.status(500).json({ isSuccess: false, message: 'ID not found' });
        }
    }

    fetchById = async (req, res) => {
        try {
            const category = req.category;
            res.json({ isSuccess: true, data: category });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    update = async (req, res) => {
        let category = req.body;
        let updatedCategory = Object.assign(req.category, category);
        try {
            const savedCategory = await updatedCategory.save();

            res.status(200).json({
                isSuccess: true,
                data: savedCategory
            });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: err.message });
            }
        }
    }

    delete = async (req, res) => {
        try {
            const deleted = await Category.findByIdAndDelete(req.params.id);

            if (!deleted)
                return res.status(404).json({ isSuccess: false, message: "Category not found" });

            res.json({ isSuccess: true, message: "Category deleted successfully" });

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
export default new categoryController();