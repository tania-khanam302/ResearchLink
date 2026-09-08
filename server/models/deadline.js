import mongoose from "mongoose";

// deadline schema
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

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created By is required"],
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
  },
  {
    timestamps: true,
  }
);

deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ project: 1 });
deadlineSchema.index({ thesis: 1 });
deadlineSchema.index({ createdBy: 1 });

export const Deadline =
  mongoose.models.Deadline ||
  mongoose.model("Deadline", deadlineSchema);
