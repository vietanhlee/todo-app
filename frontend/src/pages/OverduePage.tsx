import React, { useEffect } from "react";
import { useTaskContext } from "../context/TaskContext";
import TaskList from "../components/Tasks/TaskList";
import TaskFilter from "../components/Tasks/TaskFilter";

const OverduePage: React.FC = () => {
  const { setFilter } = useTaskContext();
  useEffect(() => {
    setFilter("overdue");
  }, [setFilter]);
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
        ⚠️ Overdue Tasks
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        These tasks are past their due date and haven't been completed yet.
      </p>
      <TaskFilter />
      <TaskList />
    </div>
  );
};
export default OverduePage;
