import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  RiDashboardLine,
  RiListCheck2,
  RiCalendarTodoLine,
  RiGroupLine,
} from "react-icons/ri";
import { useTaskContext } from "../../context/TaskContext";
import { useGroups } from "../../context/GroupContext";
import clsx from "clsx";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: RiDashboardLine,
    end: true,
    filter: null,
  },
  {
    to: "/tasks",
    label: "All Tasks",
    icon: RiListCheck2,
    end: false,
    filter: "all",
  },
  {
    to: "/today",
    label: "Today",
    icon: RiCalendarTodoLine,
    end: false,
    filter: "today",
  },
] as const;

const Sidebar: React.FC = () => {
  const { stats, setFilter } = useTaskContext();
  const { groups, invitations } = useGroups();

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-gray-800/50 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-3 px-1 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            TODOAPP
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-0.5 flex-1">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-1 mt-1">
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon, end, filter }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => filter && setFilter(filter as any)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-400 dark:text-gray-500",
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Groups + Account links */}
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-1 mt-4">
          Workspace
        </p>
        {[
          {
            to: "/groups",
            label: "Groups",
            icon: RiGroupLine,
            badge: invitations.length,
          },
        ].map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-400 dark:text-gray-500",
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom stats */}
      {stats && (
        <div className="p-4 mx-3 mb-4 mt-2 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/30">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-3">
            Progress
          </p>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Completion
            </span>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
              style={{
                width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-[11px] text-gray-400">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-500">
                {stats.completed}
              </p>
              <p className="text-[11px] text-gray-400">Done</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
