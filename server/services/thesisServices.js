import ErrorHandler from "../middlewares/error.js";
import { Thesis } from "../models/thesis.js";

// Get thesis by student
export const getThesisByStudent = async (studentId) => {
  return await Thesis.findOne({ student: studentId })
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email")
    .populate("feedback.supervisorId", "name email")
    .sort({ createdAt: -1 });
};

// Create thesis
export const createThesis = async (thesisData) => {
  const thesis = new Thesis(thesisData);
  await thesis.save();
  return thesis;
};

// Get thesis by id
export const getThesisById = async (thesisId) => {
  const thesis = await Thesis.findById(thesisId)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email")
    .populate("feedback.supervisorId", "name email");

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Add files To thesis
export const addFilesToThesis = async (thesisId, files) => {
  const thesis = await Thesis.findById(thesisId);

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }

  const fileMetaData = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: file.path,
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  thesis.files.push(...fileMetaData);
  await thesis.save();
  return thesis;
};

// Get all thesis
export const getAllTheses = async () => {
  return await Thesis.find()
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email")
    .populate("feedback.supervisorId", "name email")
    .sort({ createdAt: -1 });
};

// Update thesis status
export const markComplete = async (thesisId) => {
  const thesis = await Thesis.findByIdAndUpdate(
    thesisId,
    { status: "completed" },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email");

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Add feedback
export const addFeedback = async (
  thesisId,
  supervisorId,
  message,
  title,
  type,
) => {
  const thesis = await Thesis.findById(thesisId);

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }

  thesis.feedback.push({
    supervisorId,
    message,
    title,
    type,
  });

  await thesis.save();
  const latestFeedback = thesis.feedback[thesis.feedback.length - 1];
  return {
    thesis,
    latestFeedback,
  };
};

// Get thesis by Supervisor
export const getThesisBySupervisor = async (supervisorId) => {
  return await Thesis.find({
    $or: [{ supervisor: supervisorId }, { coSupervisor: supervisorId }],
  })
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email")
    .populate("feedback.supervisorId", "name email")
    .sort({ createdAt: -1 });
};

// Update thesis
export const updateThesis = async (id, updatedData) => {
  const thesis = await Thesis.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  })
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email");

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Delete thesis
export const deleteThesis = async (id) => {
  const thesis = await Thesis.findByIdAndDelete(id);

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Update Thesis status
export const updateThesisStatus = async (thesisId, status) => {
  const allowedStatus = ["pending", "approved", "rejected", "completed"];

  if (!allowedStatus.includes(status)) {
    throw new ErrorHandler("Invalid thesis status", 400);
  }

  const thesis = await Thesis.findByIdAndUpdate(
    thesisId,
    { status },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email");

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Assign supervisor
export const assignSupervisor = async (
  thesisId,
  supervisorId,
  coSupervisorId,
) => {
  const thesis = await Thesis.findByIdAndUpdate(
    thesisId,
    {
      supervisor: supervisorId,
      coSupervisor: coSupervisorId || null,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email");

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Update deadline
export const updateThesisDeadline = async (thesisId, deadline) => {
  const thesis = await Thesis.findByIdAndUpdate(
    thesisId,
    { deadline },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("coSupervisor", "name email");

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }
  return thesis;
};

// Download thesis file
export const downloadThesisFile = async (thesisId, fileId) => {
  const thesis = await Thesis.findById(thesisId);

  if (!thesis) {
    throw new ErrorHandler("Thesis not found", 404);
  }

  const file = thesis.files.id(fileId);

  if (!file) {
    throw new ErrorHandler("File not found", 404);
  }
  return {
    filePath: file.fileUrl,
    originalName: file.originalName,
  };
};
