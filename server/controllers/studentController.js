import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectService from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { Project } from "../models/project.js";
import { Thesis } from "../models/thesis.js";
import { Notification } from "../models/notification.js";
import * as fileServices from "../services/fileServices.js";




// get student project 
export const getStudentProject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await projectService.getProjectByStudent(studentId);

  const thesis = await Thesis.findOne({
    student: studentId,
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: {
      project: project || null,
      thesis: thesis || null,
    },
  });
});

// submit proposal 
export const submitProposal = asyncHandler(async (req, res, next) => {
  const { type, title, description, researchArea } = req.body;

  const studentId = req.user._id;
  // Validate proposal type
  if (!type || !["Project", "Thesis"].includes(type)) {
    return next(
      new ErrorHandler("Proposal type must be either Project or Thesis.", 400),
    );
  }

  // Validate title
  if (!title || !title.trim()) {
    return next(new ErrorHandler("Proposal title is required.", 400));
  }

  // Validate description
  if (!description || !description.trim()) {
    return next(new ErrorHandler("Proposal description is required.", 400));
  }

  // Validate thesis research area
  if (type === "Thesis" && (!researchArea || !researchArea.trim())) {
    return next(
      new ErrorHandler("Research area is required for thesis proposal.", 400),
    );
  }

  const existingProject = await projectService.getProjectByStudent(studentId);

  const existingThesis = await Thesis.findOne({
    student: studentId,
  }).sort({ createdAt: -1 });

  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have an active project proposal. You can only submit a new proposal if your previous proposal was rejected.",
        400,
      ),
    );
  }

  if (existingThesis && existingThesis.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have an active thesis proposal. You can only submit a new proposal if your previous proposal was rejected.",
        400,
      ),
    );
  }

  if (existingProject && existingProject.status === "rejected") {
    await Project.findByIdAndDelete(existingProject._id);
  }

  if (existingThesis && existingThesis.status === "rejected") {
    await Thesis.findByIdAndDelete(existingThesis._id);
  }

  if (type === "Project") {
    const projectData = {
      student: studentId,
      type: "Project",
      title: title.trim(),
      description: description.trim(),
    };

    const project = await projectService.createProject(projectData);

    // Update student's project reference
    await User.findByIdAndUpdate(studentId, {
      project: project._id,
    });

    return res.status(201).json({
      success: true,
      data: {
        project,
      },
      message: "Project proposal submitted successfully",
    });
  }

  // create thesis
  if (type === "Thesis") {
    const thesis = await Thesis.create({
      student: studentId,
      title: title.trim(),
      description: description.trim(),
      researchArea: researchArea.trim(),
    });

    return res.status(201).json({
      success: true,
      data: {
        thesis,
      },
      message: "Thesis proposal submitted successfully",
    });
  }
});

// upload files 
export const uploadFiles = asyncHandler(async (req, res, next) => {
  const { workId } = req.params;
  const studentId = req.user._id;

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  let academicWork = await projectService.getProjectById(workId);
  let workType = "Project";

  if (!academicWork) {
    academicWork = await Thesis.findById(workId);
    workType = "Thesis";
  }
  if (!academicWork) {
    return next(new ErrorHandler("Project or Thesis not found", 404));
  }

  const workStudentId = academicWork.student?._id || academicWork.student;

  if (workStudentId.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to upload files", 403));
  }

  if (academicWork.status === "rejected") {
    return next(
      new ErrorHandler("Cannot upload files to a rejected proposal", 403),
    );
  }
  
  // Project
  if (workType === "Project") {
    const updatedProject = await projectService.addfilesToProject(
      workId,
      req.files,
    );

    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: {
        project: updatedProject,
      },
    });
  }
  
  // thesis
  academicWork.files.push(
    ...req.files.map((file) => ({
      fileUrl: file.path || file.location || file.filename,

      originalName: file.originalname,

      fileType: file.mimetype,

      uploadedAt: new Date(),
    })),
  );

  await academicWork.save();
  return res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: {
      thesis: academicWork,
    },
  });
});

// get available supervisors 
export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department expertise")
    .lean();

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully",
  });
});

// get supervisor 
export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department expertise",
  );

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }

  return res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
  });
});

