import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/project.js";

// get project by student
export const getProjectByStudent = async (studentId) => {
  return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

// create project
export const createProject = async (projectData) => {
  const project = new Project(projectData);
  await project.save();
  return project;
};

// get project by id
export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name email");
  return project;
};

// add files to project
export const addfilesToProject = async (projectId, files) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  console.log("UPLOAD PROJECT:", {
    id: project._id,
    type: project.type,
    title: project.title,
  });

  const fileMetaData = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: file.path,
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...fileMetaData);
  await project.save();
  return project;
};

// get all projects
export const getAllProjects = async () => {
  const projects = await Project.find()
    .populate("student", "name email type")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  return projects.filter((project) => project.student?.type === "Project");
};

// mark complete
export const markComplete = async (projectId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: "completed" },
    { new: true, runValidators: true },
  )
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

export const addFeedback = async (
  projectId,
  supervisorId,
  message,
  title,
  type,
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  project.feedback.push({
    supervisorId,
    message,
    title,
    type,
  });

  await project.save();
  const latestFeedback = project.feedback[project.feedback.length - 1];
  return { project, latestFeedback };
};

// get project by supervisor
export const getProjectBySupervisor = async (supervisorId) => {
  return await Project.find({ supervisor: supervisorId })
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
};

// update project
export const updateProject = async (id, updatedData) => {
  const project = await Project.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  })
    .populate("student", "name email")
    .populate("supervisor", "name email");
  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

export const deleteProject = async (id) => {
  return await Project.findByIdAndDelete(id);
};
