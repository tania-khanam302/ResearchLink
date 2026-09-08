import express from "express";
import {
  createThesis,
  getAllTheses,
  getThesisById,
  getThesisByStudent,
  getThesisBySupervisor,
  updateThesis,
  deleteThesis,
  updateThesisStatus,
  assignSupervisor,
  uploadThesisFiles,
  addThesisFeedback,
  updateThesisDeadline,
  downloadThesisFile,
} from "../controllers/thesisController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
import {
  upload,
  handleUploadError,
} from "../middlewares/upload.js";
const router = express.Router();



// Create Thesis
router.post(
  "/",
  isAuthenticated,
  createThesis
);

// Get All Theses
router.get(
  "/",
  isAuthenticated,
  getAllTheses
);

// Get Thesis By Student
router.get(
  "/student/:studentId",
  isAuthenticated,
  getThesisByStudent
);

// Get Thesis By Supervisor
router.get(
  "/supervisor/:supervisorId",
  isAuthenticated,
  getThesisBySupervisor
);

// Get Thesis By ID
router.get(
  "/:id",
  isAuthenticated,
  getThesisById
);

// Update Thesis
router.put(
  "/:id",
  isAuthenticated,
  updateThesis
);

// Delete Thesis
router.delete(
  "/:id",
  isAuthenticated,
  deleteThesis
);

// Thesis Status
router.put(
  "/:id/status",
  isAuthenticated,
  updateThesisStatus
);

// Assign Supervisor
router.put(
  "/:id/supervisor",
  isAuthenticated,
  assignSupervisor
);

// Upload Thesis Files
router.post(
  "/upload/:thesisId",
  isAuthenticated,
  upload.array("files", 10),
  handleUploadError,
  uploadThesisFiles
);

// Thesis Feedback
router.post(
  "/:id/feedback",
  isAuthenticated,
  addThesisFeedback
);

// Thesis Deadline
router.put(
  "/:id/deadline",
  isAuthenticated,
  updateThesisDeadline
);

// Download Thesis File
router.get(
  "/:thesisId/files/:fileId/download",
  isAuthenticated,
  downloadThesisFile
);


export default router;
