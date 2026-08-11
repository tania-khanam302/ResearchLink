import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectServices from "../services/projectServices.js";

import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import * as notificationServices from "../services/notificationServices.js";


// createStudent ===============
export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please provide all required feilds", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Student",
  });
  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

// updateStudent ===============
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

// deleteStudent ===============
export const deleteStudent = asyncHandler(async (req, res, nect) => {
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

// createTeacher ===============
export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, expertise} =
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
      : typeof expertise=== "string" && expertise.trim() !== ""
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


// updateTeacher ===============
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

// deleteTeacher ===============
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

// getAllUsers
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.getAllUsers();
  // console.log(users);
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});


// createCoAdmin =====
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

// updateCoAdmin
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

// deleteCoAdmin
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

export const getAllProjects = asyncHandler (async(req, res, next) =>{
  const projects = await projectServices.getAllProjects();
  res.json({
    success:true,
    message:"Project fetched successfully",
    data:{projects},
  })
});

// get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalTeachers,
    totalCoAdmins,
    totalProjects,
    pendingRequests,
    completeProjects,
    pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    User.countDocuments({ role: "Co-Admin" }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "complete" }),
    Project.countDocuments({ status: "pending" }),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin dashbiard stats fetched successfully",
    data: {
      totalStudents,
      totalTeachers,
      totalCoAdmins,
      totalProjects,
      pendingRequests,
      completeProjects,
      pendingProjects,
    },
  });
});

// assignSupervisor
export const assignSupervisor = asyncHandler(async (req, res, next) => {
const { studentId, supervisorId } = req.body;

  if (!studentId || !supervisorId) {
        return next (
        new ErrorHandler("Student ID and Supervisor ID are required", 400)
    )
  }
  const project = await project.findOne({ student: studentId });


if (!project) {
    return next(new ErrorHandler("Project not found", 404));
}

if (project.supervisor !== null) {
    return next(new ErrorHandler("Supervisor already assigned to this student", 400));
}

 if (project.status !== "approved") {
    return next(new ErrorHandler("Project is not in a approved yet", 400));
 } else if (project.status === "pending" || project.status === "rejected") 
 {
    return next(
        new ErrorHandler("Project is not in a approved yet", 400)
    );
 }
 
 const { student, supervisor } = await userServices.assignSupervices.assignSupervisorDirectly(
    studentId,
     supervisorId
    );

    project.supervisor = supervisorId; // supervisor
    await project.save();

    await notificationServices.notifyUser(
        supervisorId,
        `You have been assigned a supervisor ${student.name}`,
        "approval",
        "/students/status",
        "low"
    );
    
    await notificationServices.notifyUser(
        supervisorId,
        `The student ${student.name} has been officially assigned to you for Reacharch Link supervision.`,
        "general",
        "/teachers/status",
        "low"
    );
   res.status(200).json({
    success:true,
    message: "Supervisor assigned successfully",
    date:{student, supervisor},
   }) 

});