// import express from "express";
// import { createDeadline } from "../controllers/deadlineController.js";
// import {
//   isAuthenticated,
//   isAuthorized,
// } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// router.post(
//   "/create-deadline/:id",
//   isAuthenticated,
//   isAuthorized("Admin" , "Co-Admin"),
//   // isAuthorized("Admin-Teacher"),
//   createDeadline,
// );

// export default router;

import express from "express";

import {
  createDeadline,
  getTeacherDeadlines,
  getTeacherResearch,
  getStudentDeadlines,
  submitDeadline,
  reviewDeadline,
} from "../controllers/deadlineController.js";

import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

import { upload } from "../middlewares/upload.js";

const router = express.Router();



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

  upload.array("files", 5),

  submitDeadline
);


router.patch(
  "/review/:id",

  isAuthenticated,

  isAuthorized("Teacher"),

  reviewDeadline
);

export default router;
