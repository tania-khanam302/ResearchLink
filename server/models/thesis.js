import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["positive", "negative", "general"],
      default: "general",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: [
        1000,
        "Feedback message cannot be more than 1000 characters",
      ],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const thesisSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    coSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: [true, "Thesis title is required"],
      trim: true,
      maxlength: [
        200,
        "Thesis title cannot exceed 200 characters",
      ],
    },

    description: {
      type: String,
      required: [true, "Thesis description is required"],
      trim: true,
      maxlength: [
        2000,
        "Thesis description cannot exceed 2000 characters",
      ],
    },

    researchArea: {
      type: String,
      required: [true, "Research area is required"],
      trim: true,
      maxlength: [
        200,
        "Research area cannot exceed 200 characters",
      ],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "completed",
      ],
      default: "pending",
    },

    files: [
      {
        fileType: {
          type: String,
          required: true,
        },

        fileUrl: {
          type: String,
          required: true,
        },

        originalName: {
          type: String,
          required: true,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    feedback: [feedbackSchema],

    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
thesisSchema.index({ student: 1 });
thesisSchema.index({ supervisor: 1 });
thesisSchema.index({ coSupervisor: 1 });
thesisSchema.index({ status: 1 });
thesisSchema.index({ researchArea: 1 });

// Model
export const Thesis =
  mongoose.models.Thesis ||
  mongoose.model("Thesis", thesisSchema);
