import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectServices from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { Project } from "../models/project.js";
import { Thesis } from "../models/thesis.js";
import { Deadline } from "../models/deadline.js";
import { Notification } from "../models/notification.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as fileServices from "../services/fileServices.js";
import { sendEmail } from "./../services/emailService.js";
import {
  generateRequestAcceptedTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTemplates.js";



// get teacher dashboard stats
export const getTeacherDashboardStats = asyncHandler(
  async (req, res, next) => {
    const teacherId = req.user?._id;

    if (!teacherId) {
      return next(new ErrorHandler("Teacher authentication required", 401));
    }

  

    const assignedStudents = await User.countDocuments({
      supervisor: teacherId,
    });

    const totalPendingRequests =
      await SupervisorRequest.countDocuments({
        supervisor: teacherId,
        status: "pending",
      });


    const projects = await Project.find({
      supervisor: teacherId,
    })
      .select("_id status student title createdAt")
      .lean();

  
    const theses = await Thesis.find({
      supervisor: teacherId,
    })
      .select("_id status student title createdAt")
      .lean();


    const totalProjects = projects.length;
    const totalTheses = theses.length;

    const completedProjects = projects.filter(
      (project) => project.status === "completed",
    ).length;

    const completedTheses = theses.filter(
      (thesis) => thesis.status === "completed",
    ).length;

    const completedWorks =
      completedProjects + completedTheses;

    const totalResearchWorks =
      totalProjects + totalTheses;

    const activeWorks = Math.max(
      totalResearchWorks - completedWorks,
      0,
    );

 
    const now = new Date();

    const projectIds = projects.map(
      (project) => project._id,
    );

    const thesisIds = theses.map(
      (thesis) => thesis._id,
    );

    const deadlineDocs = await Deadline.find({
      dueDate: { $gte: now },
      $or: [
        {
          project: { $in: projectIds },
        },
        {
          thesis: { $in: thesisIds },
        },
      ],
    })
      .populate({
        path: "project",
        select: "_id title student",
        populate: {
          path: "student",
          select: "_id name email",
        },
      })
      .populate({
        path: "thesis",
        select: "_id title student",
        populate: {
          path: "student",
          select: "_id name email",
        },
      })
      .sort({ dueDate: 1 })
      .limit(5)
      .lean();

    const upcomingDeadlines = deadlineDocs.map(
      (deadline) => {
        const work =
          deadline.project || deadline.thesis;

        return {
          _id: deadline._id,

          name: deadline.name,

          dueDate: deadline.dueDate,

          title:
            work?.title ||
            deadline.name,

          student: work?.student
            ? {
                _id: work.student._id,
                name: work.student.name,
                email: work.student.email,
              }
            : null,

          type: deadline.project
            ? "Project"
            : "Thesis",

          workId: work?._id || null,
        };
      },
    );

   
    const recentNotifications =
      await Notification.find({
        user: teacherId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    const dashboardStats = {
      assignedStudents,
      totalPendingRequests,
      activeWorks,
      completedWorks,
      totalResearchWorks,
      recentNotifications,
      upcomingDeadlines,
    };

    console.log("Assigned Students:", assignedStudents);
    console.log("Projects:", totalProjects);
    console.log("Theses:", totalTheses);
    console.log("Pending:", totalPendingRequests);
    console.log("Completed:", completedWorks);
    console.log("Active:", activeWorks);
    console.log(
      "Upcoming Deadlines:",
      upcomingDeadlines.length,
    );
 
    res.status(200).json({
      success: true,
      message:
        "Dashboard stats fetched for teacher successfully",
      data: {
        dashboardStats,
      },
    });
  },
);


// get requests
export const getRequests = asyncHandler(async (req, res, next) => {
  const { supervisor } = req.query;
  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const { requests, total } = await requestServices.getAllRequests(filters);
  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;

      if (!requestObj?.student?._id) {
        return requestObj;
      }
      const studentId = requestObj.student._id;

      const latestProject = await Project.findOne({
        student: studentId,
      })
        .sort({ createdAt: -1 })
        .lean();

      const latestThesis = await Thesis.findOne({
        student: studentId,
      })
        .sort({ createdAt: -1 })
        .lean();

      let latestProposal = null;
      let proposalType = null;

      if (latestProject && latestThesis) {
        if (
          new Date(latestProject.createdAt) > new Date(latestThesis.createdAt)
        ) {
          latestProposal = latestProject;
          proposalType = "Project";
        } else {
          latestProposal = latestThesis;
          proposalType = "Thesis";
        }
      } else if (latestProject) {
        latestProposal = latestProject;
        proposalType = "Project";
      } else if (latestThesis) {
        latestProposal = latestThesis;
        proposalType = "Thesis";
      }

      return {
        ...requestObj,
        proposal: latestProposal,
        proposalType,
        latestProject: proposalType === "Project" ? latestProject : null,

        latestThesis: proposalType === "Thesis" ? latestThesis : null,
      };
    }),
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully",
    data: {
      requests: updatedRequests,
      total,
    },
  });
});

