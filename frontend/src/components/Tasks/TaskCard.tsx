import React, { useState } from "react";
import { Task } from "../../types";
import { useTaskContext } from "../../context/TaskContext";
import { format, isPast, isToday } from "date-fns";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiPushpin2Line,
  RiPushpinLine,
  RiCalendarLine,
  RiPriceTag3Line,
  RiAttachmentLine,
} from "react-icons/ri";
import clsx from "clsx";
import EditTask from "./EditTask";
import TaskOutcomes from "./TaskOutcomes";

interface Props {
  task: Task;
}

const PRIORITY = {
  high: {
    accent: "bg-red-500",
    chip: "text-red-500 bg-red-500/10",
    label: "High",
  },
  medium: {
    accent: "bg-amber-500",
    chip: "text-amber-500 bg-amber-500/10",
    label: "Medium",
  },
  low: {
    accent: "bg-green-500",
    chip: "text-green-500 bg-green-500/10",
    label: "Low",
  },
};

const TaskCard: React.FC<Props> = ({ task }) => {
  const { toggleComplete, deleteTask, updateTask } = useTaskContext();
  const [editing, setEditing] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);

  const p = PRIORITY[task.priority];
  const isOverdue =
    !task.completed &&
    task.dueDate &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const attachCount = task.outcomes?.length ?? 0;

  return (
    <>
      <div
        className={clsx(
          "group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-200",
          "border border-gray-100 dark:border-gray-800/80",
          "hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md",
          task.completed && "opacity-60",
          task.pinned &&
            "border-primary-200 dark:border-primary-800/50 shadow-sm",
        )}
      >
        {/* Priority accent strip */}
        <div
          className={clsx("absolute left-0 top-0 bottom-0 w-[3px]", p.accent)}
        />

        {/* Card body */}
        <div className="pl-5 pr-4 pt-3.5 pb-3">
          {/* Top row: checkbox + title + actions */}
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={() => toggleComplete(task._id)}
              className={clsx(
                "mt-[3px] shrink-0 w-[17px] h-[17px] rounded-full border-2 flex items-center justify-center transition-all duration-200",
                task.completed
                  ? "bg-primary-500 border-primary-500"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500",
              )}
            >
              {task.completed && (
                <svg
                  className="w-[9px] h-[9px] text-white check-animate"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Title area */}
            <div className="flex-1 min-w-0">
              <p
                className={clsx(
                  "text-[14.5px] font-semibold leading-snug text-gray-900 dark:text-white break-words",
                  task.completed &&
                    "line-through text-gray-400 dark:text-gray-500",
                )}
              >
                {task.title}
                {task.pinned && (
                  <RiPushpin2Line
                    size={11}
                    className="inline mb-0.5 ml-1.5 text-primary-400"
                  />
                )}
              </p>

              {task.description && (
                <p className="mt-0.5 text-[12.5px] text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2 break-words">
                  {task.description}
                </p>
              )}
            </div>

            {/* Action buttons — appear on hover */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => setEditing(true)}
                title="Edit"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <RiEdit2Line size={14} />
              </button>
              <button
                onClick={() => updateTask(task._id, { pinned: !task.pinned })}
                title={task.pinned ? "Unpin" : "Pin"}
                className={clsx(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                  task.pinned
                    ? "text-primary-400"
                    : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                )}
              >
                {task.pinned ? (
                  <RiPushpin2Line size={14} />
                ) : (
                  <RiPushpinLine size={14} />
                )}
              </button>
              <button
                onClick={() => deleteTask(task._id)}
                title="Delete"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <RiDeleteBin6Line size={14} />
              </button>
            </div>
          </div>

          {/* Notes (if any) */}
          {task.notes && (
            <p className="mt-2 ml-[29px] text-[11.5px] italic text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-2.5 py-1.5 border-l-2 border-gray-200 dark:border-gray-700 leading-relaxed">
              {task.notes}
            </p>
          )}

          {/* Meta chips row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 ml-[29px]">
            {/* Priority chip */}
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
                p.chip,
              )}
            >
              <span className={clsx("w-1.5 h-1.5 rounded-full", p.accent)} />
              {p.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md",
                  isOverdue
                    ? "text-red-500   bg-red-500/10"
                    : isDueToday
                      ? "text-amber-500 bg-amber-500/10"
                      : "text-gray-400  dark:text-gray-500 bg-gray-100 dark:bg-gray-800",
                )}
              >
                <RiCalendarLine size={10} />
                {isOverdue ? "Overdue · " : isDueToday ? "Today · " : ""}
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}

            {/* Category */}
            {task.category && task.category !== "General" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md text-violet-500 bg-violet-500/10">
                <RiPriceTag3Line size={10} />
                {task.category}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800"
              >
                #{tag}
              </span>
            ))}

            {/* Attachment chip — right-aligned */}
            {attachCount > 0 || attachOpen ? (
              <button
                onClick={() => setAttachOpen((v) => !v)}
                className={clsx(
                  "ml-auto inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors",
                  attachOpen
                    ? "text-primary-500 bg-primary-500/10"
                    : "text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 hover:text-primary-500 hover:bg-primary-500/10",
                )}
              >
                <RiAttachmentLine size={11} />
                {attachCount > 0 ? attachCount : ""}
              </button>
            ) : (
              <button
                onClick={() => setAttachOpen(true)}
                className="ml-auto opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md text-gray-300 dark:text-gray-600 hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-150"
              >
                <RiAttachmentLine size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Attachments panel */}
        {attachOpen && (
          <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <TaskOutcomes task={task} />
          </div>
        )}
      </div>

      {editing && <EditTask task={task} onClose={() => setEditing(false)} />}
    </>
  );
};

export default TaskCard;
