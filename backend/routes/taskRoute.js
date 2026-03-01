import express from "express";
import {
  addTask,
  getTask,
  removeTask,
  updateTask,
  toggleComplete,
  getStats,
  reorderTasks,
  addOutcome,
  removeOutcome,
} from "../controllers/taskController.js";
import requireAuth from "../middleware/requireAuth.js";
import { uploadOutcome } from "../middleware/upload.js";

const router = express.Router();

router.get("/getTask", requireAuth, getTask);
router.get("/stats", requireAuth, getStats);
router.post("/addTask", requireAuth, addTask);
router.put("/updateTask/:id", requireAuth, updateTask);
router.patch("/toggle/:id", requireAuth, toggleComplete);
router.delete("/removeTask/:id", requireAuth, removeTask);
router.patch("/reorder", requireAuth, reorderTasks);
// outcomes
router.post("/:id/outcomes", requireAuth, uploadOutcome, addOutcome);
router.delete("/:id/outcomes/:outcomeId", requireAuth, removeOutcome);

export default router;
