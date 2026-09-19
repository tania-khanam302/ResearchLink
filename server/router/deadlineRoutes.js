
import express from "express";
import {
  createDeadline,
  getTeacherDeadlines,
  getTeacherResearch,
  getStudentDeadlines,
  submitDeadline,
  reviewDeadline,
  replyToDeadlineFeedback,
  deleteDeadlineSubmissionFile,
  deleteDeadlineSubmissionLink,
} from "../controllers/deadlineController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

import { upload } from "../middlewares/upload.js";

const router = express.Router();

// teacher 
router.post(
  "/create-deadline",
  isAuthenticated,
  isAuthorized("Teacher"),
  createDeadline
);

router.get(
  "/my-deadlines",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherDeadlines
);

router.get(
  "/my-research",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherResearch
);

// student
router.get(
  "/student-deadlines",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentDeadlines
);

router.post(
  "/submit/:id",
  isAuthenticated,
  isAuthorized("Student"),
  upload.array("files", 10),
  submitDeadline
);

router.delete(
  "/submit/:id/submission/:submissionId/file/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  deleteDeadlineSubmissionFile
);

router.delete(
  "/submit/:id/submission/:submissionId/link/:linkId",
  isAuthenticated,
  isAuthorized("Student"),
  deleteDeadlineSubmissionLink
);

// teacher review 
router.patch(
  "/review/:id",
  isAuthenticated,
  isAuthorized("Teacher"),
  reviewDeadline
);

// student reply to teacher feedback
router.patch(
  "/reply/:deadlineId/submission/:submissionId",
  isAuthenticated,
  isAuthorized("Student"),
  replyToDeadlineFeedback
);
export default router;