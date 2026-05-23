import express from "express";
import {
  registerUser,
  forgotPassword,
  getUser,
  login,
  logout,
  resetPassword,
} from "../controllers/authController.js";
import multer from "multer";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
// import passport from "passport"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/me", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);
router.post("/password/forgot-password", forgotPassword);
router.put("/password/reset/:token", resetPassword);


// Google Login ===========
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const token = generateJWT(req.user);

//     res.redirect(`http://localhost:3000/login?token=${token}`);
//   }
// );

export default router;
