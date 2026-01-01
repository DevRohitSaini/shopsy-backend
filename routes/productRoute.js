import express from "express";
import productController from "../controllers/productController.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/search", productController.search);

router.route("/")
  .post(authenticate, productController.create)
  .get(productController.fetchAll);

router.route("/:id")
  .get(productController._populate, productController.fetchById)
  .put(authenticate, productController._populate, productController.update)
  .delete(authenticate, productController.delete);

router.get("/category/:slug", productController.fatchByCatSlug);

export default router;
