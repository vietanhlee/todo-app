import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroups } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { Group, GroupTask, MemberRole } from "../types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiUserAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiFlagLine,
  RiCalendarLine,
  RiUserLine,
  RiGroupLine,
  RiTaskLine,
} from "react-icons/ri";

const PRIORITY_COLORS = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-green-500",
} as const;
const STATUS_COLORS = {
  open: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
} as const;

// ── GroupDetailPage ────────────────────────────────────────────────────────
const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    groups,
    fetchGroups,
    deleteGroup,
    leaveGroup,
    removeMember,
    inviteMember,
    getGroupTasks,
    createGroupTask,
    updateGroupTask,
    deleteGroupTask,
    assignMember,
    respondAssignment,
  } = useGroups();

  const [group, setGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [tab, setTab] = useState<"tasks" | "members">("tasks");
  const [loading, setLoading] = useState(true);

  // invite
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);

  // create task
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskAssign, setNewTaskAssign] = useState<string[]>([]);
  const [taskSaving, setTaskSaving] = useState(false);

  // respond
  const [respondNote, setRespondNote] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const found = groups.find((g) => g._id === id);
        if (found) setGroup(found);
        else await fetchGroups();
        const ts = await getGroupTasks(id);
        setTasks(ts);
      } catch {
        toast.error("Failed to load group");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const found = groups.find((g) => g._id === id);
    if (found) setGroup(found);
  }, [groups, id]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!group)
    return (
      <div className="text-center py-20 text-gray-500">Group not found</div>
    );

  const myRole: MemberRole =
    group.members.find((m) => (m.userId as any)._id === user?._id)?.role ??
    "member";
  const canManage = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteMember(group._id, inviteEmail);
      setInviteEmail("");
      setShowInvite(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setInviting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskSaving(true);
    try {
      const t = await createGroupTask(group._id, {
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        dueDate: newTaskDue || undefined,
        assignTo: newTaskAssign.length ? newTaskAssign : undefined,
      } as any);
      setTasks((prev) => [t, ...prev]);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("medium");
      setNewTaskDue("");
      setNewTaskAssign([]);
      setShowCreateTask(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setTaskSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteGroupTask(group._id, taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    toast.success("Task deleted");
  };

  const handleRespond = async (taskId: string, action: string) => {
    const note = respondNote[taskId] ?? "";
    const updated = await respondAssignment(group._id, taskId, action, note);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    const updated = await updateGroupTask(group._id, taskId, { status } as any);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
  };

  const handleAssign = async (taskId: string, memberId: string) => {
    const updated = await assignMember(group._id, taskId, memberId);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
  };

  const myTasks = tasks.filter((t) =>
    t.assignments.some(
      (a) =>
        (a.memberId as any)._id === user?._id ||
        (a.memberId as any) === user?._id,
    ),
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/groups")}
          className="btn-ghost p-2 mt-0.5 flex-shrink-0"
        >
          <RiArrowLeftLine size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {group.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {canManage && (
            <button
              onClick={() => setShowInvite((v) => !v)}
              className="btn-primary text-sm gap-1.5 py-1.5"
            >
              <RiUserAddLine size={15} /> Invite
            </button>
          )}
          {isOwner ? (
            <button
              onClick={async () => {
                if (confirm("Delete group?")) {
                  await deleteGroup(group._id);
                  navigate("/groups");
                }
              }}
              className="btn-ghost text-red-500 text-sm py-1.5"
            >
              <RiDeleteBinLine size={15} />
            </button>
          ) : (
            <button
              onClick={async () => {
                if (confirm("Leave group?")) {
                  await leaveGroup(group._id);
                  navigate("/groups");
                }
              }}
              className="btn-ghost text-sm py-1.5 text-red-500"
            >
              Leave
            </button>
          )}
        </div>
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="card p-4 flex gap-2 fade-up">
          <RiUserAddLine
            className="text-gray-400 mt-2.5 flex-shrink-0"
            size={16}
          />
          <input
            className="input flex-1"
            type="email"
            placeholder="Enter email to invite…"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowInvite(false)}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={inviting}
            className="btn-primary text-sm py-1.5"
          >
            {inviting ? "Sending…" : "Send Invite"}
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["tasks", "members"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${tab === t ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            {t === "tasks" ? (
              <>
                <RiTaskLine className="inline mr-1.5" size={14} />
                {tasks.length} Tasks
              </>
            ) : (
              <>
                <RiGroupLine className="inline mr-1.5" size={14} />
                {group.members.length} Members
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── Tasks Tab ───────────────────────────────────── */}
      {tab === "tasks" && (
        <div className="space-y-4">
          {/* My assigned tasks alert */}
          {myTasks.some((t) =>
            t.assignments.some(
              (a) =>
                ((a.memberId as any)._id === user?._id ||
                  (a.memberId as any) === user?._id) &&
                a.status === "pending",
            ),
          ) && (
            <div className="card p-4 border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                ⚡ Tasks awaiting your response
              </p>
              <div className="space-y-2">
                {myTasks
                  .filter((t) =>
                    t.assignments.some(
                      (a) =>
                        ((a.memberId as any)._id === user?._id ||
                          (a.memberId as any) === user?._id) &&
                        a.status === "pending",
                    ),
                  )
                  .map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      <span className="text-sm flex-1 font-medium text-gray-800 dark:text-gray-200">
                        {t.title}
                      </span>
                      <input
                        className="input text-xs py-1 w-40"
                        placeholder="Note (optional)"
                        value={respondNote[t._id] ?? ""}
                        onChange={(e) =>
                          setRespondNote((prev) => ({
                            ...prev,
                            [t._id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleRespond(t._id, "accepted")}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 font-semibold"
                      >
                        <RiCheckLine size={12} /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(t._id, "rejected")}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-semibold"
                      >
                        <RiCloseLine size={12} /> Reject
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Create task button */}
          {!showCreateTask && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <RiAddLine size={16} />{" "}
              <span className="text-sm font-medium">Add task to group…</span>
            </button>
          )}

          {/* Create task form */}
          {showCreateTask && (
            <form
              onSubmit={handleCreateTask}
              className="card p-5 space-y-3 fade-up"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white">
                New Group Task
              </h3>
              <input
                className="input"
                placeholder="Task title *"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                autoFocus
              />
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Description"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Priority
                  </label>
                  <select
                    className="input text-sm"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Due Date
                  </label>
                  <input
                    className="input text-sm"
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                  />
                </div>
              </div>
              {/* Assign to members */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Assign to (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.members
                    .filter((m) => (m.userId as any)._id !== user?._id)
                    .map((m) => {
                      const uid = (m.userId as any)._id;
                      const checked = newTaskAssign.includes(uid);
                      return (
                        <button
                          key={uid}
                          type="button"
                          onClick={() =>
                            setNewTaskAssign((prev) =>
                              checked
                                ? prev.filter((id) => id !== uid)
                                : [...prev, uid],
                            )
                          }
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${checked ? "bg-primary-500 border-primary-500 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"}`}
                        >
                          {checked && <RiCheckLine size={11} />}
                          {(m.userId as any).name}
                        </button>
                      );
                    })}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskSaving}
                  className="btn-primary text-sm py-1.5"
                >
                  {taskSaving ? "Creating…" : "Create Task"}
                </button>
              </div>
            </form>
          )}

          {/* Task list */}
          {tasks.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              No tasks yet. Create the first one!
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <GroupTaskCard
                  key={t._id}
                  task={t}
                  group={group}
                  userId={user?._id}
                  canManage={canManage}
                  onDelete={() => handleDeleteTask(t._id)}
                  onStatusChange={(s) => handleStatusChange(t._id, s)}
                  onAssign={(memberId) => handleAssign(t._id, memberId)}
                  onRespond={(action, note) => {
                    setRespondNote((prev) => ({ ...prev, [t._id]: note }));
                    handleRespond(t._id, action);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Members Tab ─────────────────────────────────── */}
      {tab === "members" && (
        <div className="space-y-2">
          {group.members.map((m) => {
            const u = m.userId as any;
            return (
              <div key={u._id} className="card p-4 flex items-center gap-3">
                {u.avatar ? (
                  <img
                    src={
                      u.avatar.startsWith("/uploads")
                        ? `http://localhost:5000${u.avatar}`
                        : u.avatar
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                    {u.name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span
                  className={`badge text-xs ${m.role === "owner" ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
                >
                  {m.role}
                </span>
                {canManage && u._id !== user?._id && m.role !== "owner" && (
                  <button
                    onClick={() => removeMember(group._id, u._id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <RiDeleteBinLine size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── GroupTaskCard ──────────────────────────────────────────────────────────
const GroupTaskCard: React.FC<{
  task: GroupTask;
  group: Group;
  userId?: string;
  canManage: boolean;
  onDelete: () => void;
  onStatusChange: (s: string) => void;
  onAssign: (m: string) => void;
  onRespond: (a: string, note: string) => void;
}> = ({
  task,
  group,
  userId,
  canManage,
  onDelete,
  onStatusChange,
  onAssign,
  onRespond,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [assignId, setAssignId] = useState("");
  const [note, setNote] = useState("");
  const myAssignment = task.assignments.find(
    (a) => (a.memberId as any)._id === userId || (a.memberId as any) === userId,
  );
  const isCreator =
    (task.createdBy as any)?._id === userId ||
    (task.createdBy as any) === userId;

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {task.title}
            </span>
            <span className={`badge text-xs ${STATUS_COLORS[task.status]}`}>
              {task.status.replace("_", " ")}
            </span>
            <RiFlagLine className={PRIORITY_COLORS[task.priority]} size={13} />
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <RiUserLine size={11} />
              {(task.createdBy as any)?.name}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <RiCalendarLine size={11} />
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
            <span>{task.assignments.length} assigned</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {(canManage || isCreator) && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-gray-600 text-xs px-1.5"
          >
            {expanded ? "▲" : "▼"}
          </button>
          {(canManage || isCreator) && (
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-600"
            >
              <RiDeleteBinLine size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3 fade-up">
          {/* Assignments */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">
              Assignments
            </p>
            {task.assignments.length === 0 ? (
              <p className="text-xs text-gray-400">No assignments yet</p>
            ) : (
              <div className="space-y-1">
                {task.assignments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-700 dark:text-gray-300">
                      {(a.memberId as any)?.name}
                    </span>
                    <span
                      className={`badge ${a.status === "accepted" || a.status === "done" ? "bg-green-100 text-green-700" : a.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}
                    >
                      {a.status}
                    </span>
                    {a.note && (
                      <span className="text-gray-400 italic">"{a.note}"</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My assignment response */}
          {myAssignment?.status === "pending" && (
            <div className="flex items-center gap-2 flex-wrap bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                You were assigned:
              </span>
              <input
                className="input text-xs py-0.5 flex-1 min-w-[120px]"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                onClick={() => onRespond("accepted", note)}
                className="text-xs px-2 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 font-semibold"
              >
                Accept
              </button>
              <button
                onClick={() => onRespond("rejected", note)}
                className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-semibold"
              >
                Reject
              </button>
            </div>
          )}

          {/* Mark done if accepted */}
          {myAssignment?.status === "accepted" && task.status !== "done" && (
            <button
              onClick={() => onRespond("done", "")}
              className="text-xs px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 font-semibold flex items-center gap-1"
            >
              <RiCheckLine size={12} /> Mark as Done
            </button>
          )}

          {/* Assign member (owner/admin/creator) */}
          {(canManage || isCreator) && (
            <div className="flex items-center gap-2">
              <select
                className="input text-xs py-1 flex-1"
                value={assignId}
                onChange={(e) => setAssignId(e.target.value)}
              >
                <option value="">Assign to member…</option>
                {group.members
                  .filter(
                    (m) =>
                      !task.assignments.some(
                        (a) =>
                          ((a.memberId as any)._id || a.memberId) ===
                          (m.userId as any)._id,
                      ),
                  )
                  .map((m) => (
                    <option
                      key={(m.userId as any)._id}
                      value={(m.userId as any)._id}
                    >
                      {(m.userId as any).name}
                    </option>
                  ))}
              </select>
              <button
                disabled={!assignId}
                onClick={() => {
                  onAssign(assignId);
                  setAssignId("");
                }}
                className="btn-primary text-xs py-1 px-3 disabled:opacity-40"
              >
                Assign
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;
