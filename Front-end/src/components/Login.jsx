import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const BUTTON_CLASSES = "w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50";

const INPUTWRAPPER = "relative flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-purple-500 focus-within:bg-white transition-colors";

const INITIAL_FORM = { email: "", password: "" };

const Login = ({ onSubmit, onSwitchMode }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const navigate = useNavigate();
  const url = "http://localhost:4000";
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token) {
      (async () => {
        try {
          const { data } = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) {
            onSubmit?.({ token, userId, ...data.user });
            toast.success("Session restored. Redirecting...");
            navigate('/');
          } else {
            localStorage.clear();
          }
        } catch {
          localStorage.clear();
        }
      })();
    }
  }, [navigate, onSubmit, url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const { data } = await axios.post(`${url}/api/user/login`, formData);
      if (!data.token) throw new Error(data.message || "Login failed");

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
      }
      
      setFormData(INITIAL_FORM);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    toast.dismiss();
    onSwitchMode?.();
  };

  const fields = [
    { name: "email", type: "email", placeholder: "Email", icon: Mail },
    { name: "password", type: showPassword ? "text" : "password", placeholder: "Password", icon: Lock, isPassword: true },
  ];

  return (
    <div className='fixed inset-0 bg-white flex items-center justify-center p-4' style={{backgroundColor: 'white', width: '100vw', height: '100vh'}}>
      <div className='max-w-md bg-white w-full shadow-lg border border-purple-100 rounded-xl p-8'>
      <ToastContainer position='top-center' autoClose={3000} hideProgressBar />
      <div className='mb-6 text-center'>
        <div className='w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4'>
          <LogIn className='w-8 h-8 text-white' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>Welcome Back!</h2>
        <p className='text-gray-500 text-sm mt-1'>Sign in to Continue</p>
      </div>
      
      <form onSubmit={handleSubmit} className='space-y-4'>
        {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
          <div key={name} className={INPUTWRAPPER}>
            <Icon className='text-purple-500 w-5 h-5' />
            <input 
              type={type} 
              placeholder={placeholder} 
              value={formData[name]} 
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              className='w-full focus:outline-none text-sm text-gray-700 ml-3' 
              required 
            />
            {isPassword && (
              <button 
                type='button' 
                onClick={() => setShowPassword((prev) => !prev)}
                className='ml-2 text-gray-500 hover:text-purple-500 transition-colors'
              >
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            )}
          </div>
        ))}
        
        <div className='flex items-center'>
          <input 
            type="checkbox" 
            id='rememberMe' 
            checked={rememberMe} 
            onChange={() => setRememberMe(!rememberMe)}
            className='h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded'
          />
          <label htmlFor="rememberMe" className='ml-2 block text-sm text-gray-700'>
            Remember me (keep me logged in)
          </label>
        </div>
        
        <button type='submit' className={BUTTON_CLASSES} disabled={loading}>
          {loading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Logging in...
            </>
          ) : (
            <>
              <LogIn className='w-4 h-4' />
              Login
            </>
          )}
        </button>
      </form>
      
      <p className='text-center text-sm text-gray-600 mt-6'>
        Don't have an account?{' '}
        <button 
          type='button' 
          className='text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors' 
          onClick={handleSwitchMode}
        >
          Sign Up
        </button>
      </p>
      </div>
    </div>
  );
};

export default Login;