import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGroups } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import {
  RiAddLine,
  RiGroupLine,
  RiMailLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiTimeLine,
} from "react-icons/ri";

const GroupsPage: React.FC = () => {
  const { groups, invitations, loadingGroups, createGroup, respondInvitation } =
    useGroups();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createGroup({ name, description: desc });
      setName("");
      setDesc("");
      setShowCreate(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Groups
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Collaborate on tasks with your team
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="btn-primary gap-1.5"
        >
          <RiAddLine size={16} /> New Group
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card p-5 fade-up">
          <form onSubmit={handleCreate} className="space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Create New Group
            </h3>
            <input
              className="input"
              placeholder="Group name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="btn-primary text-sm py-1.5"
              >
                {saving ? "Creating…" : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <RiMailLine className="text-primary-500" size={18} />
            Pending Invitations
            <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {invitations.length}
            </span>
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <RiGroupLine
                  className="text-primary-500 flex-shrink-0"
                  size={18}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
                    {inv.groupId.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Invited by {inv.invitedBy.name} ·{" "}
                    {format(new Date(inv.createdAt), "MMM d")}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => respondInvitation(inv._id, "accept")}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 font-semibold transition-colors"
                  >
                    <RiCheckLine size={13} /> Accept
                  </button>
                  <button
                    onClick={() => respondInvitation(inv._id, "reject")}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
                  >
                    <RiCloseLine size={13} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My groups */}
      {loadingGroups ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <RiGroupLine
              size={32}
              className="text-gray-300 dark:text-gray-600"
            />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold">
            No groups yet
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Create a group or wait for an invitation
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g) => {
            const isOwner = g.owner._id === user?._id;
            return (
              <Link
                key={g._id}
                to={`/groups/${g._id}`}
                className="card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all group flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {g.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {g.name}
                    </p>
                    {g.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {g.description}
                      </p>
                    )}
                  </div>
                  <RiArrowRightLine
                    className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-0.5"
                    size={18}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <RiGroupLine size={12} /> {g.members.length} member
                    {g.members.length !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <RiTimeLine size={12} />{" "}
                    {format(new Date(g.createdAt), "MMM d, yyyy")}
                  </span>
                  {isOwner && (
                    <span className="badge bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      owner
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
