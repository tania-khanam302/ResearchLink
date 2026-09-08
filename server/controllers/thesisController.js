import * as thesisServices from "../services/thesisServices.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";

// ========================================
// Create Thesis
// ========================================
export const createThesis = asyncHandler(async (req, res, next) => {
  const {
    student,
    supervisor,
    coSupervisor,
    title,
    description,
    researchArea,
    deadline,
  } = req.body;

  const thesis = await thesisServices.createThesis({
    student,
    supervisor,
    coSupervisor,
    title,
    description,
    researchArea,
    deadline,
  });

  res.status(201).json({
    success: true,
    message: "Thesis created successfully",
    thesis,
  });
});

// ========================================
// Get All Theses
// ========================================
export const getAllTheses = asyncHandler(async (req, res, next) => {
  const theses = await thesisServices.getAllTheses();

  res.status(200).json({
    success: true,
    count: theses.length,
    theses,
  });
});

// ========================================
// Get Thesis By ID
// ========================================
export const getThesisById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const thesis = await thesisServices.getThesisById(id);

  if (!thesis) {
    return next(
      new ErrorHandler("Thesis not found", 404)
    );
  }

  res.status(200).json({
    success: true,
    thesis,
  });
});

// ========================================
// Get Thesis By Student
// ========================================
export const getThesisByStudent = asyncHandler(
  async (req, res, next) => {
    const { studentId } = req.params;

    const theses = await thesisServices.getThesisByStudent(
      studentId
    );

    res.status(200).json({
      success: true,
      count: theses.length,
      theses,
    });
  }
);

// ========================================
// Get Thesis By Supervisor
// ========================================
export const getThesisBySupervisor = asyncHandler(
  async (req, res, next) => {
    const { supervisorId } = req.params;

    const theses =
      await thesisServices.getThesisBySupervisor(
        supervisorId
      );

    res.status(200).json({
      success: true,
      count: theses.length,
      theses,
    });
  }
);

// ========================================
// Update Thesis
// ========================================
export const updateThesis = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const thesis = await thesisServices.updateThesis(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Thesis updated successfully",
      thesis,
    });
  }
);

// ========================================
// Delete Thesis
// ========================================
export const deleteThesis = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    await thesisServices.deleteThesis(id);

    res.status(200).json({
      success: true,
      message: "Thesis deleted successfully",
    });
  }
);

// ========================================
// Update Thesis Status
// ========================================
export const updateThesisStatus = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const thesis =
      await thesisServices.updateThesisStatus(
        id,
        status
      );

    res.status(200).json({
      success: true,
      message: "Thesis status updated successfully",
      thesis,
    });
  }
);

// ========================================
// Assign Supervisor
// ========================================
export const assignSupervisor = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const {
      supervisorId,
      coSupervisorId,
    } = req.body;

    const thesis =
      await thesisServices.assignSupervisor(
        id,
        supervisorId,
        coSupervisorId
      );

    res.status(200).json({
      success: true,
      message: "Supervisor assigned successfully",
      thesis,
    });
  }
);

// ========================================
// Upload Thesis Files
// ========================================
export const uploadThesisFiles = asyncHandler(
  async (req, res, next) => {
    const { thesisId } = req.params;

    if (!req.files || req.files.length === 0) {
      return next(
        new ErrorHandler(
          "Please upload at least one file",
          400
        )
      );
    }

    const thesis =
      await thesisServices.addFilesToThesis(
        thesisId,
        req.files
      );

    res.status(200).json({
      success: true,
      message: "Thesis files uploaded successfully",
      thesis,
    });
  }
);

// ========================================
// Add Thesis Feedback
// ========================================
export const addThesisFeedback = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;

    const {
      supervisorId,
      message,
      title,
      type,
    } = req.body;

    const result =
      await thesisServices.addFeedback(
        id,
        supervisorId,
        message,
        title,
        type
      );

    res.status(201).json({
      success: true,
      message: "Feedback added successfully",
      thesis: result.thesis,
      feedback: result.latestFeedback,
    });
  }
);

// ========================================
// Update Thesis Deadline
// ========================================
export const updateThesisDeadline = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const { deadline } = req.body;

    const thesis =
      await thesisServices.updateThesisDeadline(
        id,
        deadline
      );

    res.status(200).json({
      success: true,
      message: "Thesis deadline updated successfully",
      thesis,
    });
  }
);


// ========================================
// Download Thesis File
// ========================================
export const downloadThesisFile = asyncHandler(
  async (req, res, next) => {
    const { thesisId, fileId } = req.params;

    const result = await thesisServices.downloadThesisFile(
      thesisId,
      fileId
    );

    if (!result) {
      return next(
        new ErrorHandler("File not found", 404)
      );
    }

    res.download(
      result.filePath,
      result.originalName,
      (err) => {
        if (err) {
          console.error("File download error:", err);

          if (!res.headersSent) {
            next(
              new ErrorHandler(
                "File download failed",
                500
              )
            );
          }
        }
      }
    );
  }
);
