import express from "express";
import AuthController from "../controllers/auth.controller.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Google OAuth entry
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// Google callback
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const redirectURL = `${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`;
    res.redirect(redirectURL);
  }
);

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/check-credentials", AuthController.checkCredentials);
router.post("/reset-password", AuthController.resetPassword);

export default router;