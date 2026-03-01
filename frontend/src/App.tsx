import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GroupProvider } from "./context/GroupContext";
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import DashboardPage from "./pages/DashboardPage";
import AllTasksPage from "./pages/AllTasksPage";
import ActivePage from "./pages/ActivePage";
import CompletedPage from "./pages/CompletedPage";
import TodayPage from "./pages/TodayPage";
import OverduePage from "./pages/OverduePage";
import AccountPage from "./pages/AccountPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/register"
        element={token ? <Navigate to="/" /> : <Register />}
      />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <TaskProvider>
              <GroupProvider>
                <Layout />
              </GroupProvider>
            </TaskProvider>
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<AllTasksPage />} />
        <Route path="active" element={<ActivePage />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="overdue" element={<OverduePage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="groups/:id" element={<GroupDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "dark:bg-gray-800 dark:text-gray-100",
              duration: 3000,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
