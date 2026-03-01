import api from "./axios";
import { User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/user/login", { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post<AuthResponse>("/user/register", { name, email, password });

export const getUser = () => api.get<{ user: User }>("/user/getuser");

export const updateProfile = (data: {
  name?: string;
  bio?: string;
  phone?: string;
}) => api.put<{ user: User }>("/user/profile", data);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return api.post<{ avatar: string; user: User }>("/user/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put("/user/password", { currentPassword, newPassword });

export const deleteAccount = (password: string) =>
  api.delete("/user/account", { data: { password } });

export const forgotPassword = (email: string) =>
  api.post("/forgotPassword/forgotPassword", { email });

export const resetPassword = (token: string, password: string) =>
  api.post("/forgotPassword/resetPassword", { token, password });
