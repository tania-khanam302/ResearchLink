import express from "express";
import {
  downloadFiles,
  getAvailableSupervisors,
  getDashboardStats,
  getFeedback,
  getStudentProject,
  getSupervisor,
  requestSupervisor,
  submitProposal,
  uploadFiles,
  deleteFile,
  addResourceLink,
  deleteResourceLink,

} from "../controllers/studentController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
import { handleUploadError, upload } from "../middlewares/upload.js";
const router = express.Router();



// student project routes
router.get(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject,
);

// proposal
router.post(
  "/project-proposal",
  isAuthenticated,
  isAuthorized("Student"),
  submitProposal,
);

// upload files
router.post(
  "/upload/:workId",
  isAuthenticated,
  isAuthorized("Student"),
  upload.array("files", 10),
  handleUploadError,
  uploadFiles,
);

// fetch supervisors
router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors,
);

// get supervisor
router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  getSupervisor,
);

// request-supervisor
router.post(
  "/request-supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  requestSupervisor,
);

// student feedback
router.get(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  getFeedback,
);

// fetch dashboard stats
router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Student"),
  getDashboardStats,
);

// download files
router.get(
  "/download/:workId/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  downloadFiles,
);

// delete
router.delete(
  "/files/:workId/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  deleteFile,
);

router.post(
  "/links/:workId",
  isAuthenticated,
  isAuthorized("Student"),
  addResourceLink,
);

router.delete(
  "/links/:workId/:linkId",
  isAuthenticated,
  isAuthorized("Student"),
  deleteResourceLink,
);

export default router;
