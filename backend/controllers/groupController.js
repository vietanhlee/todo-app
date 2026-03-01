import Group from "../models/groupModel.js";
import GroupInvite from "../models/groupInviteModel.js";
import GroupTask from "../models/groupTaskModel.js";
import userModel from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";

// ── Groups ─────────────────────────────────────────────────────────────────

// GET /api/group/find/:code  — find group by short code
export const findGroupByCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const group = await Group.findOne({ code })
      .populate("owner", "name email avatar")
      .populate("members.userId", "name email avatar");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/group  — list groups the user belongs to or owns
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ owner: req.user.id }, { "members.userId": req.user.id }],
    })
      .populate("owner", "name email avatar")
      .populate("members.userId", "name email avatar");
    res.json(groups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/group  — create group
export const createGroup = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Group name required" });
  try {
    const group = await new Group({
      name,
      description: description || "",
      owner: req.user.id,
      members: [{ userId: req.user.id, role: "owner" }],
    }).save();
    const populated = await group.populate([
      { path: "owner", select: "name email avatar" },
      { path: "members.userId", select: "name email avatar" },
    ]);
    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/group/:id
export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.userId", "name email avatar");
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.hasMember(req.user.id))
      return res.status(403).json({ message: "Forbidden" });
    res.json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/group/:id  — edit group (owner/admin only)
export const updateGroup = async (req, res) => {
  const { name, description } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const member = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    if (!member || !["owner", "admin"].includes(member.role))
      return res.status(403).json({ message: "Only owner/admin can edit" });
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    await group.save();
    res.json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/group/:id/avatar  — upload group avatar (owner/admin)
export const uploadGroupAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const member = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    if (!member || !["owner", "admin"].includes(member.role))
      return res
        .status(403)
        .json({ message: "Only owner/admin can update avatar" });
    group.avatar = `/uploads/avatars/${req.file.filename}`;
    await group.save();
    const populated = await group.populate([
      { path: "owner", select: "name email avatar" },
      { path: "members.userId", select: "name email avatar" },
    ]);
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/group/:id  — delete group (owner only)
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only the owner can delete" });
    await Group.findByIdAndDelete(req.params.id);
    await GroupInvite.deleteMany({ groupId: req.params.id });
    await GroupTask.deleteMany({ groupId: req.params.id });
    res.json({ message: "Group deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/group/:id/leave  — leave group (any member except owner)
export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() === req.user.id)
      return res.status(400).json({
        message: "Owner cannot leave. Transfer ownership or delete the group.",
      });
    group.members = group.members.filter(
      (m) => m.userId.toString() !== req.user.id,
    );
    await group.save();
    res.json({ message: "Left group" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/group/:id/members/:memberId  — kick member (owner/admin)
export const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Not found" });
    const actor = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    if (!actor || !["owner", "admin"].includes(actor.role))
      return res.status(403).json({ message: "Insufficient permissions" });
    if (req.params.memberId === group.owner.toString())
      return res.status(400).json({ message: "Cannot remove the owner" });
    group.members = group.members.filter(
      (m) => m.userId.toString() !== req.params.memberId,
    );
    await group.save();
    res.json({ message: "Member removed" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ── Invitations ────────────────────────────────────────────────────────────

// POST /api/group/:id/invite  — invite by email
export const inviteMember = async (req, res) => {
  const { email, message } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const actor = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    if (!actor || !["owner", "admin"].includes(actor.role))
      return res.status(403).json({ message: "Only owner/admin can invite" });

    const invitee = await userModel.findOne({ email });
    if (invitee && group.hasMember(invitee._id))
      return res.status(400).json({ message: "User is already a member" });

    // check existing pending
    const already = await GroupInvite.findOne({
      groupId: group._id,
      inviteeEmail: email,
      status: "pending",
    });
    if (already)
      return res.status(400).json({ message: "Invitation already sent" });

    const invite = await new GroupInvite({
      groupId: group._id,
      invitedBy: req.user.id,
      inviteeId: invitee?._id || null,
      inviteeEmail: email,
      message: message || "",
      token: uuidv4(),
    }).save();

    res.status(201).json({ message: "Invitation sent", invite });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/group/invitations  — my pending invitations
export const getMyInvitations = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const invites = await GroupInvite.find({
      $or: [{ inviteeId: req.user.id }, { inviteeEmail: user.email }],
      status: "pending",
    })
      .populate("groupId", "name description")
      .populate("invitedBy", "name email");
    res.json(invites);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PATCH /api/group/invitations/:inviteId/respond  — accept or reject
export const respondInvitation = async (req, res) => {
  const { action } = req.body; // "accept" | "reject"
  if (!["accept", "reject"].includes(action))
    return res.status(400).json({ message: "action must be accept or reject" });
  try {
    const user = await userModel.findById(req.user.id);
    const invite = await GroupInvite.findOne({
      _id: req.params.inviteId,
      $or: [{ inviteeId: req.user.id }, { inviteeEmail: user.email }],
      status: "pending",
    });
    if (!invite)
      return res.status(404).json({ message: "Invitation not found" });
    if (invite.expiresAt < new Date()) {
      invite.status = "rejected";
      await invite.save();
      return res.status(410).json({ message: "Invitation expired" });
    }

    invite.status = action === "accept" ? "accepted" : "rejected";
    invite.inviteeId = req.user.id;
    await invite.save();

    if (action === "accept") {
      const group = await Group.findById(invite.groupId);
      if (group && !group.hasMember(req.user.id)) {
        group.members.push({ userId: req.user.id, role: "member" });
        await group.save();
      }
    }
    res.json({
      message: action === "accept" ? "Joined group!" : "Invitation rejected",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ── Group Tasks ────────────────────────────────────────────────────────────

// GET /api/group/:id/tasks
export const getGroupTasks = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Not found" });
    if (!group.hasMember(req.user.id))
      return res.status(403).json({ message: "Forbidden" });
    const tasks = await GroupTask.find({ groupId: req.params.id })
      .populate("createdBy", "name email avatar")
      .populate("assignments.memberId", "name email avatar")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/group/:id/tasks
export const createGroupTask = async (req, res) => {
  const { title, description, priority, dueDate, tags, assignTo } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Not found" });
    if (!group.hasMember(req.user.id))
      return res.status(403).json({ message: "Forbidden" });

    const task = new GroupTask({
      groupId: group._id,
      title,
      description: description || "",
      createdBy: req.user.id,
      priority: priority || "medium",
      dueDate: dueDate || null,
      tags: tags || [],
      assignments: [],
    });

    // assign to one or more members immediately
    if (assignTo) {
      const ids = Array.isArray(assignTo) ? assignTo : [assignTo];
      for (const uid of ids) {
        if (group.hasMember(uid)) {
          task.assignments.push({ memberId: uid, status: "pending" });
        }
      }
    }

    await task.save();
    const populated = await task.populate([
      { path: "createdBy", select: "name email avatar" },
      { path: "assignments.memberId", select: "name email avatar" },
    ]);
    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PUT /api/group/:id/tasks/:taskId  — edit (creator/owner/admin)
export const updateGroupTask = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Not found" });
    const task = await GroupTask.findOne({
      _id: req.params.taskId,
      groupId: req.params.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const actor = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    const isCreator = task.createdBy.toString() === req.user.id;
    if (!isCreator && !["owner", "admin"].includes(actor?.role))
      return res.status(403).json({ message: "Insufficient permissions" });

    const allowed = [
      "title",
      "description",
      "priority",
      "dueDate",
      "tags",
      "status",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    }
    await task.save();
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE /api/group/:id/tasks/:taskId
export const deleteGroupTask = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Not found" });
    const task = await GroupTask.findOne({
      _id: req.params.taskId,
      groupId: req.params.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    const actor = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    const isCreator = task.createdBy.toString() === req.user.id;
    if (!isCreator && !["owner", "admin"].includes(actor?.role))
      return res.status(403).json({ message: "Insufficient permissions" });
    await GroupTask.findByIdAndDelete(task._id);
    res.json({ message: "Task deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/group/:id/tasks/:taskId/assign  — assign member (owner/admin/creator)
export const assignMember = async (req, res) => {
  const { memberId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Not found" });
    const task = await GroupTask.findOne({
      _id: req.params.taskId,
      groupId: req.params.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    const actor = group.members.find(
      (m) => m.userId.toString() === req.user.id,
    );
    const isCreator = task.createdBy.toString() === req.user.id;
    if (!isCreator && !["owner", "admin"].includes(actor?.role))
      return res.status(403).json({ message: "Insufficient permissions" });
    if (!group.hasMember(memberId))
      return res.status(400).json({ message: "Target is not a group member" });
    const already = task.assignments.find(
      (a) => a.memberId.toString() === memberId,
    );
    if (already) return res.status(400).json({ message: "Already assigned" });
    task.assignments.push({ memberId, status: "pending" });
    await task.save();
    const populated = await task.populate(
      "assignments.memberId",
      "name email avatar",
    );
    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PATCH /api/group/:id/tasks/:taskId/respond — accept/reject assignment
export const respondAssignment = async (req, res) => {
  const { action, note } = req.body; // action: "accepted"|"rejected"|"done"
  const allowed = ["accepted", "rejected", "done"];
  if (!allowed.includes(action))
    return res
      .status(400)
      .json({ message: `action must be one of ${allowed.join(",")}` });
  try {
    const task = await GroupTask.findOne({
      _id: req.params.taskId,
      groupId: req.params.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    const asgn = task.assignments.find(
      (a) => a.memberId.toString() === req.user.id,
    );
    if (!asgn)
      return res
        .status(404)
        .json({ message: "You are not assigned to this task" });
    asgn.status = action;
    asgn.note = note || "";
    asgn.respondedAt = new Date();
    if (action === "accepted") task.status = "in_progress";
    if (action === "done") task.status = "done";
    await task.save();
    const populated = await task.populate(
      "assignments.memberId",
      "name email avatar",
    );
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/group/:id/tasks/:taskId/outcomes  — add outcome
export const addGroupTaskOutcome = async (req, res) => {
  const { type, title, content } = req.body;
  try {
    const task = await GroupTask.findOne({
      _id: req.params.taskId,
      groupId: req.params.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    const outcome = {
      type,
      title,
      content: content || "",
      filePath: req.file ? `/uploads/outcomes/${req.file.filename}` : "",
      fileSize: req.file?.size || 0,
      mimeType: req.file?.mimetype || "",
    };
    task.outcomes.push(outcome);
    await task.save();
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
