import { UserPlus, User, Mail, Lock } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios'; // Import real axios

const Inputwrapper =
    "flex items-center border border-purple-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200"
const BUTTONCLASSES =
    "w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
const MESSAGE_SUCCESS = "bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100"
const MESSAGE_ERROR = "bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100"

const FIELDS = [
  { name: 'name', type: 'text', placeholder: 'Full Name', icon: User },
  { name: 'email', type: 'email', placeholder: 'Email Address', icon: Mail },
  { name: 'password', type: 'password', placeholder: 'Password', icon: Lock }
];

const API_URL = "http://localhost:4000";
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
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm mt-1">Join TodoForge to manage your tasks</p>
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
            {loading ? "Signing Up..." : (
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