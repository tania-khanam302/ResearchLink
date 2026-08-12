import express from "express";

import {
  getTeacherDashboardStats,
  acceptRequests,getRequests,rejectRequests
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


// get accept
router.put(
  "/requests/:requestId/accept",
  isAuthenticated,
  isAuthorized("Teacher"),
  acceptRequests
  
);

// get reject
router.put(
  "/requests/:requestId/reject",
  isAuthenticated,
  isAuthorized("Teacher"),
  rejectRequests
  
);
export default router;