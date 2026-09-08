import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import { Thesis } from "../models/thesis.js";
import * as thesisServices from "../services/thesisServices.js";
import * as projectServices from "../services/projectServices.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as notificationServices from "../services/notificationServices.js";

// create student
export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, type } = req.body;

  if (!name || !email || !password || !department || !type) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    type,
    role: "Student",
  });

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

// update student
export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role; //prevent role update

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Student update successfully",
    data: { user },
  });
});

// delete student
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }
  if (user.role !== "Student") {
    return next(new ErrorHandler("User is not a student", 404));
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Student delete successfully",
  });
});

// create teacher
export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, expertise } =
    req.body;
  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !expertise
  ) {
    return next(new ErrorHandler("Please provide all required feilds", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    maxStudents,
    expertise: Array.isArray(expertise)
      ? expertise
      : typeof expertise === "string" && expertise.trim() !== ""
        ? expertise.split(",").map((s) => s.trim())
        : [],
    role: "Teacher",
  });
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

// update teacher
export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role; //prevent role update

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Teacher update successfully",
    data: { user },
  });
});

// delete teacher
export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  if (user.role !== "Teacher") {
    return next(new ErrorHandler("User is not a Teacher", 404));
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Teacher delete successfully",
  });
});

// get all users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});

// create co-admin
export const createCoAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Missing fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Co-Admin",
  });

  res.status(201).json({
    success: true,
    message: "Co-Admin created successfully",
    data: { user },
  });
});

// update co-admin
export const updateCoAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await userServices.updateUser(id, req.body);

  if (!user) {
    return next(new ErrorHandler("Co-Admin not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Co-Admin updated successfully",
    data: { user },
  });
});

// delete co-admin
export const deleteCoAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await userServices.getUserById(id);

  if (!user) {
    return next(new ErrorHandler("Co-Admin not found", 404));
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Co-Admin deleted successfully",
  });
});

// get all thsis
export const getAllTheses = asyncHandler(async (req, res, next) => {
  const theses = await thesisServices.getAllTheses();

  res.status(200).json({
    success: true,
    message: "Theses fetched successfully",
    data: { theses },
  });
});

// get all projects
export const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await projectServices.getAllProjects();
  res.json({
    success: true,
    message: "Project fetched successfully",
    data: { projects },
  });
});

// get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalTeachers,
    totalCoAdmins,
    totalTheses,
    totalProjects,
    pendingRequests,
    completeProjects,
    pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    User.countDocuments({ role: "Co-Admin" }),

    Thesis.countDocuments(),
    // only approved projects Active Projects
    Project.countDocuments({ status: "approved" }),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "completed" }),
    Project.countDocuments({ status: "pending" }),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin dashboard stats fetched successfully",
    data: {
      totalStudents,
      totalTeachers,
      totalCoAdmins,
      totalTheses,
      totalProjects,
      pendingRequests,
      completeProjects,
      pendingProjects,
    },
  });
});

// assign supervisor
export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId, workId, workType } = req.body;

  if (!studentId || !supervisorId || !workId || !workType) {
    return next(
      new ErrorHandler(
        "Student ID, Supervisor ID, Work ID and Work Type are required",
        400,
      ),
    );
  }

  // project
  if (workType === "project") {
    const project = await Project.findById(workId);
    if (!project) {
      return next(new ErrorHandler("Project not found", 404));
    }
    if (project.supervisor) {
      return next(
        new ErrorHandler("Supervisor already assigned to this project", 400),
      );
    }

    if (project.status !== "approved") {
      return next(
        new ErrorHandler(
          "Project must be approved before assigning a supervisor",
          400,
        ),
      );
    }

    const { student, supervisor } = await userServices.assignSupervisorDirectly(
      studentId,
      supervisorId,
    );

    project.supervisor = supervisor._id;
    await project.save();
    await notificationServices.notifyUser(
      studentId,
      `Your supervisor ${supervisor.name} has been assigned successfully.`,
      "approval",
      "/student/supervisor",
      "low",
    );

    await notificationServices.notifyUser(
      supervisorId,
      `The student ${student.name} has been officially assigned to you for research supervision.`,
      "general",
      "/teacher/assigned-students",
      "low",
    );

    return res.status(200).json({
      success: true,
      message: "Supervisor assigned successfully",
      data: {
        student,
        supervisor,
        project,
      },
    });
  }

  // thesis
  if (workType === "thesis") {
    const thesis = await Thesis.findById(workId);

    if (!thesis) {
      return next(new ErrorHandler("Thesis not found", 404));
    }

    if (thesis.supervisor) {
      return next(
        new ErrorHandler("Supervisor already assigned to this thesis", 400),
      );
    }

    if (thesis.status !== "approved") {
      return next(
        new ErrorHandler(
          "Thesis must be approved before assigning a supervisor",
          400,
        ),
      );
    }

    const { student, supervisor } = await userServices.assignSupervisorDirectly(
      studentId,
      supervisorId,
    );

    thesis.supervisor = supervisor._id;
    await thesis.save();

    await notificationServices.notifyUser(
      studentId,
      `Your supervisor ${supervisor.name} has been assigned successfully.`,
      "approval",
      "/student/supervisor",
      "low",
    );

    await notificationServices.notifyUser(
      supervisorId,
      `The student ${student.name} has been officially assigned to you for thesis supervision.`,
      "general",
      "/teacher/assigned-students",
      "low",
    );

    return res.status(200).json({
      success: true,
      message: "Supervisor assigned successfully",
      data: {
        student,
        supervisor,
        thesis,
      },
    });
  }

  return next(new ErrorHandler("Invalid work type", 400));
});

// get project
export const getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await projectServices.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const user = req.user;
  const userRole = (user.role || "").toLowerCase();

  const userId = user._id?.toString() || user._id;

  const hasAccess =
    userRole === "admin" ||
    userRole === "co-admin" ||
    project.student?._id?.toString() === userId ||
    (project.supervisor && project.supervisor._id?.toString() === userId);

  if (!hasAccess) {
    return next(new ErrorHandler("Not authorized to fetch project", 403));
  }

  return res.status(200).json({
    success: true,
    data: { project },
  });
});

// update project status
export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = req.body;
  const user = req.user;
  const project = await projectServices.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const userRole = (user.role || "").toLowerCase();

  const userId = user._id?.toString() || user._id;

  const hasAccess =
    userRole === "admin" ||
    userRole === "co-admin" ||
    project.student?._id?.toString() === userId ||
    (project.supervisor && project.supervisor._id?.toString() === userId);

  if (!hasAccess) {
    return next(
      new ErrorHandler("Not authorized to update project status", 403),
    );
  }
  const updatedProject = await projectServices.updateProject(id, updatedData);
  return res.status(200).json({
    success: true,
    message: "Project status Updated successfully",
    data: { project: updatedProject },
  });
});

// delete project
export const deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await projectServices.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  await projectServices.deleteProject(id);
  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});
