import api from "./axios";
import { Task, Stats } from "../types";

export const getTasks = () => api.get<Task[]>("/task/getTask");

export const getStats = () => api.get<Stats>("/task/stats");

export const addTask = (data: Partial<Task>) =>
  api.post<{ message: string; task: Task }>("/task/addTask", data);

export const updateTask = (id: string, data: Partial<Task>) =>
  api.put<{ message: string; task: Task }>(`/task/updateTask/${id}`, data);

export const toggleComplete = (id: string) =>
  api.patch<{ message: string; task: Task }>(`/task/toggle/${id}`);

export const deleteTask = (id: string) =>
  api.delete<{ message: string }>(`/task/removeTask/${id}`);

export const reorderTasks = (tasks: { id: string; order: number }[]) =>
  api.patch("/task/reorder", { tasks });

// outcomes
export const addOutcome = (taskId: string, data: FormData) =>
  api.post<{ task: Task }>(`/task/${taskId}/outcomes`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const removeOutcome = (taskId: string, outcomeId: string) =>
  api.delete<{ task: Task }>(`/task/${taskId}/outcomes/${outcomeId}`);
