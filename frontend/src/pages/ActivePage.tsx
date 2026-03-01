import React, { useEffect } from "react";
import { useTaskContext } from "../context/TaskContext";
import TaskList from "../components/Tasks/TaskList";
import TaskFilter from "../components/Tasks/TaskFilter";
import CreateTask from "../components/Tasks/CreateTask";

const ActivePage: React.FC = () => {
  const { setFilter } = useTaskContext();
  useEffect(() => {
    setFilter("active");
  }, [setFilter]);
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
        Active Tasks
      </h1>
      <CreateTask />
      <TaskFilter />
      <TaskList />
    </div>
  );
};
export default ActivePage;
