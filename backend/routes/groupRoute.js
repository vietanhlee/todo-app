import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  uploadOutcome,
  uploadGroupAvatar as uploadGroupAvatarMiddleware,
} from "../middleware/upload.js";
import {
  getMyGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  leaveGroup,
  removeMember,
  inviteMember,
  getMyInvitations,
  respondInvitation,
  getGroupTasks,
  createGroupTask,
  updateGroupTask,
  deleteGroupTask,
  assignMember,
  respondAssignment,
  addGroupTaskOutcome,
  findGroupByCode,
  uploadGroupAvatar,
} from "../controllers/groupController.js";

const router = express.Router();

// groups CRUD
router.get("/", requireAuth, getMyGroups);
router.post("/", requireAuth, createGroup);
router.get("/find/:code", requireAuth, findGroupByCode);
router.get("/:id", requireAuth, getGroup);
router.put("/:id", requireAuth, updateGroup);
router.post(
  "/:id/avatar",
  requireAuth,
  uploadGroupAvatarMiddleware,
  uploadGroupAvatar,
);
router.delete("/:id", requireAuth, deleteGroup);

// membership
router.delete("/:id/leave", requireAuth, leaveGroup);
router.delete("/:id/members/:memberId", requireAuth, removeMember);

// invitations
router.get("/invitations/mine", requireAuth, getMyInvitations);
router.post("/:id/invite", requireAuth, inviteMember);
router.patch("/invitations/:inviteId/respond", requireAuth, respondInvitation);

// group tasks
router.get("/:id/tasks", requireAuth, getGroupTasks);
router.post("/:id/tasks", requireAuth, createGroupTask);
router.put("/:id/tasks/:taskId", requireAuth, updateGroupTask);
router.delete("/:id/tasks/:taskId", requireAuth, deleteGroupTask);
router.post("/:id/tasks/:taskId/assign", requireAuth, assignMember);
router.patch("/:id/tasks/:taskId/respond", requireAuth, respondAssignment);
router.post(
  "/:id/tasks/:taskId/outcomes",
  requireAuth,
  uploadOutcome,
  addGroupTaskOutcome,
);

export default router;