// accept requests
// export const acceptRequests = asyncHandler(async (req, res, next) => {
//   const { requestId } = req.params;
//   const teacherId = req.user._id;

//   const request = await requestServices.acceptRequests(requestId, teacherId);
//   if (!request) return next(new ErrorHandler("Request not found", 404));

//   await notificationServices.notifyUser(
//     request.student._id,
//     `Your supervisor request has been accepted by ${req.user.name}`,
//     "approval",
//     "/student/status",
//     "low",
//   );

//   const student = await User.findById(request.student._id);
//   const studentEmail = student.email;
//   const message = generateRequestAcceptedTemplate(req.user.name);
//   await sendEmail({
//     to: studentEmail,
//     subject: "Reasearch link- Your Supervisor Has Been Accepted",
//     message,
//   });

//   res.status(200).json({
//     success: true,
//     message: "Request accepted successfully",
//     data: {
//       request,
//     },
//   });
// });

export const acceptRequests = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.acceptRequests(
    requestId,
    teacherId,
  );

  if (!request) {
    return next(new ErrorHandler("Request not found", 404));
  }

  // Student notification
  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been accepted by ${req.user.name}`,
    "approval",
    "/student/status",
    "low",
  );

  // Teacher notification
  const student = await User.findById(request.student._id);

  if (student) {
    await notificationServices.notifyUser(
      teacherId,
      `You accepted ${student.name}'s supervisor request`,
      "approval",
      "/teacher/assigned-students",
      "low",
    );
  }

  // Email student
  if (student?.email) {
    const message = generateRequestAcceptedTemplate(req.user.name);

    await sendEmail({
      to: student.email,
      subject: "Research Link - Your Supervisor Has Been Accepted",
      message,
    });
  }

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: {
      request,
    },
  });
});


