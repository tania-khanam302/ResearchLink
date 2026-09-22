import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Deadline } from "../models/deadline.js";
import { Project } from "../models/project.js";
import { Thesis } from "../models/thesis.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const populateDeadline = async (deadline) => {
  await deadline.populate([
    {
      path: "createdBy",
      select: "name email",
    },

    {
      path: "student",
      select: "name email department",
    },

    {
      path: "project",
      select: "title student supervisor",
      populate: [
        {
          path: "student",
          select: "name email department",
        },
        {
          path: "supervisor",
          select: "name email",
        },
      ],
    },

    {
      path: "thesis",
      select: "title student supervisor",
      populate: [
        {
          path: "student",
          select: "name email department",
        },
        {
          path: "supervisor",
          select: "name email",
        },
      ],
    },
  ]);

  return deadline;
};

// const syncLatestSubmission = (deadline) => {
//   if (!deadline.submissions || deadline.submissions.length === 0) {
//     deadline.submission.status = "Not Submitted";
//     deadline.submission.files = [];
//     deadline.submission.links = [];
//     deadline.submission.submittedAt = null;
//     deadline.submission.studentComment = "";
//     deadline.submission.teacherFeedback = "";
//     deadline.submission.reviewedAt = null;

//     return;
//   }

//   const latest = deadline.submissions[deadline.submissions.length - 1];

//   deadline.submission.status = latest.status || "Submitted";

//   deadline.submission.files = latest.files || [];

//   deadline.submission.links = latest.links || [];

//   deadline.submission.submittedAt = latest.submittedAt || null;

//   deadline.submission.studentComment = latest.studentComment || "";

//   deadline.submission.teacherFeedback = latest.teacherFeedback || "";

//   deadline.submission.reviewedAt = latest.reviewedAt || null;
// };

const syncLatestSubmission = (deadline) => {
  if (
    !deadline.submissions ||
    deadline.submissions.length === 0
  ) {
    deadline.submission.status = "Not Submitted";
    deadline.submission.files = [];
    deadline.submission.links = [];
    deadline.submission.submittedAt = null;
    deadline.submission.studentComment = "";
    deadline.submission.teacherFeedback = "";
    deadline.submission.studentReply = "";
    deadline.submission.studentReplyAt = null;
    deadline.submission.reviewedAt = null;

    return;
  }

  const latest =
    deadline.submissions[
      deadline.submissions.length - 1
    ];

  // IMPORTANT: keep the actual submission ID
  deadline.submission._id = latest._id;

  deadline.submission.status =
    latest.status || "Submitted";

  deadline.submission.files =
    latest.files || [];

  deadline.submission.links =
    latest.links || [];

  deadline.submission.submittedAt =
    latest.submittedAt || null;

  deadline.submission.studentComment =
    latest.studentComment || "";

  deadline.submission.teacherFeedback =
    latest.teacherFeedback || "";

  deadline.submission.studentReply =
    latest.studentReply || "";

  deadline.submission.studentReplyAt =
    latest.studentReplyAt || null;

  deadline.submission.reviewedAt =
    latest.reviewedAt || null;
};

