import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { AUTH } from "../../Constants/apiroutes.js";

const AdminLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(AUTH.LOGIN, formData);

      if (response.data.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        onLoginSuccess?.();
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Connection failed";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans p-4">
      <div className="mb-8 text-center">
        <div className="inline-block p-3 bg-purple-600 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.5)] mb-4">
          <div className="w-8 h-8 border-2 border-white rounded-sm flex items-center justify-center">
            <div className="w-4 h-1 bg-white"></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight">
          Naarisa
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          Enter your credentials to access the console
        </p>
      </div>

      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Email Address
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail size={18} />
              </span>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@gmail.com"
                className="w-full bg-[#1a2234] border border-gray-700 text-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                Password
              </label>

              <button
                type="button"
                className="text-xs text-purple-500 hover:text-purple-400 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={18} />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#1a2234] border border-gray-700 text-gray-300 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-purple-500 hover:text-purple-400 font-semibold transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px bg-gray-800 flex-grow"></div>

            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Security Note
            </span>

            <div className="h-px bg-gray-800 flex-grow"></div>
          </div>

          <div className="bg-[#0f172a] border border-gray-800/50 rounded-xl p-4 flex gap-4">
            <ShieldAlert
              className="text-purple-500 shrink-0"
              size={20}
            />

            <p className="text-[11px] text-gray-400 leading-relaxed">
              This is a secure administrative console.
              Access is logged and unauthorized attempts
              are monitored.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 text-gray-500 text-xs font-medium">
        <button className="flex items-center gap-1 hover:text-gray-300">
          <LifeBuoy size={14} /> Support
        </button>

        <button className="flex items-center gap-1 hover:text-gray-300">
          <ShieldCheck size={14} /> Privacy
        </button>

        <span className="text-gray-700">
          v2.4.0 Stable
        </span>
      </div>
    </div>
  );
};

export default AdminLogin;
