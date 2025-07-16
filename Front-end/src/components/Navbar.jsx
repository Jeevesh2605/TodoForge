import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Swords, Cog, Moon } from 'lucide-react';

const Navbar = ({ user = {}, onLogout, darkMode, toggleDarkMode }) => {
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);
  
  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  
  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  return (
    <header className='sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 font-sans py-2'>
      <div className="flex items-center justify-between px-5 md:px-6 max-w-7xl mx-auto">
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer group"
             onClick={() => navigate('/')}>
            <div className='relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg group-hover:shadow-purple-300/50 group-hover:scale-105 transition-all duration-300'>
            <Swords className='w-6 h-6 text-gray-800 dark:text-white' />
            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-gray-900 rounded-full shadow-md animate-ping' />
          </div>
          <span className='text-2xl font-extrabold bg-gradient-to-r from-black via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent tracking-wide'>
            TodoForge
          </span>
        </div>
        
        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          
          <button 
            className='p-2 text-gray-600 hover:text-purple-500 transition-colors duration-300 hover:bg-purple-50 rounded-full dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
            onClick={handleProfileClick}
            aria-label="Profile Settings"
          >
            <Cog className='w-7 h-7' />
          </button>
          
          {/* USER DROPDOWN */}
          <div ref={menuRef} className="relative">
            <button 
              onClick={handleMenuToggle} 
              className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors duration-300 border border-transparent hover:border-purple-200 dark:hover:border-gray-600"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={`${user?.name || 'User'} avatar`} 
                    className='w-9 h-9 rounded-full shadow-sm'
                  />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-white font-semibold shadow-md">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"/>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">{user?.email || 'No email'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {menuOpen && (
              <ul 
                className="absolute top-14 right-0 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-purple-100 dark:border-gray-700 z-50 overflow-hidden"
                role="menu"
              >
                <li className="p-2">
                  <button 
                    onClick={handleProfileClick}
                    className='w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2 rounded-lg' 
                    role='menuitem'
                  >
                    <Cog className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    Profile Settings
                  </button>
                </li>
                <li className="p-2">
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    role='menuitem'
                  >
                    <LogOut className="w-4 h-4"/>
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;