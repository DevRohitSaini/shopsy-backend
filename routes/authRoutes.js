import express from "express";
import AuthController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/check-credentials", AuthController.checkCredentials);
router.post("/reset-password", AuthController.resetPassword);

export default router;