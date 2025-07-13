import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Circle, Clock, Zap, TrendingUp } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';

const Layout = ({ onLogout, user, children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No auth token found");
      
      const { data } = await axios.get("http://localhost:4000/api/tasks/gp", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', data); // Debug log
      
      // Simplified processing - focus on the working case
      let arr = [];
      if (data && data.success && Array.isArray(data.tasks)) {
        arr = data.tasks;
      } else if (Array.isArray(data)) {
        arr = data;
      } else {
        console.warn('Unexpected API response format:', data);
        arr = [];
      }
      
      console.log('Processed tasks array:', arr);
      console.log('Tasks array length:', arr.length);
      console.log('Setting tasks state...');
      
      setTasks(arr);
      
      // Verify state update
      setTimeout(() => {
        console.log('Tasks state should be updated now');
      }, 100);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || "Could not load tasks.");
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  const StatCard = ({ title, value, icon }) => (
    <div className='p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300 hover:border-purple-100 group'>
      <div className='flex items-center gap-2'>
        <div className='p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500/10 group-hover:from-fuchsia-500/20 group-hover:to-purple-500/20'>
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-lg sm:text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent'>
            {value}
          </p>
          <p className='text-xs text-gray-500 font-medium'>{title}</p>
        </div>
      </div>
    </div>
  );

  // Show loading spinner while fetching tasks
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500' />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
        <div className='bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md'>
          <p className='font-medium mb-2'>Error Loading</p>
          <p className='text-sm'>{error}</p>
          <button
            onClick={fetchTasks}
            className='mt-4 py-2 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if this is a special page (like Profile) that needs full width
  const isSpecialPage = children && React.isValidElement(children) && children.type.name === 'Profile';

  const SidebarStats = () => (
    <div className='xl:col-span-1 space-y-4 sm:space-y-6'>
      {/* Task Statistics */}
      <div className='bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100'>
        <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2'>
          <TrendingUp className='w-4 h-4 sm:h-5 sm:w-5 text-purple-500' />
          Task Statistics
        </h3>
        <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6'>
          <StatCard
            title='Total Tasks'
            value={stats.totalCount}
            icon={<Circle className='w-3.5 h-3.5 sm:h-4 text-purple-500' />}
          />
          <StatCard
            title='Completed'
            value={stats.completedTasks}
            icon={<Circle className='w-3.5 h-3.5 sm:h-4 text-green-500' />}
          />
          <StatCard
            title='Pending Tasks'
            value={stats.pendingCount}
            icon={<Circle className='w-3.5 h-3.5 sm:h-4 text-fuchsia-500' />}
          />
          <StatCard
            title='Completion Rate'
            value={`${stats.completionPercentage}%`}
            icon={<Zap className='w-3.5 h-3.5 sm:h-4 text-purple-500' />}
          />
        </div>
        <hr className='my-3 sm:my-4 border-purple-100' />
        <div className='space-y-2 sm:space-y-3'>
          <div className='flex items-center justify-between text-gray-700'>
            <span className='text-xs sm:text-sm font-medium flex items-center gap-1.5'>
              <Circle className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500 fill-purple-500' />
              Task Progress
            </span>
            <span className='text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 sm:px-2 rounded-full'>
              {stats.completedTasks}/{stats.totalCount}
            </span>
          </div>
          <div className='relative pt-1'>
            <div className='flex gap-1.5 items-center'>
              <div className='flex-1 h-2 sm:h-3 bg-purple-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500'
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100'>
        <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2'>
          <Clock className='w-4 h-4 sm:w-5 sm:h-5 text-purple-500' />
          Recent Activity
        </h3>
        <div className='space-y-2 sm:space-y-3'>
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task._id || task.id}
              className='flex items-center justify-between p-2 sm:p-3 hover:bg-purple-50/50 rounded-lg transition-colors duration-200 border-transparent hover:border-purple-100'
            >
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-700 break-words whitespace-normal'>
                  {task.title}
                </p>
                <p className='text-xs text-gray-500 mt-0.5'>
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleDateString()
                    : "NO DATE"}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                  task.completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-fuchsia-100 text-fuchsia-700'
                }`}
              >
                {task.completed ? "Done" : "Pending"}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className='text-center py-4 sm:py-6 px-2'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mb-4 rounded-full bg-purple-100 flex items-center justify-center'>
                <Clock className='w-6 h-6 sm:w-8 sm:h-8 text-purple-500' />
              </div>
              <p className='text-sm text-gray-500'>No Recent Activity</p>
              <p className='text-xs text-gray-400 mt-1'>Tasks will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Create context object that will be passed to child components
  const contextValue = {
    tasks,
    refreshTasks: fetchTasks,
    loading,
    error,
    stats
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user={user} />
      
      <div className='ml-0 xl:ml-72 lg:ml-72 md:ml-20 pt-16 p-1 sm:p-2 md:p-2 transition-all duration-300'>
        {/* Handle children (direct rendering) */}
        {children && (
          <div className={isSpecialPage ? 'w-full' : 'grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'}>
            {isSpecialPage ? (
              children
            ) : (
              <>
                <div className='xl:col-span-2 space-y-3 sm:space-y-4'>
                  {React.cloneElement(children, { ...contextValue })}
                </div>
                <SidebarStats />
              </>
            )}
          </div>
        )}

        {/* Handle Outlet (nested routes) */}
        {!children && (
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
            <div className='xl:col-span-2 space-y-3 sm:space-y-4'>
              <Outlet context={contextValue} />
            </div>
            <SidebarStats />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;