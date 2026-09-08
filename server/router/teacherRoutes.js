import express from "express";
import {
  getTeacherDashboardStats,
  acceptRequests,
  getRequests,
  rejectRequests,
  deleteRequest,
  addFeedback,
  markComplete,
  getAssignedStudents,
  downloadFiles,
  getFiles,
  deleteFile,
} from "../controllers/teacherController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
const router = express.Router();



// get teacher dashboard stats
router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherDashboardStats
);

// get requests
router.get(
  "/requests",
  isAuthenticated,
  isAuthorized("Teacher"),
  getRequests
  
);

// accept request
router.put(
  "/requests/:requestId/accept",
  isAuthenticated,
  isAuthorized("Teacher"),
  acceptRequests
  
);

//  reject request
router.put(
  "/requests/:requestId/reject",
  isAuthenticated,
  isAuthorized("Teacher"),
  rejectRequests
  
);
// delete request
router.delete(
  "/requests/:requestId",
  isAuthenticated,
  isAuthorized("Teacher"),
  deleteRequest
);

//  add feedback 
router.post(
  "/feedback/:workId",
  isAuthenticated,
  isAuthorized("Teacher"),
  addFeedback
);

// mark complete
router.post(
  "/mark-complete/:workId",
  isAuthenticated,
  isAuthorized("Teacher"),
  markComplete
);

// get assigned student
router.get(
  "/assigned-student",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAssignedStudents
);

//  download files
router.get(
  "/download/:workId/:fileId",
  isAuthenticated,
  isAuthorized("Teacher"),
  downloadFiles
);

//  get files
router.get(
  "/files",
  isAuthenticated,
  isAuthorized("Teacher"),
  getFiles
);

//  delete file
router.delete(
  "/files/:workId/:fileId",
  isAuthenticated,
  isAuthorized("Teacher"),
  deleteFile
);

export default router;