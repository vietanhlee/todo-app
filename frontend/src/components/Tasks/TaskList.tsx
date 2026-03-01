import React from "react";
import { useTaskContext } from "../../context/TaskContext";
import TaskCard from "./TaskCard";
import { RiInboxLine } from "react-icons/ri";

const SkeletonCard: React.FC = () => (
  <div className="card p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex gap-2 items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-14 ml-auto" />
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ filtered?: boolean }> = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center fade-up">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <RiInboxLine size={32} className="text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-gray-500 dark:text-gray-400 font-semibold text-base">
      {filtered ? "No matching tasks" : "No tasks yet"}
    </p>
    <p className="text-sm text-gray-400 dark:text-gray-600 mt-1 max-w-xs">
      {filtered
        ? "Try adjusting your filters or search query."
        : "Add your first task to get started!"}
    </p>
  </div>
);

const TaskList: React.FC = () => {
  const { filteredTasks, loading, search, filter } = useTaskContext();

  const isFiltered = !!(search || filter !== "all");

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return <EmptyState filtered={isFiltered} />;
  }

  return (
    <div className="space-y-2">
      {filteredTasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
