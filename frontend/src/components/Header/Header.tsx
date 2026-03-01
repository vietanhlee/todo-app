import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiMoonLine,
  RiSunLine,
  RiLogoutBoxLine,
  RiSearchLine,
  RiNotification3Line,
  RiUserSettingsLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTaskContext } from "../../context/TaskContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { search, setSearch, stats } = useTaskContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
  const avatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${BASE}${user.avatar.startsWith("/") ? "" : "/uploads/avatars/"}${user.avatar}`
    : null;
  const [avatarError, setAvatarError] = React.useState(false);
  React.useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  return (
    <header className="h-16 glass border-b border-gray-100 dark:border-gray-800/50 flex items-center px-6 gap-4 shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <RiSearchLine
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          size={15}
        />
        <input
          className="input pl-10 py-2 text-sm h-9"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Overdue badge */}
        {stats && stats.overdue > 0 && (
          <div className="relative mr-1">
            <button className="btn-ghost p-2 text-gray-400">
              <RiNotification3Line size={18} />
            </button>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="btn-ghost p-2"
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? (
            <RiSunLine size={18} className="text-amber-400" />
          ) : (
            <RiMoonLine size={18} />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* User avatar + dropdown */}
        {user && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 transition-colors"
            >
              {avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shadow-sm"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-primary-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                  {user.name.split(" ")[0]}
                </p>
                <p className="text-[11px] text-gray-400 leading-tight">
                  {user.email}
                </p>
              </div>
              <RiArrowDownSLine
                size={14}
                className={`text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <RiUserSettingsLine size={16} />
                  Account settings
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <RiLogoutBoxLine size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
