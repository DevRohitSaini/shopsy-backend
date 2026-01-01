import Product from "../models/Products.js";
import Category from "../models/Category.js";

class productController {

    /**
     * @route   GET /api/products/search?q=keyword
     * @desc    Get search filter by name or category
     */

    search = async (req, res) => {
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
                    isSuccess: true,
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
                    isSuccess: true,
                    type: "category",
                    count: categories.length,
                    data: categories,
                });
            }

            // 4️⃣ Nothing found
            return res.status(404).json({
                isSuccess: false,
                message: "No matching product or category found",
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

    /**
     * @route   GET /api/products?page=1&limit=10
     * @desc    Get all products
     */

    fetchAll = async (req, res) => {
        try {
            const { page, limit } = req.query;

            // If no pagination params → return ALL products
            if (!page && !limit) {
                const products = await Product.find().populate("category");
                return res.json({
                    totalItems: products.length,
                    data: products                    
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
                isSuccess: true,                
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                data: products
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
        let newProduct = new Product(req.body);
        try {
            const product = await newProduct.save();
            res.status(201).json({
                isSuccess: true,
                data: product
            });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: err.message  });
            }
        }
    }

    /**
     * @route   GET /api/products/:id
     * @desc    Get single product by ID
     */

    _populate = async (req, res, next) => {
        // This is middleware to populate customer from ID parameter
        if (req.params.id && req.params.id != 'newproduct') {
            const {
                id,
            } = req.params;

            try {
                const product = await Product.findById(id).populate("category").exec();

                if (!product) {
                    return res.status(404).json({ isSuccess: false, message: "Product not found" });
                }
                req.product = product;
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
            const product = req.product;
            res.json({ isSuccess: true, data: product });
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
        let product = req.body;
        let updatedProduct = Object.assign(req.product, product);
        try {
            const savedProduct = await updatedProduct.save();

            res.status(200).json({
                isSuccess: true,
                data: savedProduct
            });
        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: err.message  });
            }
        }
    }

    delete = async (req, res) => {
        try {
            const deleted = await Product.findByIdAndDelete(req.params.id);

            if (!deleted)
                return res.status(404).json({ isSuccess: false, message: "Product not found" });

            res.json({ isSuccess: true, message: "Product deleted successfully" });

        } catch (err) {
            if (err.status) {
                res.status(err.status).json({ isSuccess: false, message: err.message });
            } else {
                console.error('Error:', err);
                res.status(500).json({ isSuccess: false, message: 'Internal server error' });
            }
        }
    }

    fatchByCatSlug = async (req, res) => {
        try {
            const { slug } = req.params;            
            const category = await Category.findOne({ slug: slug });

            if (!category) {
                return res.status(404).json({ isSuccess: false, message: "Category not found" });
            }
            
            const products = await Product.find({category: category._id}).populate("category");
            
            res.json({
                isSuccess: true,
                count: products.length,
                data: products
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

export default new productController();