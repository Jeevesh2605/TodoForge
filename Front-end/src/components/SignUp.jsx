import { UserPlus, User, Mail, Lock } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios'; // Import real axios

const Inputwrapper =
    "flex items-center border border-purple-100 dark:border-gray-600 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 dark:focus-within:ring-gray-400 focus-within:border-purple-500 dark:focus-within:border-gray-400 transition-all duration-200 dark:bg-gray-800"
const BUTTONCLASSES =
    "w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
const MESSAGE_SUCCESS = "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 p-3 rounded-lg text-sm mb-4 border border-green-100 dark:border-green-800"
const MESSAGE_ERROR = "bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-800"

const FIELDS = [
  { name: 'name', type: 'text', placeholder: 'Full Name', icon: User },
  { name: 'email', type: 'email', placeholder: 'Email Address', icon: Mail },
  { name: 'password', type: 'password', placeholder: 'Password', icon: Lock }
];

const API_URL = "https://todoforge-backend.onrender.com";
const INITIAL_FORM = { name: "", email: "", password: "" };

const SignUp = ({ onSwitchMode = () => console.log('Switch to login mode') }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Real API call to your backend
      const response = await axios.post(`${API_URL}/api/user/register`, formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Signup Successful", response.data);
      
      // Handle token if your backend returns one
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored successfully');
      }
      
      setMessage({ 
        text: response.data.message || "Registration Successful! You can now login", 
        type: "success" 
      });
      setFormData(INITIAL_FORM);
      
    } catch (err) {
      console.error("Signup error:", err);
      setMessage({ 
        text: err.response?.data?.message || "An error occurred. Please try again", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    // Clear error message when user starts typing
    if (message.type === 'error') {
      setMessage({ text: "", type: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg border border-purple-100 dark:border-gray-700 rounded-xl p-8">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create Account
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join TodoForge to manage your tasks</p>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {FIELDS.map(({ name, type, placeholder, icon: Icon }) => (
            <div key={name} className={Inputwrapper}>
              <Icon className="text-purple-500 w-5 h-5 mr-2" />
              <input 
                type={type} 
                placeholder={placeholder} 
                value={formData[name]}
                onChange={(e) => handleInputChange(name, e.target.value)}
                className="w-full focus:outline-none text-sm text-gray-700" 
              />
            </div>
          ))}
          
          <button 
            onClick={handleSubmit} 
            className={BUTTONCLASSES} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Signing Up...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button 
            onClick={onSwitchMode} 
            className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors" >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;