import express from "express";
import {
  registerUser,
  forgotPassword,
  getUser,
  login,
  logout,
  resetPassword,
  changePassword,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/authController.js";
import multer from "multer";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
// import passport from "passport"; 

const router = express.Router();
const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
  },
});

router.post("/register", registerUser);
router.post("/login", login);
router.get("/me", isAuthenticated, getUser);
router.put("/profile", isAuthenticated, updateProfile);
router.post(
  "/profile/picture",
  isAuthenticated,
  profileUpload.single("profilePicture"),
  uploadProfilePicture,
);
router.get("/logout", isAuthenticated, logout);
router.post("/password/forgot-password", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/change", isAuthenticated, changePassword);


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
