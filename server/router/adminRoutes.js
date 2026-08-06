import express from "express";
import {
  createStudent,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  getAllUsers,
  updateStudent,
  updateTeacher,
  createCoAdmin,
  updateCoAdmin,
  deleteCoAdmin,
} from "../controllers/adminController.js";
import multer from "multer";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// create student
router.post(
  "/create-student",
  isAuthenticated,
  isAuthorized("Admin", "Co-Admin"),
  createStudent
);

// update student
router.put(
  "/update-student/:id",
  isAuthenticated,
  isAuthorized("Admin", "Co-Admin"),
  updateStudent
);

// delete student
router.delete(
  "/delete-student/:id",
  isAuthenticated,
  isAuthorized("Admin", "Co-Admin"),
  deleteStudent
);

// create-teacher
router.post(
  "/create-teacher",
  isAuthenticated,
  isAuthorized("Admin", "Co-Admin"),
  createTeacher,
);

// update-teacher
router.put(
  "/update-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin" , "Co-Admin"),
  updateTeacher,
);

// delete-teacher
router.delete(
  "/delete-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin", "Co-Admin"),
  deleteTeacher,
);

// create coadmin
router.post(
  "/create-coadmin",
  isAuthenticated,
  isAuthorized("Admin"),
  createCoAdmin
);

// update coadmin
router.put(
  "/update-coadmin/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateCoAdmin
);

// delete coadmin
router.delete(
  "/delete-coadmin/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteCoAdmin
);

// get users
router.get(
  "/users",
  isAuthenticated,
  isAuthorized("Admin", "Co-Admin"),
  getAllUsers
);

export default router;
