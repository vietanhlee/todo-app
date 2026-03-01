import React, { useEffect } from "react";
import { useTaskContext } from "../context/TaskContext";
import TaskList from "../components/Tasks/TaskList";
import TaskFilter from "../components/Tasks/TaskFilter";

const CompletedPage: React.FC = () => {
  const { setFilter } = useTaskContext();
  useEffect(() => {
    setFilter("completed");
  }, [setFilter]);
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
        Completed Tasks
      </h1>
      <TaskFilter />
      <TaskList />
    </div>
  );
};
export default CompletedPage;
