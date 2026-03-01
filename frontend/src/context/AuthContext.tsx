import React, {
  createContext, useContext, useState, useCallback, useEffect, ReactNode,
} from "react";
import { User } from "../types";
import * as userApi from "../api/userApi";
import toast from "react-hot-toast";

interface AuthContextType {
  token:         string | null;
  user:          User | null;
  login:         (email: string, password: string) => Promise<void>;
  register:      (name: string, email: string, password: string) => Promise<void>;
  logout:        () => void;
  updateProfile: (data: { name?: string; bio?: string; phone?: string }) => Promise<void>;
  uploadAvatar:  (file: File) => Promise<void>;
  changePassword:(current: string, next: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  setUser:       React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem("authToken");
    return t ? JSON.parse(t) : null;
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token && !user) {
      userApi.getUser()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setToken(null);
          localStorage.removeItem("authToken");
        });
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await userApi.login(email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem("authToken", JSON.stringify(res.data.token));
    toast.success(`Welcome back, ${res.data.user.name}!`);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await userApi.register(name, email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem("authToken", JSON.stringify(res.data.token));
    toast.success(`Welcome, ${res.data.user.name}!`);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    toast.success("Logged out");
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; bio?: string; phone?: string }) => {
    const res = await userApi.updateProfile(data);
    setUser(res.data.user);
    toast.success("Profile updated");
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    const res = await userApi.uploadAvatar(file);
    setUser(res.data.user);
    toast.success("Avatar updated");
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    await userApi.changePassword(current, next);
    toast.success("Password changed");
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    await userApi.deleteAccount(password);
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    toast.success("Account deleted");
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateProfile, uploadAvatar, changePassword, deleteAccount, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