export const createDeadline = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    name,
    type,
    description,
    dueDate,
    finalSubmitDate,
    isFinal,
    project,
    thesis,
  } = req.body;

  if (!name?.trim()) {
    throw new ErrorHandler("Deadline name or title is required", 400);
  }

  if (!dueDate) {
    throw new ErrorHandler("Due date is required", 400);
  }

  let projectId = project || null;
  let thesisId = thesis || null;

  if (!projectId && !thesisId && id) {
    if (!isValidObjectId(id)) {
      throw new ErrorHandler("Invalid project or thesis ID", 400);
    }

    const projectExists = await Project.exists({
      _id: id,
    });

    if (projectExists) {
      projectId = id;
    } else {
      const thesisExists = await Thesis.exists({
        _id: id,
      });

      if (thesisExists) {
        thesisId = id;
      }
    }
  }

  if (!projectId && !thesisId) {
    throw new ErrorHandler("Please provide either project or thesis", 400);
  }

  if (projectId && thesisId) {
    throw new ErrorHandler(
      "Deadline cannot belong to both project and thesis",
      400,
    );
  }

  const parsedDueDate = new Date(dueDate);

  if (isNaN(parsedDueDate.getTime())) {
    throw new ErrorHandler("Please provide a valid due date", 400);
  }

  if (parsedDueDate <= new Date()) {
    throw new ErrorHandler("Due date must be in the future", 400);
  }

  let parsedFinalSubmitDate = null;

  if (finalSubmitDate) {
    parsedFinalSubmitDate = new Date(finalSubmitDate);

    if (isNaN(parsedFinalSubmitDate.getTime())) {
      throw new ErrorHandler(
        "Please provide a valid final submission date",
        400,
      );
    }

    if (parsedFinalSubmitDate < parsedDueDate) {
      throw new ErrorHandler(
        "Final submission date cannot be earlier than the deadline date",
        400,
      );
    }
  }

  if (projectId) {
    if (!isValidObjectId(projectId)) {
      throw new ErrorHandler("Invalid project ID", 400);
    }

    const projectData = await Project.findById(projectId)
      .populate("student", "name email department")
      .populate("supervisor", "name email");

    if (!projectData) {
      throw new ErrorHandler("Project not found", 404);
    }

    if (!projectData.student) {
      throw new ErrorHandler("No student assigned to this project", 400);
    }

    const isSupervisor =
      projectData.supervisor &&
      projectData.supervisor._id.toString() === req.user._id.toString();

    if (!isSupervisor) {
      throw new ErrorHandler(
        "You are not allowed to create a deadline for this project",
        403,
      );
    }

    const existingDeadline = await Deadline.findOne({
      project: projectData._id,
      name: name.trim(),
    });

    if (existingDeadline) {
      throw new ErrorHandler(
        "A deadline with this name already exists for this project",
        409,
      );
    }

    const deadline = await Deadline.create({
      name: name.trim(),

      type: type || "Weekly Progress",

      description: description?.trim() || "",

      dueDate: parsedDueDate,

      finalSubmitDate: parsedFinalSubmitDate,

      isFinal: Boolean(isFinal),

      createdBy: req.user._id,

      student: projectData.student._id,

      project: projectData._id,

      thesis: null,
    });

    await populateDeadline(deadline);

    return res.status(201).json({
      success: true,

      message: "Project deadline created successfully",

      data: {
        deadline,
      },
    });
  }

  if (thesisId) {
    if (!isValidObjectId(thesisId)) {
      throw new ErrorHandler("Invalid thesis ID", 400);
    }

    const thesisData = await Thesis.findById(thesisId)
      .populate("student", "name email department")
      .populate("supervisor", "name email");

    if (!thesisData) {
      throw new ErrorHandler("Thesis not found", 404);
    }

    if (!thesisData.student) {
      throw new ErrorHandler("No student assigned to this thesis", 400);
    }

    const isSupervisor =
      thesisData.supervisor &&
      thesisData.supervisor._id.toString() === req.user._id.toString();

    if (!isSupervisor) {
      throw new ErrorHandler(
        "You are not allowed to create a deadline for this thesis",
        403,
      );
    }

    const existingDeadline = await Deadline.findOne({
      thesis: thesisData._id,
      name: name.trim(),
    });

    if (existingDeadline) {
      throw new ErrorHandler(
        "A deadline with this name already exists for this thesis",
        409,
      );
    }

    const deadline = await Deadline.create({
      name: name.trim(),

      type: type || "Weekly Progress",

      description: description?.trim() || "",

      dueDate: parsedDueDate,

      finalSubmitDate: parsedFinalSubmitDate,

      isFinal: Boolean(isFinal),

      createdBy: req.user._id,

      student: thesisData.student._id,

      project: null,

      thesis: thesisData._id,
    });

    await populateDeadline(deadline);

    return res.status(201).json({
      success: true,

      message: "Thesis deadline created successfully",

      data: {
        deadline,
      },
    });
  }

  throw new ErrorHandler("Unable to create deadline", 400);
});

