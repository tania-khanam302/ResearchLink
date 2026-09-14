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

// ====================== update profile =======================
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { studentId, name, email, contact, gender, department, semester, year, type, expertise } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return next(new ErrorHandler("Name and email are required", 400));
  }

  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
    _id: { $ne: req.user._id },
  });
  if (existingUser) {
    return next(new ErrorHandler("This email is already in use", 400));
  }

  if (studentId?.trim()) {
    const existingStudentId = await User.findOne({
      studentId: studentId.trim(),
      _id: { $ne: req.user._id },
    });
    if (existingStudentId) {
      return next(new ErrorHandler("This Student ID is already in use", 400));
    }
  }

  const updateData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
  };

  if (studentId !== undefined) updateData.studentId = studentId.trim();
  if (contact !== undefined) updateData.contact = contact.trim();
  if (gender !== undefined) updateData.gender = gender.trim();
  if (department !== undefined) updateData.department = department.trim();
  if (semester !== undefined) updateData.semester = semester.trim();
  if (year !== undefined) updateData.year = year.trim();
  if (expertise !== undefined) {
    updateData.expertise = Array.isArray(expertise)
      ? expertise.map((item) => item.trim()).filter(Boolean)
      : expertise.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (type && ["Project", "Thesis"].includes(type)) updateData.type = type;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true },
  ).select("-password -resetPasswordToken -resetPasswordExpire");

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// ====================== upload profile picture =======================
export const uploadProfilePicture = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please select an image", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` },
    { new: true },
  ).select("-password -resetPasswordToken -resetPasswordExpire");

  return res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
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

// ====================== change password =======================
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please provide all password fields", 400));
  }

  if (newPassword.length < 8) {
    return next(new ErrorHandler("New password must be at least 8 characters", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("New passwords do not match", 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  const passwordMatches = await user.comparePassword(currentPassword);

  if (!passwordMatches) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
