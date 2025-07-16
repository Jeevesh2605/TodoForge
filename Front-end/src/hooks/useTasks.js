import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiHelper, utils } from '../utils/api';
import { toast } from 'react-toastify';

export const useTasks = (onLogout) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiHelper.tasks.getAll();
      
      // Handle different response formats
      let taskArray = [];
      if (response.success && Array.isArray(response.tasks)) {
        taskArray = response.tasks;
      } else if (Array.isArray(response)) {
        taskArray = response;
      } else {
        console.warn('Unexpected API response format:', response);
        taskArray = [];
      }
      
      setTasks(taskArray);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to fetch tasks');
      
      if (error.response?.status === 401) {
        onLogout?.();
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  // Create a new task
  const createTask = useCallback(async (taskData) => {
    try {
      const response = await apiHelper.tasks.create(taskData);
      
      if (response.success) {
        toast.success('Task created successfully!');
        await fetchTasks(); // Refresh tasks
        return response.task;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  }, [fetchTasks]);

  // Update an existing task
  const updateTask = useCallback(async (id, taskData) => {
    try {
      const response = await apiHelper.tasks.update(id, taskData);
      
      if (response.success) {
        toast.success('Task updated successfully!');
        await fetchTasks(); // Refresh tasks
        return response.task;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  }, [fetchTasks]);

  // Delete a task
  const deleteTask = useCallback(async (id) => {
    try {
      const response = await apiHelper.tasks.delete(id);
      
      if (response.success) {
        toast.success('Task deleted successfully!');
        await fetchTasks(); // Refresh tasks
        return true;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  }, [fetchTasks]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (task) => {
    try {
      const newCompletedStatus = task.completed === true || 
                                task.completed === 'Yes' || 
                                task.completed === 'yes' || 
                                task.completed === 1 ? 'No' : 'Yes';
      
      await updateTask(task._id || task.id, { completed: newCompletedStatus });
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  }, [updateTask]);

  // Calculate task statistics
  const stats = useMemo(() => {
    const totalCount = tasks.length;
    const completedTasks = tasks.filter(task => 
      task.completed === true || 
      task.completed === 'Yes' || 
      task.completed === 'yes' || 
      task.completed === 1
    ).length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount > 0 ? Math.round((completedTasks / totalCount) * 100) : 0;
    
    // Priority breakdown
    const priorityStats = {
      low: tasks.filter(t => t.priority?.toLowerCase() === 'low').length,
      medium: tasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
      high: tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
    };
    
    // Status breakdown
    const statusStats = {
      overdue: tasks.filter(t => utils.getTaskStatus(t) === 'overdue').length,
      dueToday: tasks.filter(t => utils.getTaskStatus(t) === 'due-today').length,
      upcoming: tasks.filter(t => {
        const status = utils.getTaskStatus(t);
        return status === 'pending' && t.dueDate && !utils.isToday(t.dueDate) && !utils.isOverdue(t.dueDate);
      }).length,
    };
    
    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
      priorityStats,
      statusStats,
    };
  }, [tasks]);

  // Get filtered tasks
  const getFilteredTasks = useCallback((filter) => {
    return utils.filterTasks(tasks, filter);
  }, [tasks]);

  // Get sorted tasks
  const getSortedTasks = useCallback((sortBy) => {
    return utils.sortTasks(tasks, sortBy);
  }, [tasks]);

  // Search tasks
  const searchTasks = useCallback((query) => {
    if (!query.trim()) return tasks;
    
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, [tasks]);

  // Get tasks by status
  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => utils.getTaskStatus(task) === status);
  }, [tasks]);

  // Get recent tasks
  const getRecentTasks = useCallback((limit = 5) => {
    return utils.sortTasks(tasks, 'newest').slice(0, limit);
  }, [tasks]);

  // Initialize tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    // Data
    tasks,
    loading,
    error,
    stats,
    
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    
    // Computed data
    getFilteredTasks,
    getSortedTasks,
    searchTasks,
    getTasksByStatus,
    getRecentTasks,
    
    // Utility functions
    utils,
  };
};

export default useTasks;