export const getTeacherDeadlines = asyncHandler(async (req, res) => {
  const deadlines = await Deadline.find({
    createdBy: req.user._id,
  })
    .populate({
      path: "student",
      select: "name email department",
    })

    .populate({
      path: "project",
      select: "title student supervisor",

      populate: [
        {
          path: "student",
          select: "name email department",
        },

        {
          path: "supervisor",
          select: "name email",
        },
      ],
    })

    .populate({
      path: "thesis",
      select: "title student supervisor",

      populate: [
        {
          path: "student",
          select: "name email department",
        },

        {
          path: "supervisor",
          select: "name email",
        },
      ],
    })

    .sort({
      dueDate: 1,
    });

  return res.status(200).json({
    success: true,

    data: {
      deadlines,
    },
  });
});

export const getTeacherResearch = asyncHandler(async (req, res) => {
  const [projects, theses] = await Promise.all([
    Project.find({ supervisor: req.user._id })
      .select("_id title student supervisor status createdAt")
      .populate("student", "name email department")
      .populate("supervisor", "name email")
      .lean(),
    Thesis.find({ supervisor: req.user._id })
      .select("_id title student supervisor status createdAt")
      .populate("student", "name email department")
      .populate("supervisor", "name email")
      .lean(),
  ]);

  res.status(200).json({ success: true, data: { projects, theses } });
});

// export const getStudentDeadlines = asyncHandler(async (req, res) => {
//   const deadlines = await Deadline.find({
//     student: req.user._id,
//   })
//     .populate({
//       path: "project",
//       select: "title supervisor",
//       populate: {
//         path: "supervisor",
//         select: "name email",
//       },
//     })
//     .populate({
//       path: "thesis",
//       select: "title supervisor",
//       populate: {
//         path: "supervisor",
//         select: "name email",
//       },
//     })
//     .sort({
//       dueDate: 1,
//     });

//   const now = new Date();

//   deadlines.forEach((deadline) => {
//     syncLatestSubmission(deadline);

//     if (deadline.submissions.length === 0 && deadline.dueDate < now) {
//       deadline.submission.status = "Overdue";
//     }
//   });

//   return res.status(200).json({
//     success: true,
//     data: {
//       deadlines,
//     },
//   });
// });


export const getStudentDeadlines = asyncHandler(async (req, res) => {
const deadlines = await Deadline.find({
  student: req.user._id,
})
  .select(
    "name type description dueDate finalSubmitDate isFinal createdBy student project thesis submissions submission createdAt updatedAt"
  )
  .populate({
    path: "project",
    select: "title supervisor",
    populate: {
      path: "supervisor",
      select: "name email",
    },
  })
  .populate({
    path: "thesis",
    select: "title supervisor",
    populate: {
      path: "supervisor",
      select: "name email",
    },
  })
  .sort({ dueDate: 1 });
console.log(
  "DB DEADLINE SUBMISSIONS:",
  deadlines.map((d) => ({
    deadlineId: d._id,
    submissions: d.submissions,
    legacySubmission: d.submission,
  }))
);
  const now = new Date();

  deadlines.forEach((deadline) => {
    syncLatestSubmission(deadline);

    if (
      (!deadline.submissions ||
        deadline.submissions.length === 0) &&
      deadline.dueDate < now
    ) {
      deadline.submission.status = "Overdue";
    }
  });

  return res.status(200).json({
    success: true,
    data: {
      deadlines,
    },
  });
});

