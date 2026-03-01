import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as userApi from "../../api/userApi";
import toast from "react-hot-toast";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Forgot Password
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Enter your email and we'll send a reset link.
        </p>

        {sent ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-medium mb-4">
              Email sent! Check your inbox.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
