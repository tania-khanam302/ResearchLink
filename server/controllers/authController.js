import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// ================= Register User =================
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return next(new ErrorHandler("please provide all required fields", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }
  user = new User({ name, email, password, role });
  await user.save();
  generateToken(user, 201, "User Registered Successfully", res);
});

// ====================== login =======================
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const user = await User.findOne({ email, role }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password or role", 401)); //401 Unauthorized
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password or role", 401)); //401 Unauthorized
  }
  generateToken(user, 200, "Login Successful", res);
});

// ====================== logout =======================
export const logout = asyncHandler(async (req, res, next) => {
  res
    // .status(200)
    // .cookie("token", "", {
    //   expires: new Date(Date.now()),
    //   httpOnly: true,
    // })
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })

    .json({
      success: true,
      message: "Logged out successfully",
    });
});

// ====================== getUser =======================
export const getUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// ====================== forgotPassword =======================
export const forgotPassword = asyncHandler(async (req, res, next) => {
  // console.log("1 NEXT:", typeof next);

  const user = await User.findOne({ email: req.body.email });

  // console.log("2 NEXT:", typeof next);

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // console.log("3 NEXT:", typeof next);

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  // console.log("4 NEXT:", typeof next);

  try {
    await sendEmail({
      to: user.email,
      subject: "Research Link- 🔐 Password Reset Request",
      message,
    });

    // console.log("5 EMAIL SENT");

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.log("6 EMAIL ERROR:", error);
    return next(new ErrorHandler(error.message || "Cannot send E-mail", 500));
  }
});

// ====================== resetPassword =======================
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler("Invalid or expired password reset token", 400),
    ); //400 Bad Request
  }
  if (!req.body.password || !req.body.confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm password do not match", 400),
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, 200, "Password reset successful", res);
});
