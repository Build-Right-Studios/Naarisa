import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, LifeBuoy, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard'); 
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Connection refused.';
      alert(message);
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
        <h1 className="text-3xl font-bold text-white tracking-tight">Naarisa</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your credentials to access the console</p>
      </div>

      <div className="w-full mx-auto max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail size={18} />
              </span>
              <input 
                type="email"
                required
                value={formData.email}
                className="w-full bg-[#1a2234] border border-gray-700 text-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="aryan@jiit.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <button type="button" className="text-xs text-purple-500 hover:text-purple-400 font-medium">Forgot Password?</button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={18} />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                className="w-full bg-[#1a2234] border border-gray-700 text-gray-300 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="••••••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-px bg-gray-800 flex-grow"></div>
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Security Note</span>
             <div className="h-px bg-gray-800 flex-grow"></div>
          </div>
          <div className="bg-[#0f172a] border border-gray-800/50 rounded-xl p-4 flex gap-4">
            <ShieldAlert className="text-purple-500 shrink-0" size={20} />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              This is a secure administrative console. Access is logged and unauthorized attempts will be flagged.
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
        <span className="text-gray-700">v2.4.0-Stable</span>
      </div>
    </div>
  );
};

export default AdminLogin;