import React from "react";
import { RiMoonLine, RiSunLine, RiLogoutBoxLine, RiSearchLine, RiNotification3Line } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTaskContext } from "../../context/TaskContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { search, setSearch, stats } = useTaskContext();

  return (
    <header className="h-16 glass border-b border-gray-100 dark:border-gray-800/50 flex items-center px-6 gap-4 shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
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
          {dark
            ? <RiSunLine size={18} className="text-amber-400" />
            : <RiMoonLine size={18} />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* User */}
        {user && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-primary-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                {user.name.split(" ")[0]}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="btn-ghost p-2 ml-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          title="Logout"
        >
          <RiLogoutBoxLine size={17} />
        </button>
      </div>
    </header>
  );
};

export default Header;
