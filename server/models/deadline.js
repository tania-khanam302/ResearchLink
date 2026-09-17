// import mongoose from "mongoose";

// // deadline schema
// const deadlineSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Deadline name or title is required"],
//       trim: true,
//       maxlength: [
//         100,
//         "Deadline name or title cannot be more than 100 characters",
//       ],
//     },

//     dueDate: {
//       type: Date,
//       required: [true, "Due date is required"],
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Created By is required"],
//     },

//     project: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       default: null,
//     },

//     thesis: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Thesis",
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// deadlineSchema.index({ dueDate: 1 });
// deadlineSchema.index({ project: 1 });
// deadlineSchema.index({ thesis: 1 });
// deadlineSchema.index({ createdBy: 1 });

// export const Deadline =
//   mongoose.models.Deadline ||
//   mongoose.model("Deadline", deadlineSchema);





import mongoose from "mongoose";


const submissionFileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
      maxlength: [255, "File name cannot exceed 255 characters"],
    },

    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },

    fileType: {
      type: String,
      trim: true,
      default: "File",
    },

    fileSize: {
      type: Number,
      min: [0, "File size cannot be negative"],
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const deadlineSchema = new mongoose.Schema(
  {
 
    name: {
      type: String,
      required: [true, "Deadline name or title is required"],
      trim: true,
      maxlength: [
        100,
        "Deadline name or title cannot be more than 100 characters",
      ],
    },

    type: {
      type: String,
      enum: {
        values: [
          "Weekly Progress",
          "Draft Report",
          "Research Methodology",
          "Data Collection",
          "Analysis",
          "Presentation",
          "Final Report",
          "Final Submission",
          "Other",
        ],
        message: "Invalid deadline type",
      },
      default: "Weekly Progress",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Description cannot be more than 1000 characters",
      ],
      default: "",
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: "Please provide a valid due date",
      },
    },

    finalSubmitDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return value === null || value === undefined
            ? true
            : value instanceof Date && !isNaN(value.getTime());
        },
        message: "Please provide a valid final submission date",
      },
    },

    isFinal: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Deadline creator is required"],
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },


    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    thesis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thesis",
      default: null,
    },


    submission: {
      status: {
        type: String,
        enum: {
          values: [
            "Not Submitted",
            "Submitted",
            "Reviewed",
            "Overdue",
          ],
          message: "Invalid submission status",
        },
        default: "Not Submitted",
      },

      files: {
        type: [submissionFileSchema],
        default: [],
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      studentComment: {
        type: String,
        trim: true,
        maxlength: [
          2000,
          "Student comment cannot be more than 2000 characters",
        ],
        default: "",
      },

      teacherFeedback: {
        type: String,
        trim: true,
        maxlength: [
          2000,
          "Teacher feedback cannot be more than 2000 characters",
        ],
        default: "",
      },

      reviewedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);


// deadlineSchema.pre("validate", function (next) {
//   const hasProject = !!this.project;
//   const hasThesis = !!this.thesis;

//   if (!hasProject && !hasThesis) {
//     return next(
//       new mongoose.Error.ValidationError(
//         new Error(
//           "Deadline must belong to either a project or a thesis"
//         )
//       )
//     );
//   }

//   if (hasProject && hasThesis) {
//     return next(
//       new mongoose.Error.ValidationError(
//         new Error(
//           "Deadline cannot belong to both a project and a thesis"
//         )
//       )
//     );
//   }

//   next();
// });


deadlineSchema.pre("validate", function () {
  const hasProject = !!this.project;
  const hasThesis = !!this.thesis;

  if (!hasProject && !hasThesis) {
    throw new mongoose.Error.ValidationError(
      new Error(
        "Deadline must belong to either a project or a thesis"
      )
    );
  }

  if (hasProject && hasThesis) {
    throw new mongoose.Error.ValidationError(
      new Error(
        "Deadline cannot belong to both a project and a thesis"
      )
    );
  }
});

deadlineSchema.index({
  dueDate: 1,
});

deadlineSchema.index({
  project: 1,
});

deadlineSchema.index({
  thesis: 1,
});

deadlineSchema.index({
  createdBy: 1,
});

deadlineSchema.index({
  student: 1,
});

deadlineSchema.index({
  "submission.status": 1,
});


deadlineSchema.index({
  student: 1,
  dueDate: 1,
});

deadlineSchema.index({
  createdBy: 1,
  dueDate: 1,
});

export const Deadline =
  mongoose.models.Deadline ||
  mongoose.model("Deadline", deadlineSchema);
