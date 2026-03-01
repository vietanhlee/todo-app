import mongoose from "mongoose";

const taskInstance = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    userId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date, default: null },
    category: { type: String, default: "General" },
    tags: [{ type: String }],
    order: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    outcomes: [
      {
        type: { type: String, enum: ["note", "link", "file"], required: true },
        title: { type: String, required: true },
        content: { type: String, default: "" },
        filePath: { type: String, default: "" },
        fileSize: { type: Number, default: 0 },
        mimeType: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const taskModel = mongoose.model("Task", taskInstance);
export default taskModel;
