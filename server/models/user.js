import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
      trim: true,
      maxlength: [30, "Name Cannot Exceed 30 Characters"],
    },

    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please Use a Valid Email Address"],
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      minlength: [8, "Password must be at least 8 Characters long"],
    },
    role: {
      type: String,
      default: "Student",
      enum: ["Student", "Instructor", "Teacher", "Admin","Co-Admin"], //Instruction change to Instructor ..
    },
    // resetePasswordToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    department: {
      type: String,
      trim: true,
      default: "null",
    },
    expertise: {
      type: [String],
      default: [],
    },
    maxStudents: {
      type: Number,
      default: 10,
      min: [1, "Max Students must be at least 1"],
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.hasCapacity = async function () {
  if(this.role !== "Teacher") return  false ;
  return this.assignedStudents.length<this.maxStudents;}

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 minutes

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
