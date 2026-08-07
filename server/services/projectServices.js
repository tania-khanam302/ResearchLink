import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/project.js";

export const getProjectByStudent = async (studentId) => {
  return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

export const createProject = async (projectData) => {
  const project = new Project(projectData);
  await project.save();
  return project;
};

export const getProjectById = async (projectId, files) => {
  const project = await Project.findById(projectId)
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  const fileMetaData = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: file.path,
    orginalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...fileMetaData);
  await project.save();

  return project;
};

export const getAllProjects= async()=>{
  const projects = await Project.find();
  return projects;
}