// reject requests
export const rejectRequests = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;
  const request = await requestServices.rejectRequests(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request has been rejected by ${req.user.name}`,
    "rejection",
    "/student/status",
    "high",
  );

  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestRejectedTemplate(req.user.name);
  await sendEmail({
    to: studentEmail,
    subject: "Reasearch link- Your Supervisor Has Been Rejected",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Request rejected",
    data: {
      request,
    },
  });
});

// delete request
export const deleteRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  const request = await requestServices.deleteRequest(requestId, teacherId);

  if (!request) {
    return next(new ErrorHandler("Request not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Request deleted successfully",
    data: {
      request,
    },
  });
});

// get assigned students
export const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;
  const students = await User.find({
    supervisor: teacherId,
  }).sort({ createdAt: -1 });

  const studentsWithWorks = await Promise.all(
    students.map(async (student) => {
      const project = await Project.findOne({
        student: student._id,
      }).sort({ createdAt: -1 });

      const thesis = await Thesis.findOne({
        student: student._id,
      }).sort({ createdAt: -1 });

      return {
        ...student.toObject(),
        project,
        thesis,
      };
    }),
  );

  const total = studentsWithWorks.length;
  res.status(200).json({
    success: true,
    message: "Assigned students fetched successfully",
    data: {
      students: studentsWithWorks,
      total,
    },
  });
});

// mark complete
export const markComplete = asyncHandler(async (req, res, next) => {
  const { workId } = req.params;
  const { workType } = req.body;
  const teacherId = req.user._id;
  let work;

  if (workType === "thesis") {
    work = await Thesis.findById(workId);
  } else {
    work = await Project.findById(workId);
  }

  if (!work) {
    return next(new ErrorHandler("Research work not found", 404));
  }

  if (!work.supervisor || work.supervisor.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to mark complete", 403));
  }

  work.status = "completed";
  await work.save();

  await notificationServices.notifyUser(
    work.student,
    `Your ${workType === "thesis" ? "thesis" : "project"} has been marked as completed by your supervisor ${req.user.name}`,
    "general",
    "/student/status",
    "low",
  );

  res.status(200).json({
    success: true,
    message: `${
      workType === "thesis" ? "Thesis" : "Project"
    } marked as completed`,
    data: {
      work,
      workType,
    },
  });
});

// add feedback
export const addFeedback = asyncHandler(async (req, res, next) => {
  const { workId } = req.params;
  const teacherId = req.user._id;
  const { message, title, type, workType } = req.body;
  if (!message || !title) {
    return next(
      new ErrorHandler("Feedback title and message are required", 400),
    );
  }

  let work;
  if (workType === "thesis") {
    work = await Thesis.findById(workId);
  } else {
    work = await Project.findById(workId);
  }

  if (!work) {
    return next(new ErrorHandler("Research work not found", 404));
  }

  if (!work.supervisor || work.supervisor.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to add feedback", 403));
  }

  const feedback = {
    supervisorId: teacherId,
    title,
    message,
    type: type || "general",
  };

  work.feedback.push(feedback);
  await work.save();
  const latestFeedback = work.feedback[work.feedback.length - 1];
  await notificationServices.notifyUser(
    work.student,
    `New feedback from your supervisor ${req.user.name}`,
    "general",
    "/student/feedback",
    type === "positive" ? "low" : type === "negative" ? "high" : "low",
  );

  res.status(200).json({
    success: true,
    message: "Feedback posted successfully",
    data: {
      work,
      feedback: latestFeedback,
    },
  });
});

// get files
export const getFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;
  const projects = await Project.find({
    supervisor: teacherId,
  })
    .populate("student", "name email")
    .lean();

  const theses = await Thesis.find({
    supervisor: teacherId,
  })
    .populate("student", "name email")
    .lean();

  // Project files
  const projectFiles = projects.flatMap((project) =>
    (project.files || []).map((file) => ({
      ...file,
      workId: project._id,
      workType: "project",
      projectTitle: project.title,
      studentName: project.student?.name || "_",
      studentEmail: project.student?.email || "_",
    })),
  );

  // Thesis files
  const thesisFiles = theses.flatMap((thesis) =>
    (thesis.files || []).map((file) => ({
      ...file,
      workId: thesis._id,
      workType: "thesis",
      thesisTitle: thesis.title,
      studentName: thesis.student?.name || "_",
      studentEmail: thesis.student?.email || "_",
    })),
  );

  // Project and Thesis files
  const allFiles = [...projectFiles, ...thesisFiles];
  res.status(200).json({
    success: true,
    message: "Files fetched successfully",
    data: {
      files: allFiles,
    },
  });
});

// download files
export const downloadFiles = asyncHandler(async (req, res, next) => {
  const { workId, fileId } = req.params;
  const { workType } = req.query;
  const supervisorId = req.user._id;
  let work;

  if (workType === "thesis") {
    work = await Thesis.findById(workId);
  } else {
    work = await Project.findById(workId);
  }

  if (!work) {
    return next(
      new ErrorHandler(
        `${workType === "thesis" ? "Thesis" : "Project"} not found`,
        404,
      ),
    );
  }

  if (
    !work.supervisor ||
    work.supervisor.toString() !== supervisorId.toString()
  ) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }

  const file = work.files?.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  return fileServices.streamDownload(file.fileUrl, res, file.originalName);
});

// delete file
export const deleteFile = asyncHandler(async (req, res, next) => {
  const { workId, fileId } = req.params;
  const { workType } = req.body;
  const teacherId = req.user._id;
  let work;
  if (workType === "thesis") {
    work = await Thesis.findById(workId);
  } else {
    work = await Project.findById(workId);
  }

  if (!work) {
    return next(
      new ErrorHandler(
        `${workType === "thesis" ? "Thesis" : "Project"} not found`,
        404,
      ),
    );
  }

  if (!work.supervisor || work.supervisor.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorized to delete this file", 403));
  }

  const file = work.files?.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  file.deleteOne();
  await work.save();
  res.status(200).json({
    success: true,
    message: "File deleted successfully",
    data: {
      workId,
      fileId,
      workType,
    },
  });
});
