import React, { useEffect, useState } from "react";
import { useTaskContext } from "../context/TaskContext";
import { useGroups } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import TaskList from "../components/Tasks/TaskList";
import TaskFilter from "../components/Tasks/TaskFilter";
import CreateTask from "../components/Tasks/CreateTask";
import { GroupTask } from "../types";
import { Link } from "react-router-dom";
import { format, isPast, isToday } from "date-fns";
import {
  RiGroupLine,
  RiArrowRightLine,
  RiAlarmWarningLine,
  RiPriceTag3Line,
} from "react-icons/ri";
import clsx from "clsx";

type Tab = "all" | "active" | "completed" | "overdue";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const AllTasksPage: React.FC = () => {
  const {
    setFilter,
    stats,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useTaskContext();
  const { groups, getGroupTasks } = useGroups();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("all");

  const [myGroupTasks, setMyGroupTasks] = useState<
    (GroupTask & { groupName: string; groupId: string })[]
  >([]);

  useEffect(() => {
    setFilter(tab);
  }, [tab, setFilter]);

  useEffect(() => {
    if (!groups.length || !user) return;
    Promise.all(
      groups.map(async (g) => {
        try {
          const tasks = await getGroupTasks(g._id);
          return tasks
            .filter(
              (t) =>
                t.status !== "done" &&
                t.status !== "cancelled" &&
                t.assignments?.some(
                  (a) =>
                    (a.memberId as any)?._id === user._id ||
                    (a.memberId as any) === user._id,
                ),
            )
            .map((t) => ({ ...t, groupName: g.name, groupId: g._id }));
        } catch {
          return [];
        }
      }),
    ).then((results) => {
      const flat = results.flat().sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      setMyGroupTasks(flat);
    });
  }, [groups, user]);

  const tabCount = (value: Tab) => {
    if (value === "all") return stats?.total;
    if (value === "active") return stats?.active;
    if (value === "completed") return stats?.completed;
    if (value === "overdue") return stats?.overdue;
    return 0;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Tasks
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-5">
        {TABS.map(({ value, label }) => {
          const count = tabCount(value);
          const isOverdueTab = value === "overdue";
          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                tab === value
                  ? isOverdueTab
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              )}
            >
              {isOverdueTab && tab === value && (
                <RiAlarmWarningLine size={13} />
              )}
              {label}
              {count != null && count > 0 && (
                <span
                  className={clsx(
                    "text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                    tab === value
                      ? isOverdueTab
                        ? "bg-white/20 text-white"
                        : "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                      : isOverdueTab && (count ?? 0) > 0
                        ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category filter chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <RiPriceTag3Line
            size={14}
            className="text-gray-400 self-center flex-shrink-0"
          />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "text-xs font-medium px-3 py-1 rounded-full transition-all duration-150",
                selectedCategory === cat
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <CreateTask />
      <TaskFilter />
      <TaskList />

      {/* Group Tasks Assigned to Me */}
      {myGroupTasks.length > 0 && (
        <div className="mt-6 card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm">
              <RiGroupLine className="text-primary-500" size={16} />
              Group Tasks Assigned to Me
            </h2>
            <Link
              to="/groups"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1"
            >
              All groups <RiArrowRightLine size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {myGroupTasks.map((t) => {
              const overdue =
                t.dueDate &&
                isPast(new Date(t.dueDate)) &&
                !isToday(new Date(t.dueDate));
              const dueToday = t.dueDate && isToday(new Date(t.dueDate));
              const statusColors: Record<string, string> = {
                open: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                in_progress:
                  "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                done: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                cancelled:
                  "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
              };
              return (
                <Link
                  key={t._id}
                  to={`/groups/${t.groupId}`}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {t.title}
                  </span>
                  <span
                    className={clsx(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                      statusColors[t.status],
                    )}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
                    {t.groupName}
                  </span>
                  {t.dueDate && (
                    <span
                      className={clsx(
                        "text-xs flex-shrink-0 font-medium",
                        overdue
                          ? "text-red-500"
                          : dueToday
                            ? "text-amber-500"
                            : "text-gray-400",
                      )}
                    >
                      {format(new Date(t.dueDate), "MMM d")}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasksPage;
