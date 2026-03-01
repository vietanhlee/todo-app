import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "done"],
      default: "pending",
    },
    note: { type: String, default: "" },
    respondedAt: { type: Date, default: null },
  },
  { _id: false },
);

const outcomeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["note", "link", "file"], required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" }, // text/note content or URL
    filePath: { type: String, default: "" }, // uploaded file path
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
  },
  { timestamps: true },
);

const groupTaskSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "done", "cancelled"],
      default: "open",
    },
    dueDate: { type: Date, default: null },
    assignments: [assignmentSchema],
    outcomes: [outcomeSchema],
    tags: [{ type: String }],
  },
  { timestamps: true },
);

const GroupTask = mongoose.model("GroupTask", groupTaskSchema);
export default GroupTask;
