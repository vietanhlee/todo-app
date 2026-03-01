import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiEditLine,
  RiSaveLine,
  RiLockLine,
  RiDeleteBinLine,
  RiCameraLine,
} from "react-icons/ri";

const AccountPage: React.FC = () => {
  const {
    user,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    logout,
  } = useAuth();

  // profile
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // password
  const [showPwd, setShowPwd] = useState(false);
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // delete
  const [showDel, setShowDel] = useState(false);
  const [delPwd, setDelPwd] = useState("");
  const [delLoading, setDelLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, bio, phone });
      setEditMode(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await changePassword(curPwd, newPwd);
      setCurPwd("");
      setNewPwd("");
      setShowPwd(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDelLoading(true);
    try {
      await deleteAccount(delPwd);
      logout();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setDelLoading(false);
    }
  };

  const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${BASE}${user.avatar.startsWith("/") ? "" : "/uploads/avatars/"}${user.avatar}`
    : null;

  const initials = user?.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Account Settings
      </h1>

      {/* ── Profile Card ─────────────────────────────────── */}
      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-primary-500/30"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <RiCameraLine className="text-white" size={22} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            {user?.bio && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">
                {user.bio}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setEditMode(!editMode);
              setName(user?.name ?? "");
              setBio(user?.bio ?? "");
              setPhone(user?.phone ?? "");
            }}
            className="ml-auto btn-ghost gap-1"
          >
            <RiEditLine size={15} /> Edit
          </button>
        </div>

        {/* Edit form */}
        {editMode && (
          <form
            onSubmit={handleSaveProfile}
            className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4 fade-up"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <RiUserLine
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={15}
                />
                <input
                  className="input pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                className="input resize-none"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio…"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <div className="relative">
                <RiPhoneLine
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={15}
                />
                <input
                  className="input pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84…"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm py-1.5 gap-1"
              >
                <RiSaveLine size={14} /> {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* Read-only info rows */}
        {!editMode && (
          <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
            <InfoRow
              icon={<RiMailLine size={15} />}
              label="Email"
              value={user?.email ?? "—"}
            />
            <InfoRow
              icon={<RiPhoneLine size={15} />}
              label="Phone"
              value={user?.phone || "—"}
            />
          </div>
        )}
      </div>

      {/* ── Change Password ───────────────────────────────── */}
      <div className="card p-6">
        <button
          onClick={() => setShowPwd((v) => !v)}
          className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white w-full text-left"
        >
          <RiLockLine size={18} className="text-primary-500" />
          Change Password
          <span className="ml-auto text-xs text-gray-400">
            {showPwd ? "▲" : "▼"}
          </span>
        </button>
        {showPwd && (
          <form
            onSubmit={handleChangePassword}
            className="mt-4 space-y-3 fade-up"
          >
            <input
              className="input"
              type="password"
              placeholder="Current password"
              value={curPwd}
              onChange={(e) => setCurPwd(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="New password (strong)"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPwd(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pwdLoading}
                className="btn-primary text-sm py-1.5"
              >
                {pwdLoading ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Danger Zone ───────────────────────────────────── */}
      <div className="card p-6 border border-red-200 dark:border-red-800/40">
        <button
          onClick={() => setShowDel((v) => !v)}
          className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400 w-full text-left"
        >
          <RiDeleteBinLine size={18} />
          Delete Account
          <span className="ml-auto text-xs text-gray-400">
            {showDel ? "▲" : "▼"}
          </span>
        </button>
        {showDel && (
          <form
            onSubmit={handleDeleteAccount}
            className="mt-4 space-y-3 fade-up"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action is <strong>irreversible</strong>. All your tasks will
              be deleted. Enter your password to confirm.
            </p>
            <input
              className="input border-red-300 dark:border-red-700 focus:ring-red-400"
              type="password"
              placeholder="Confirm password"
              value={delPwd}
              onChange={(e) => setDelPwd(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDel(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={delLoading}
                className="text-sm px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                {delLoading ? "Deleting…" : "Delete My Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-gray-400">{icon}</span>
    <span className="text-gray-500 dark:text-gray-400 w-16">{label}</span>
    <span className="text-gray-900 dark:text-gray-100 font-medium">
      {value}
    </span>
  </div>
);

export default AccountPage;
