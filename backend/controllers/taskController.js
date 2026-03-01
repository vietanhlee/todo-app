import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

// GET /task/getTask
const getTask = async (req, res) => {
  try {
    const tasks = await taskModel
      .find({ userId: req.user.id })
      .sort({ pinned: -1, order: 1, createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /task/addTask
const addTask = async (req, res) => {
  const { title, description, priority, dueDate, category, tags, notes } =
    req.body;
  const userId = req.user.id;
  try {
    const count = await taskModel.countDocuments({ userId });
    const newTask = new taskModel({
      title,
      description: description || "",
      completed: false,
      userId,
      priority: priority || "medium",
      dueDate: dueDate || null,
      category: category || "General",
      tags: tags || [],
      notes: notes || "",
      order: count,
    });
    const saved = await newTask.save();
    res.status(200).json({ message: "Task added successfully", task: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /task/updateTask/:id
const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const task = await taskModel.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updates },
      { new: true },
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /task/toggleComplete/:id
const toggleComplete = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await taskModel.findOne({ _id: id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.completed = !task.completed;
    await task.save();
    res.status(200).json({ message: "Task toggled", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /task/removeTask/:id
const removeTask = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await taskModel.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /task/stats
const getStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const total = await taskModel.countDocuments({ userId });
    const completed = await taskModel.countDocuments({
      userId,
      completed: true,
    });
    const active = total - completed;
    const overdue = await taskModel.countDocuments({
      userId,
      completed: false,
      dueDate: { $lt: new Date() },
    });
    const byPriority = await taskModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const byCategory = await taskModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res
      .status(200)
      .json({ total, completed, active, overdue, byPriority, byCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /task/reorder
const reorderTasks = async (req, res) => {
  const { tasks } = req.body; // [{ id, order }]
  const userId = req.user.id;
  try {
    const ops = tasks.map(({ id, order }) =>
      taskModel.findOneAndUpdate({ _id: id, userId }, { $set: { order } }),
    );
    await Promise.all(ops);
    res.status(200).json({ message: "Reordered" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /task/:id/outcomes   – add a note/link/file outcome
const addOutcome = async (req, res) => {
  const { id } = req.params;
  const { type, title, content } = req.body;
  try {
    const task = await taskModel.findOne({ _id: id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const outcome = {
      type,
      title: title || (type === "file" ? req.file?.originalname : "Untitled"),
      content: content || "",
      filePath: req.file ? `/uploads/outcomes/${req.file.filename}` : "",
      fileSize: req.file?.size || 0,
      mimeType: req.file?.mimetype || "",
    };
    task.outcomes.push(outcome);
    await task.save();
    res.status(200).json({ message: "Outcome added", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /task/:id/outcomes/:outcomeId
const removeOutcome = async (req, res) => {
  const { id, outcomeId } = req.params;
  try {
    const task = await taskModel.findOne({ _id: id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.outcomes = task.outcomes.filter((o) => o._id.toString() !== outcomeId);
    await task.save();
    res.status(200).json({ message: "Outcome removed", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addTask,
  getTask,
  removeTask,
  updateTask,
  toggleComplete,
  getStats,
  reorderTasks,
  addOutcome,
  removeOutcome,
};
