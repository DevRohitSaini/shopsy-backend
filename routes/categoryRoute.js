import express from "express";
import authenticate from "../middlewares/authenticate.js";
import categoryController from "../controllers/categoryController.js";

const router = express.Router();

router.route('/')
    .post(authenticate, categoryController.create)
    .get(categoryController.search);

router.route('/:id')
    .get(categoryController._populate, categoryController.fetchById)
    .put(authenticate, categoryController._populate, categoryController.update)
    .delete(authenticate, categoryController.delete);

export default router;
