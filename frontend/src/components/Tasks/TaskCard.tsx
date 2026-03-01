import React, { useState } from "react";
import { Task } from "../../types";
import { useTaskContext } from "../../context/TaskContext";
import PriorityBadge from "../UI/PriorityBadge";
import { format, isPast, isToday } from "date-fns";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiPushpin2Line,
  RiPushpinLine,
  RiCalendarLine,
  RiPriceTag3Line,
} from "react-icons/ri";
import clsx from "clsx";
import EditTask from "./EditTask";
import TaskOutcomes from "./TaskOutcomes";

interface Props {
  task: Task;
}

const TaskCard: React.FC<Props> = ({ task }) => {
  const { toggleComplete, deleteTask, updateTask } = useTaskContext();
  const [editing, setEditing] = useState(false);

  const isOverdue =
    !task.completed &&
    task.dueDate &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <>
      <div
        className={clsx(
          "group relative bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
          task.pinned
            ? "border-primary-200 dark:border-primary-700/50 shadow-sm shadow-primary-100 dark:shadow-primary-900/20"
            : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
          task.completed && "opacity-60",
        )}
      >
        {/* Priority accent line */}
        <div
          className={clsx(
            "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
            task.priority === "high" && "bg-red-400",
            task.priority === "medium" && "bg-amber-400",
            task.priority === "low" && "bg-green-400",
          )}
        />

        <div className="flex items-start gap-3.5 p-4 pl-5">
          {/* Checkbox */}
          <button
            onClick={() => toggleComplete(task._id)}
            className={clsx(
              "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200",
              task.completed
                ? "bg-gradient-to-br from-primary-500 to-primary-600 border-primary-500 shadow-sm shadow-primary-300 dark:shadow-primary-900"
                : "border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:shadow-sm",
            )}
          >
            {task.completed && (
              <svg
                className="w-2.5 h-2.5 text-white check-animate"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <p
                className={clsx(
                  "font-semibold text-[15px] leading-snug break-words text-gray-900 dark:text-white",
                  task.completed &&
                    "line-through text-gray-400 dark:text-gray-500",
                )}
              >
                {task.title}
                {task.pinned && (
                  <RiPushpin2Line
                    size={12}
                    className="inline ml-1.5 text-primary-400 align-middle"
                  />
                )}
              </p>
            </div>

            {task.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed break-words line-clamp-2">
                {task.description}
              </p>
            )}

            {task.notes && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 italic break-words bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5">
                {task.notes}
              </p>
            )}

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <PriorityBadge priority={task.priority} size="sm" />

              {task.dueDate && (
                <span
                  className={clsx(
                    "badge",
                    isOverdue
                      ? "bg-red-50   text-red-600   dark:bg-red-900/30   dark:text-red-400"
                      : isDueToday
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                  )}
                >
                  <RiCalendarLine size={11} />
                  {isOverdue ? "Overdue · " : isDueToday ? "Today · " : ""}
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}

              {task.category && task.category !== "General" && (
                <span className="badge bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                  <RiPriceTag3Line size={11} />
                  {task.category}
                </span>
              )}

              {task.tags?.map((tag) => (
                <span
                  key={tag}
                  className="badge bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="Edit"
            >
              <RiEdit2Line size={15} />
            </button>
            <button
              onClick={() => updateTask(task._id, { pinned: !task.pinned })}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              title={task.pinned ? "Unpin" : "Pin"}
            >
              {task.pinned ? (
                <RiPushpin2Line size={15} />
              ) : (
                <RiPushpinLine size={15} />
              )}
            </button>
            <button
              onClick={() => deleteTask(task._id)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <RiDeleteBin6Line size={15} />
            </button>
          </div>
        </div>
      </div>

      <TaskOutcomes task={task} />

      {editing && <EditTask task={task} onClose={() => setEditing(false)} />}
    </>
  );
};

export default TaskCard;
