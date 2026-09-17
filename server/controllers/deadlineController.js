// import { asyncHandler } from "../middlewares/asyncHandler.js";
// import ErrorHandler from "../middlewares/error.js";
// import { Deadline } from "../models/deadline.js";
// import { Project } from "../models/project.js";
// import { Thesis } from "../models/thesis.js";



// create Deadline
// export const createDeadline = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { name, dueDate, project, thesis } = req.body;

//   if (!name || !dueDate) {
//     return next(new ErrorHandler("Name and due date are required", 400));
//   }

//   // project deadline
//   if (project) {
//     const projectData = await Project.findById(project);

//     if (!projectData) {
//       return next(new ErrorHandler("Project not found", 404));
//     }

//     const deadline = await Deadline.create({
//       name,
//       dueDate: new Date(dueDate),
//       createdBy: req.user._id,
//       project: projectData._id,
//     });

//     // Update project's deadline
//     await Project.findByIdAndUpdate(
//       projectData._id,
//       {
//         deadline: new Date(dueDate),
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     await deadline.populate([
//       {
//         path: "createdBy",
//         select: "name email",
//       },
//       {
//         path: "project",
//         select: "title student supervisor",
//         populate: [
//           {
//             path: "student",
//             select: "name email department",
//           },
//           {
//             path: "supervisor",
//             select: "name email",
//           },
//         ],
//       },
//     ]);

//     return res.status(201).json({
//       success: true,
//       message: "Project deadline created successfully",
//       data: {
//         deadline,
//       },
//     });
//   }

//   // thesis deadline
//   if (thesis) {
//     const thesisData = await Thesis.findById(thesis);

//     if (!thesisData) {
//       return next(new ErrorHandler("Thesis not found", 404));
//     }

//     const deadline = await Deadline.create({
//       name,
//       dueDate: new Date(dueDate),
//       createdBy: req.user._id,
//       thesis: thesisData._id,
//     });

//     // Update thesis deadline
//     await Thesis.findByIdAndUpdate(
//       thesisData._id,
//       {
//         deadline: new Date(dueDate),
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     await deadline.populate([
//       {
//         path: "createdBy",
//         select: "name email",
//       },
//       {
//         path: "thesis",
//         select: "title student supervisor",
//         populate: [
//           {
//             path: "student",
//             select: "name email department",
//           },
//           {
//             path: "supervisor",
//             select: "name email",
//           },
//         ],
//       },
//     ]);

//     return res.status(201).json({
//       success: true,
//       message: "Thesis deadline created successfully",
//       data: {
//         deadline,
//       },
//     });
//   }

//   return next(new ErrorHandler("Please provide either project or thesis", 400));
// });




import mongoose from "mongoose";

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



export const createDeadline = asyncHandler(
  async (req, res, next) => {
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
      return next(
        new ErrorHandler(
          "Deadline name or title is required",
          400
        )
      );
    }

    if (!dueDate) {
      return next(
        new ErrorHandler(
          "Due date is required",
          400
        )
      );
    }



    let projectId = project || null;
    let thesisId = thesis || null;


    if (!projectId && !thesisId && id) {
      if (!isValidObjectId(id)) {
        return next(
          new ErrorHandler(
            "Invalid project or thesis ID",
            400
          )
        );
      }

      const projectExists =
        await Project.exists({
          _id: id,
        });

      if (projectExists) {
        projectId = id;
      } else {
        const thesisExists =
          await Thesis.exists({
            _id: id,
          });

        if (thesisExists) {
          thesisId = id;
        }
      }
    }


    if (!projectId && !thesisId) {
      return next(
        new ErrorHandler(
          "Please provide either project or thesis",
          400
        )
      );
    }


    if (projectId && thesisId) {
      return next(
        new ErrorHandler(
          "Deadline cannot belong to both project and thesis",
          400
        )
      );
    }



    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedDueDate.getTime())) {
      return next(
        new ErrorHandler(
          "Please provide a valid due date",
          400
        )
      );
    }


    if (parsedDueDate <= new Date()) {
      return next(
        new ErrorHandler(
          "Due date must be in the future",
          400
        )
      );
    }

    let parsedFinalSubmitDate = null;

    if (finalSubmitDate) {
      parsedFinalSubmitDate = new Date(finalSubmitDate);

      if (isNaN(parsedFinalSubmitDate.getTime())) {
        return next(
          new ErrorHandler(
            "Please provide a valid final submission date",
            400
          )
        );
      }

      if (parsedFinalSubmitDate < parsedDueDate) {
        return next(
          new ErrorHandler(
            "Final submission date cannot be earlier than the deadline date",
            400
          )
        );
      }
    }

    if (projectId) {
      if (!isValidObjectId(projectId)) {
        return next(
          new ErrorHandler(
            "Invalid project ID",
            400
          )
        );
      }

      const projectData =
        await Project.findById(projectId)
          .populate(
            "student",
            "name email department"
          )
          .populate(
            "supervisor",
            "name email"
          );

      if (!projectData) {
        return next(
          new ErrorHandler(
            "Project not found",
            404
          )
        );
      }

      if (!projectData.student) {
        return next(
          new ErrorHandler(
            "No student assigned to this project",
            400
          )
        );
      }


      const isSupervisor =
        projectData.supervisor &&
        projectData.supervisor._id.toString() ===
          req.user._id.toString();

      if (!isSupervisor) {
        return next(
          new ErrorHandler(
            "You are not allowed to create a deadline for this project",
            403
          )
        );
      }



      const existingDeadline =
        await Deadline.findOne({
          project: projectData._id,
          name: name.trim(),
        });

      if (existingDeadline) {
        return next(
          new ErrorHandler(
            "A deadline with this name already exists for this project",
            409
          )
        );
      }


      const deadline =
        await Deadline.create({
          name: name.trim(),

          type:
            type || "Weekly Progress",

          description:
            description?.trim() || "",

          dueDate: parsedDueDate,

          finalSubmitDate:
            parsedFinalSubmitDate,

          isFinal:
            Boolean(isFinal),

          createdBy:
            req.user._id,

          student:
            projectData.student._id,

          project:
            projectData._id,

          thesis: null,
        });

      await populateDeadline(
        deadline
      );

      return res.status(201).json({
        success: true,

        message:
          "Project deadline created successfully",

        data: {
          deadline,
        },
      });
    }

    if (thesisId) {
      if (!isValidObjectId(thesisId)) {
        return next(
          new ErrorHandler(
            "Invalid thesis ID",
            400
          )
        );
      }

      const thesisData =
        await Thesis.findById(thesisId)
          .populate(
            "student",
            "name email department"
          )
          .populate(
            "supervisor",
            "name email"
          );

      if (!thesisData) {
        return next(
          new ErrorHandler(
            "Thesis not found",
            404
          )
        );
      }

      if (!thesisData.student) {
        return next(
          new ErrorHandler(
            "No student assigned to this thesis",
            400
          )
        );
      }


      const isSupervisor =
        thesisData.supervisor &&
        thesisData.supervisor._id.toString() ===
          req.user._id.toString();

      if (!isSupervisor) {
        return next(
          new ErrorHandler(
            "You are not allowed to create a deadline for this thesis",
            403
          )
        );
      }



      const existingDeadline =
        await Deadline.findOne({
          thesis: thesisData._id,
          name: name.trim(),
        });

      if (existingDeadline) {
        return next(
          new ErrorHandler(
            "A deadline with this name already exists for this thesis",
            409
          )
        );
      }



      const deadline =
        await Deadline.create({
          name: name.trim(),

          type:
            type || "Weekly Progress",

          description:
            description?.trim() || "",

          dueDate: parsedDueDate,

          finalSubmitDate:
            parsedFinalSubmitDate,

          isFinal:
            Boolean(isFinal),

          createdBy:
            req.user._id,

          student:
            thesisData.student._id,

          project: null,

          thesis:
            thesisData._id,
        });

      await populateDeadline(
        deadline
      );

      return res.status(201).json({
        success: true,

        message:
          "Thesis deadline created successfully",

        data: {
          deadline,
        },
      });
    }
  }
);


export const getTeacherDeadlines =
  asyncHandler(
    async (req, res) => {
      const deadlines =
        await Deadline.find({
          createdBy: req.user._id,
        })
          .populate({
            path: "student",
            select:
              "name email department",
          })

          .populate({
            path: "project",
            select:
              "title student supervisor",

            populate: [
              {
                path: "student",
                select:
                  "name email department",
              },

              {
                path: "supervisor",
                select:
                  "name email",
              },
            ],
          })

          .populate({
            path: "thesis",
            select:
              "title student supervisor",

            populate: [
              {
                path: "student",
                select:
                  "name email department",
              },

              {
                path: "supervisor",
                select:
                  "name email",
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
    }
  );

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

export const getStudentDeadlines =
  asyncHandler(
    async (req, res) => {
      const deadlines =
        await Deadline.find({
          student: req.user._id,
        })
          .populate({
            path: "project",
            select:
              "title supervisor",

            populate: {
              path: "supervisor",
              select:
                "name email",
            },
          })

          .populate({
            path: "thesis",
            select:
              "title supervisor",

            populate: {
              path: "supervisor",
              select:
                "name email",
            },
          })

          .sort({
            dueDate: 1,
          });


      const now = new Date();

      const overdueIds = deadlines
        .filter(
          (deadline) =>
            deadline.dueDate < now &&
            deadline.submission.status ===
              "Not Submitted"
        )
        .map(
          (deadline) =>
            deadline._id
        );

      if (overdueIds.length > 0) {
        await Deadline.updateMany(
          {
            _id: {
              $in: overdueIds,
            },

            "submission.status":
              "Not Submitted",
          },

          {
            $set: {
              "submission.status":
                "Overdue",
            },
          }
        );

        deadlines.forEach(
          (deadline) => {
            if (
              overdueIds.some(
                (id) =>
                  id.toString() ===
                  deadline._id.toString()
              )
            ) {
              deadline.submission.status =
                "Overdue";
            }
          }
        );
      }

      return res.status(200).json({
        success: true,

        data: {
          deadlines,
        },
      });
    }
  );

export const submitDeadline =
  asyncHandler(
    async (req, res, next) => {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return next(
          new ErrorHandler(
            "Invalid deadline ID",
            400
          )
        );
      }

      const deadline =
        await Deadline.findById(id);

      if (!deadline) {
        return next(
          new ErrorHandler(
            "Deadline not found",
            404
          )
        );
      }


      if (
        deadline.student.toString() !==
        req.user._id.toString()
      ) {
        return next(
          new ErrorHandler(
            "You are not allowed to submit this deadline",
            403
          )
        );
      }

    

      if (
        deadline.submission.status ===
        "Reviewed"
      ) {
        return next(
          new ErrorHandler(
            "This submission has already been reviewed",
            400
          )
        );
      }


      const now = new Date();

      if (
        now > deadline.dueDate &&
        deadline.submission.status !==
          "Submitted"
      ) {
        deadline.submission.status =
          "Overdue";

        await deadline.save();

        return next(
          new ErrorHandler(
            "Submission deadline has passed",
            400
          )
        );
      }



      const uploadedFiles =
        Array.isArray(req.files)
          ? req.files
          : [];

      const files =
        uploadedFiles
          .map((file) => {
            const fileUrl =
              file.path ||
              file.secure_url ||
              file.location ||
              file.url ||
              "";

            if (!fileUrl) {
              return null;
            }

            return {
              originalName:
                file.originalname ||
                file.filename ||
                "File",

              fileUrl,

              fileType:
                file.mimetype ||
                "File",

              fileSize:
                Number(file.size) || 0,
            };
          })
          .filter(Boolean);

   
      const studentComment =
        typeof req.body.studentComment ===
        "string"
          ? req.body.studentComment.trim()
          : "";

      if (
        files.length === 0 &&
        !studentComment
      ) {
        return next(
          new ErrorHandler(
            "Please upload a file or write a submission comment",
            400
          )
        );
      }



      if (files.length > 0) {
        deadline.submission.files.push(
          ...files
        );
      }

   

      deadline.submission.studentComment =
        studentComment;

      deadline.submission.submittedAt =
        new Date();

      deadline.submission.status =
        "Submitted";

      deadline.submission.teacherFeedback =
        "";

      deadline.submission.reviewedAt =
        null;

      await deadline.save();

      await populateDeadline(
        deadline
      );

      return res.status(200).json({
        success: true,

        message:
          "Work submitted successfully",

        data: {
          deadline,
        },
      });
    }
  );


export const reviewDeadline =
  asyncHandler(
    async (req, res, next) => {
      const { id } = req.params;

      const {
        teacherFeedback,
      } = req.body;

      if (!isValidObjectId(id)) {
        return next(
          new ErrorHandler(
            "Invalid deadline ID",
            400
          )
        );
      }


      const feedback =
        typeof teacherFeedback ===
        "string"
          ? teacherFeedback.trim()
          : "";

      if (!feedback) {
        return next(
          new ErrorHandler(
            "Teacher feedback is required",
            400
          )
        );
      }


      const deadline =
        await Deadline.findById(id);

      if (!deadline) {
        return next(
          new ErrorHandler(
            "Deadline not found",
            404
          )
        );
      }


      if (
        deadline.createdBy.toString() !==
        req.user._id.toString()
      ) {
        return next(
          new ErrorHandler(
            "You are not allowed to review this submission",
            403
          )
        );
      }

 
      if (
        deadline.submission.status ===
        "Not Submitted"
      ) {
        return next(
          new ErrorHandler(
            "Student has not submitted yet",
            400
          )
        );
      }

      /**
       * Already reviewed
       */
      if (
        deadline.submission.status ===
        "Reviewed"
      ) {
        return next(
          new ErrorHandler(
            "This submission has already been reviewed",
            400
          )
        );
      }



      deadline.submission.teacherFeedback =
        feedback;

      deadline.submission.status =
        "Reviewed";

      deadline.submission.reviewedAt =
        new Date();

      await deadline.save();

      await populateDeadline(
        deadline
      );

      return res.status(200).json({
        success: true,

        message:
          "Submission reviewed successfully",

        data: {
          deadline,
        },
      });
    }
  );
