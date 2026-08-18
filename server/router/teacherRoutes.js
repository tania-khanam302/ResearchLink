import express from "express";

import {
  getTeacherDashboardStats,
  acceptRequests,getRequests,rejectRequests,
  addFeedback,
  markComplete,
  getAssignedStudents,
  downloadFiles,
  getFiles
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

//  add feedback 
router.post(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Teacher"),
  addFeedback
);

// mark complete
router.post(
  "/mark-complete/:projectId",
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
  "/download/:projectId/:fileId",
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


export default router;