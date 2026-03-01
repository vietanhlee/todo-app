import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGroups } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { findGroupByCode } from "../api/groupApi";
import {
  RiAddLine,
  RiGroupLine,
  RiMailLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiTimeLine,
  RiHashtag,
  RiSearch2Line,
  RiLockPasswordLine,
  RiFileCopyLine,
} from "react-icons/ri";

const GroupsPage: React.FC = () => {
  const { groups, invitations, loadingGroups, createGroup, respondInvitation } =
    useGroups();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeSearching, setCodeSearching] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (e: React.MouseEvent, code: string, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(groupId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleFindByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setCodeSearching(true);
    setCodeError("");
    try {
      const res = await findGroupByCode(codeInput.trim().toUpperCase());
      navigate(`/groups/${res.data._id}`);
    } catch {
      setCodeError("No group found with that code. Check and try again.");
    } finally {
      setCodeSearching(false);
    }
  };

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

      {/* Find by code */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <RiSearch2Line size={15} className="text-primary-500" /> Join a Group
          by Code
        </h3>
        <form onSubmit={handleFindByCode} className="flex gap-2">
          <div className="relative flex-1">
            <RiLockPasswordLine
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              className="input pl-8 py-2 text-sm uppercase tracking-widest font-mono"
              placeholder="ABC123XYZ"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase());
                setCodeError("");
              }}
              maxLength={9}
            />
          </div>
          <button
            type="submit"
            disabled={codeSearching || !codeInput.trim()}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
          >
            {codeSearching ? "…" : "Find"}
          </button>
        </form>
        {codeError && (
          <p className="text-xs text-red-500 mt-1.5">{codeError}</p>
        )}
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
                  {inv.message && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg border-l-2 border-primary-300 dark:border-primary-700">
                      “{inv.message}”
                    </p>
                  )}
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
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden">
                    {g.avatar ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}${g.avatar}`}
                        alt={g.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                          (
                            e.currentTarget
                              .nextElementSibling as HTMLElement | null
                          )?.style.setProperty("display", "flex");
                        }}
                      />
                    ) : null}
                    <div
                      className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center text-white font-bold text-lg"
                      style={{ display: g.avatar ? "none" : "flex" }}
                    >
                      {g.name[0].toUpperCase()}
                    </div>
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
                {g.code && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="flex items-center gap-1.5 font-mono tracking-widest text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      <RiHashtag size={11} className="text-primary-400" />
                      {g.code}
                    </span>
                    <button
                      onClick={(e) => copyCode(e, g.code!, g._id)}
                      title="Copy invite code"
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 hover:text-primary-500 border border-gray-200 dark:border-gray-700 transition-colors"
                    >
                      {copiedId === g._id ? (
                        <>
                          <RiCheckLine size={12} className="text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <RiFileCopyLine size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