// request supervisor 
export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);
  if (student.supervisor) {
    return next(
      new ErrorHandler("You already have a supervisor assigned.", 400),
    );
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor selected.", 400));
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return next(
      new ErrorHandler(
        "Selected supervisor has reached maximum student capacity.",
        400,
      ),
    );
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
  };

  const request = await requestServices.createRequest(requestData);
  await notificationServices.notifyUser(
    teacherId,
    `${student.name} has request ${supervisor.name} to be their supervisor.`,
    "request",
    "/teacher/request",
    "medium",
  );

  res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request submitted successfully",
  });
});

// get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({
    student: studentId,
  })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name email department expertise")
    .lean();

  const thesis = await Thesis.findOne({
    student: studentId,
  })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name email department expertise")
    .lean();

  const student = await User.findById(studentId)
    .populate("supervisor", "name email department expertise")
    .lean();

  const proposal = project || thesis;

  const supervisor =
    project?.supervisor || thesis?.supervisor || student?.supervisor || null;

  const supervisorName = supervisor?.name || null;
  const upcomingDeadlines = proposal?.deadline ? [proposal] : [];
  const topNotifications = await Notification.find({
    user: studentId,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const feedbackNotifications =
    proposal?.feedback?.length > 0
      ? [...proposal.feedback]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
      : [];

  return res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",

    data: {
      project: project || null,
      thesis: thesis || null,
      proposal: proposal || null,

      supervisor: supervisor,
      supervisorName: supervisorName,

      upcomingDeadlines,
      topNotifications,
      feedbackList: feedbackNotifications,
    },
  });
});

// get feedback
export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  let academicWork = await projectService.getProjectById(projectId);
  if (!academicWork) {
    academicWork = await Thesis.findById(projectId).populate(
      "supervisor",
      "name email department expertise",
    );
  }

  if (!academicWork) {
    return next(new ErrorHandler("Project or Thesis not found", 404));
  }

  const workStudentId = academicWork.student?._id || academicWork.student;
  if (workStudentId.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to view feedback", 403));
  }

  // Get feedback
  const feedbackList = academicWork.feedback || [];
  const sortedFeedback = [...feedbackList]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((f) => ({
      _id: f._id,
      title: f.title,
      message: f.message,
      type: f.type,
      createdAt: f.createdAt,
      supervisorName:
        f.supervisorId?.name || academicWork.supervisor?.name || "Supervisor",
      supervisorEmail:
        f.supervisorId?.email || academicWork.supervisor?.email || null,
    }));

  return res.status(200).json({
    success: true,
    data: {
      feedback: sortedFeedback,
    },
  });
});

// download files 
export const downloadFiles = asyncHandler(async (req, res, next) => {
  const { workId, fileId } = req.params;
  const studentId = req.user._id;

  // First check Project
  let academicWork = await projectService.getProjectById(workId);

  // If Project not found, check Thesis
  if (!academicWork) {
    academicWork = await Thesis.findById(workId);
  }

  // Work not found
  if (!academicWork) {
    return next(new ErrorHandler("Project or Thesis not found", 404));
  }

  // Check ownership
  const workStudentId = academicWork.student?._id || academicWork.student;

  if (workStudentId.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to download file", 403));
  }

  // Find file
  const file = academicWork.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  return fileServices.streamDownload(file.fileUrl, res, file.originalName);
});

// delete files 
export const deleteFile = asyncHandler(async (req, res, next) => {
  const { workId, fileId } = req.params;
  const studentId = req.user._id;
  let academicWork = await projectService.getProjectById(workId);

  let workType = "Project";
  if (!academicWork) {
    academicWork = await Thesis.findById(workId);
    workType = "Thesis";
  }

  if (!academicWork) {
    return next(new ErrorHandler("Project or Thesis not found", 404));
  }
  
  const workStudentId = academicWork.student?._id || academicWork.student;
  if (workStudentId.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to delete this file", 403));
  }
  const file = academicWork.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }
  academicWork.files.pull(fileId);
  await academicWork.save();
  return res.status(200).json({
    success: true,
    message: "File deleted successfully",
    data: {
      workId,
      fileId,
    },
  });
});
