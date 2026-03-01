import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Task, Stats, TaskFilter, SortBy } from "../types";
import * as taskApi from "../api/taskApi";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

interface TaskContextType {
  tasks: Task[];
  stats: Stats | null;
  loading: boolean;
  filter: TaskFilter;
  sortBy: SortBy;
  search: string;
  selectedCategory: string;
  setFilter: (f: TaskFilter) => void;
  setSortBy: (s: SortBy) => void;
  setSearch: (s: string) => void;
  setSelectedCategory: (c: string) => void;
  fetchTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addOutcome: (taskId: string, form: FormData) => Promise<void>;
  removeOutcome: (taskId: string, outcomeId: string) => Promise<void>;
  filteredTasks: Task[];
  categories: string[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTasks();
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await taskApi.getStats();
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchStats();
    } else {
      setTasks([]);
      setStats(null);
    }
  }, [token, fetchTasks, fetchStats]);

  const addTask = useCallback(
    async (data: Partial<Task>) => {
      const res = await taskApi.addTask(data);
      setTasks((prev) => [res.data.task, ...prev]);
      toast.success("Task added!");
      fetchStats();
    },
    [fetchStats],
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      const res = await taskApi.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
      toast.success("Task updated!");
      fetchStats();
    },
    [fetchStats],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const res = await taskApi.toggleComplete(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
      fetchStats();
    },
    [fetchStats],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success("Task deleted");
      fetchStats();
    },
    [fetchStats],
  );

  const addOutcome = useCallback(async (taskId: string, form: FormData) => {
    const res = await taskApi.addOutcome(taskId, form);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.task : t)));
  }, []);

  const removeOutcome = useCallback(
    async (taskId: string, outcomeId: string) => {
      const res = await taskApi.removeOutcome(taskId, outcomeId);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data.task : t)),
      );
    },
    [],
  );

  const categories = [
    "All",
    ...Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
  ];

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      if (filter === "today") {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }
      if (filter === "overdue") {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < new Date();
      }
      return true;
    })
    .filter(
      (t) => selectedCategory === "All" || t.category === selectedCategory,
    )
    .filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        loading,
        filter,
        sortBy,
        search,
        selectedCategory,
        setFilter,
        setSortBy,
        setSearch,
        setSelectedCategory,
        fetchTasks,
        fetchStats,
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        addOutcome,
        removeOutcome,
        filteredTasks,
        categories,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider");
  return ctx;
};
