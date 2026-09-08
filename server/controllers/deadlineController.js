import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Deadline } from "../models/deadline.js";
import { Project } from "../models/project.js";
import { Thesis } from "../models/thesis.js";



// create Deadline
export const createDeadline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, dueDate, project, thesis } = req.body;

  if (!name || !dueDate) {
    return next(new ErrorHandler("Name and due date are required", 400));
  }

  // project deadline
  if (project) {
    const projectData = await Project.findById(project);

    if (!projectData) {
      return next(new ErrorHandler("Project not found", 404));
    }

    const deadline = await Deadline.create({
      name,
      dueDate: new Date(dueDate),
      createdBy: req.user._id,
      project: projectData._id,
    });

    // Update project's deadline
    await Project.findByIdAndUpdate(
      projectData._id,
      {
        deadline: new Date(dueDate),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    await deadline.populate([
      {
        path: "createdBy",
        select: "name email",
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
    ]);

    return res.status(201).json({
      success: true,
      message: "Project deadline created successfully",
      data: {
        deadline,
      },
    });
  }

  // thesis deadline
  if (thesis) {
    const thesisData = await Thesis.findById(thesis);

    if (!thesisData) {
      return next(new ErrorHandler("Thesis not found", 404));
    }

    const deadline = await Deadline.create({
      name,
      dueDate: new Date(dueDate),
      createdBy: req.user._id,
      thesis: thesisData._id,
    });

    // Update thesis deadline
    await Thesis.findByIdAndUpdate(
      thesisData._id,
      {
        deadline: new Date(dueDate),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    await deadline.populate([
      {
        path: "createdBy",
        select: "name email",
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

    return res.status(201).json({
      success: true,
      message: "Thesis deadline created successfully",
      data: {
        deadline,
      },
    });
  }

  return next(new ErrorHandler("Please provide either project or thesis", 400));
});