export const submitDeadline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new ErrorHandler("Invalid deadline ID", 400));
  }

  const deadline = await Deadline.findById(id);

  if (!deadline) {
    return next(new ErrorHandler("Deadline not found", 404));
  }

  if (deadline.student.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("You are not allowed to submit this deadline", 403),
    );
  }

  const now = new Date();

  if (now > deadline.dueDate) {
    syncLatestSubmission(deadline);

    if (deadline.submission.status !== "Reviewed") {
      deadline.submission.status = "Overdue";

      await deadline.save();
    }

    return next(new ErrorHandler("Submission deadline has passed", 400));
  }

  const uploadedFiles = Array.isArray(req.files) ? req.files : [];

  const files = uploadedFiles
    .map((file) => {
      if (!file?.path) {
        return null;
      }

      const uploadsRoot = path.join(process.cwd(), "uploads");

      const relativePath = path
        .relative(uploadsRoot, file.path)
        .split(path.sep)
        .join("/");

      const fileUrl = `/uploads/${relativePath}`;

      return {
        originalName: file.originalname || file.filename || "File",

        fileUrl,

        fileType: file.mimetype || "File",

        fileSize: Number(file.size) || 0,
      };
    })
    .filter(Boolean);

  let links = [];
  if (req.body.links) {
    try {
      const parsedLinks =
        typeof req.body.links === "string"
          ? JSON.parse(req.body.links)
          : req.body.links;

      if (Array.isArray(parsedLinks)) {
        links = parsedLinks
          .map((link) => ({
            title: typeof link.title === "string" ? link.title.trim() : "",

            url: typeof link.url === "string" ? link.url.trim() : "",
          }))
          .filter((link) => link.title && link.url);
      }
    } catch (error) {
      return next(new ErrorHandler("Invalid links format", 400));
    }
  }

  // Comment
  const studentComment =
    typeof req.body.studentComment === "string"
      ? req.body.studentComment.trim()
      : "";

  if (files.length === 0 && links.length === 0 && !studentComment) {
    return next(
      new ErrorHandler(
        "Please upload a file, add a link, or write a submission comment",
        400,
      ),
    );
  }

  const submissionNumber = (deadline.submissions?.length || 0) + 1;

  const newSubmission = {
    submissionNumber,

    files,

    links,

    studentComment,

    teacherFeedback: "",

    status: "Submitted",

    submittedAt: new Date(),

    reviewedAt: null,
  };

  deadline.submissions.push(newSubmission);

  syncLatestSubmission(deadline);

  await deadline.save();

  await populateDeadline(deadline);

  return res.status(200).json({
    success: true,

    message: "Your work has been submitted successfully.",

    data: {
      deadline,
    },
  });
});

