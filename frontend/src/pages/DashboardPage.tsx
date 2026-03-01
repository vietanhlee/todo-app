import React from "react";
import { useTaskContext } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  RiArrowRightLine, RiCheckDoubleLine, RiTimeLine,
  RiAlarmWarningLine, RiCalendarCheckLine, RiFireLine,
} from "react-icons/ri";
import type { Task } from "../types";

/* ── Stat Card ────────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: number; to: string;
  gradient: string; icon: React.ReactNode; sub?: string;
}> = ({ label, value, to, gradient, icon, sub }) => (
  <Link to={to} className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 group" style={{background: gradient}}>
    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
      {icon}
    </div>
    <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
    <p className="text-sm font-medium text-white/80">{label}</p>
    {sub && <p className="text-xs text-white/60">{sub}</p>}
    <RiArrowRightLine className="absolute bottom-4 right-4 text-white/30 group-hover:text-white/70 transition-colors" size={18} />
    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
  </Link>
);

/* ── Priority dot ─────────────────────────────────────────────── */
const PriorityDot: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string,string> = { high:"bg-red-500", medium:"bg-amber-500", low:"bg-green-500" };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[priority] ?? "bg-gray-400"}`} />;
};

/* ── Dashboard ────────────────────────────────────────────────── */
const DashboardPage: React.FC = () => {
  const { stats, tasks } = useTaskContext();
  const { user } = useAuth();

  const completionRate = stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const recentTasks = [...tasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-4xl mx-auto space-y-7">

      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />
        <div className="relative">
          <p className="text-primary-200 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold text-white">{user?.name?.split(" ")[0] || "there"} 👋</h1>
          <p className="text-primary-200 mt-1 text-sm">
            {stats?.active
              ? `${stats.active} active task${stats.active !== 1 ? "s" : ""} waiting for you`
              : "All caught up! Great work 🎉"}
          </p>
          {stats && stats.overdue > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-red-500/20 text-red-200 text-xs font-semibold px-3 py-1 rounded-full">
              <RiAlarmWarningLine size={12} />
              {stats.overdue} overdue
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} to="/all" gradient="linear-gradient(135deg,#6366f1,#4f46e5)" icon={<RiCalendarCheckLine size={18} />} />
          <StatCard label="Active" value={stats.active} to="/active" gradient="linear-gradient(135deg,#f59e0b,#d97706)" icon={<RiTimeLine size={18} />} sub="In progress" />
          <StatCard label="Completed" value={stats.completed} to="/completed" gradient="linear-gradient(135deg,#10b981,#059669)" icon={<RiCheckDoubleLine size={18} />} sub={`${completionRate}% done`} />
          <StatCard label="Overdue" value={stats.overdue} to="/overdue" gradient="linear-gradient(135deg,#ef4444,#dc2626)" icon={<RiAlarmWarningLine size={18} />} />
        </div>
      )}

      {/* Progress + priority */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Completion progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-white">Overall Progress</h2>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{completionRate}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700"
              style={{width: completionRate + "%"}}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{stats?.completed ?? 0} completed</span>
            <span>{stats?.total ?? 0} total</span>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <RiFireLine className="text-orange-500" size={18} />
            <h2 className="font-semibold text-gray-800 dark:text-white">Priority Breakdown</h2>
          </div>
          <div className="space-y-2.5">
            {(["high","medium","low"] as const).map(p => {
              const count = tasks.filter(t => t.priority === p && !t.completed).length;
              const pct   = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
              const colors: Record<string,string> = {high:"bg-red-500",medium:"bg-amber-400",low:"bg-green-500"};
              return (
                <div key={p}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                    <span>{p}</span><span>{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[p]} transition-all duration-500`} style={{width: pct + "%"}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      {recentTasks.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-white">Recent Tasks</h2>
            <Link to="/all" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1">
              View all <RiArrowRightLine size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTasks.map((task: Task) => (
              <div key={task._id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <PriorityDot priority={task.priority} />
                <span className={`flex-1 text-sm font-medium truncate ${task.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-200"}`}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(task.dueDate), "MMM d")}
                  </span>
                )}
                {task.completed && (
                  <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">done</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
