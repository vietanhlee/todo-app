import React from "react";
import { useTaskContext } from "../../context/TaskContext";
import { SortBy } from "../../types";
import clsx from "clsx";

const SORTS: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "Newest" },
  { value: "priority", label: "Priority" },
  { value: "dueDate", label: "Due Date" },
  { value: "title", label: "Title A-Z" },
];

const TaskFilter: React.FC = () => {
  const { sortBy, setSortBy, filteredTasks, tasks } = useTaskContext();

  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filteredTasks.length} of {tasks.length} tasks
      </p>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSortBy(s.value)}
            className={clsx(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              sortBy === s.value
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskFilter;