export const reviewDeadline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { teacherFeedback } = req.body;

  if (!isValidObjectId(id)) {
    return next(new ErrorHandler("Invalid deadline ID", 400));
  }

  const feedback =
    typeof teacherFeedback === "string" ? teacherFeedback.trim() : "";

  if (!feedback) {
    return next(new ErrorHandler("Teacher feedback is required", 400));
  }

  const deadline = await Deadline.findById(id);

  if (!deadline) {
    return next(new ErrorHandler("Deadline not found", 404));
  }

  if (deadline.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("You are not allowed to review this submission", 403),
    );
  }

  if (!deadline.submissions || deadline.submissions.length === 0) {
    return next(new ErrorHandler("Student has not submitted yet", 400));
  }

  const latestSubmission =
    deadline.submissions[deadline.submissions.length - 1];

  if (latestSubmission.status === "Reviewed") {
    return next(
      new ErrorHandler("This submission has already been reviewed", 400),
    );
  }

  latestSubmission.teacherFeedback = feedback;

  latestSubmission.status = "Reviewed";

  latestSubmission.reviewedAt = new Date();

  syncLatestSubmission(deadline);

  await deadline.save();

  await populateDeadline(deadline);

  return res.status(200).json({
    success: true,

    message: "Submission reviewed successfully",

    data: {
      deadline,
    },
  });
});
export const replyToDeadlineFeedback = asyncHandler(
  async (req, res, next) => {
    const { deadlineId, submissionId } = req.params;
    const { studentReply } = req.body;

    if (
      !isValidObjectId(deadlineId) ||
      !isValidObjectId(submissionId)
    ) {
      return next(
        new ErrorHandler(
          "Invalid deadline or submission ID",
          400
        )
      );
    }

    const reply =
      typeof studentReply === "string"
        ? studentReply.trim()
        : "";

    if (!reply) {
      return next(
        new ErrorHandler(
          "Student reply is required",
          400
        )
      );
    }

    if (reply.length > 2000) {
      return next(
        new ErrorHandler(
          "Student reply cannot be more than 2000 characters",
          400
        )
      );
    }

    const deadline = await Deadline.findById(deadlineId);

    if (!deadline) {
      return next(
        new ErrorHandler(
          "Deadline not found",
          404
        )
      );
    }

    // Only the student assigned to this deadline can reply
    if (
      deadline.student.toString() !==
      req.user._id.toString()
    ) {
      return next(
        new ErrorHandler(
          "You are not allowed to reply to this feedback",
          403
        )
      );
    }

    const submission =
      deadline.submissions.id(submissionId);

    if (!submission) {
      return next(
        new ErrorHandler(
          "Submission not found",
          404
        )
      );
    }

    // Student can reply only after teacher reviews it
    if (!submission.teacherFeedback?.trim()) {
      return next(
        new ErrorHandler(
          "Teacher has not provided feedback yet",
          400
        )
      );
    }

    submission.studentReply = reply;
    submission.studentReplyAt = new Date();

    syncLatestSubmission(deadline);

    await deadline.save();

    await populateDeadline(deadline);

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: {
        deadline,
      },
    });
  }
);
export const deleteDeadlineSubmissionFile = asyncHandler(
  async (req, res, next) => {
    const { id, submissionId, fileId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(submissionId) ||
      !isValidObjectId(fileId)
    ) {
      return next(
        new ErrorHandler("Invalid deadline, submission, or file ID", 400),
      );
    }

    const deadline = await Deadline.findById(id);

    if (!deadline) {
      return next(new ErrorHandler("Deadline not found", 404));
    }

    // Only the student who owns this deadline can delete
    if (deadline.student.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("You are not allowed to modify this submission", 403),
      );
    }

    // Cannot delete after deadline
    if (new Date() > new Date(deadline.dueDate)) {
      return next(
        new ErrorHandler("You cannot delete files after the deadline", 400),
      );
    }

    const submission = deadline.submissions.id(submissionId);

    if (!submission) {
      return next(new ErrorHandler("Submission not found", 404));
    }

    const file = submission.files.id(fileId);

    if (!file) {
      return next(new ErrorHandler("File not found", 404));
    }

    // Save file path before removing DB record
    const fileUrl = file.fileUrl;

    // Remove file from MongoDB
    submission.files.pull(fileId);

    syncLatestSubmission(deadline);

    await deadline.save();

    // Delete physical file from server
    if (fileUrl) {
      try {
        const uploadsRoot = path.resolve(process.cwd(), "uploads");

        const relativeFilePath = fileUrl
          .replace(/^\/uploads[\\/]/, "")
          .replace(/^uploads[\\/]/, "");

        const physicalFilePath = path.resolve(uploadsRoot, relativeFilePath);

        // Security check: file must stay inside uploads folder
        if (
          physicalFilePath === uploadsRoot ||
          physicalFilePath.startsWith(uploadsRoot + path.sep)
        ) {
          if (fs.existsSync(physicalFilePath)) {
            fs.unlinkSync(physicalFilePath);
          }
        }
      } catch (error) {
        console.error("Physical file deletion failed:", error.message);
      }
    }

    await populateDeadline(deadline);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      data: {
        deadline,
      },
    });
  },
);
export const deleteDeadlineSubmissionLink = asyncHandler(
  async (req, res, next) => {
    const { id, submissionId, linkId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(submissionId) ||
      !isValidObjectId(linkId)
    ) {
      return next(
        new ErrorHandler("Invalid deadline, submission, or link ID", 400),
      );
    }

    const deadline = await Deadline.findById(id);

    if (!deadline) {
      return next(new ErrorHandler("Deadline not found", 404));
    }

    // Only owner student can delete
    if (deadline.student.toString() !== req.user._id.toString()) {
      return next(
        new ErrorHandler("You are not allowed to modify this submission", 403),
      );
    }

    // Cannot delete after deadline
    if (new Date() > new Date(deadline.dueDate)) {
      return next(
        new ErrorHandler("You cannot delete links after the deadline", 400),
      );
    }

    const submission = deadline.submissions.id(submissionId);

    if (!submission) {
      return next(new ErrorHandler("Submission not found", 404));
    }

    const link = submission.links.id(linkId);

    if (!link) {
      return next(new ErrorHandler("Link not found", 404));
    }

    // Remove only this link
    submission.links.pull(linkId);

    syncLatestSubmission(deadline);

    await deadline.save();

    await populateDeadline(deadline);

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
      data: {
        deadline,
      },
    });
  },
);