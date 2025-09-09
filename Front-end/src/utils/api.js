import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://todoforge-env.eba-y7mayiri.ap-south-1.elasticbeanstalk.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // Handle different error status codes
      switch (response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
          toast.error('Session expired. Please log in again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(response.data?.message || 'An error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelper = {
  // User API calls
  user: {
    register: async (userData) => {
      const response = await api.post('/api/user/register', userData);
      return response.data;
    },
    
    login: async (credentials) => {
      const response = await api.post('/api/user/login', credentials);
      return response.data;
    },
    
    getProfile: async () => {
      const response = await api.get('/api/user/me');
      return response.data;
    },
    
    updateProfile: async (profileData) => {
      const response = await api.put('/api/user/profile', profileData);
      return response.data;
    },
    
    updatePassword: async (passwordData) => {
      const response = await api.put('/api/user/password', passwordData);
      return response.data;
    },
  },
  
  // Task API calls
  tasks: {
    getAll: async () => {
      const response = await api.get('/api/tasks/gp');
      return response.data;
    },
    
    getById: async (id) => {
      const response = await api.get(`/api/tasks/${id}/gp`);
      return response.data;
    },
    
    create: async (taskData) => {
      const response = await api.post('/api/tasks/gp', taskData);
      return response.data;
    },
    
    update: async (id, taskData) => {
      const response = await api.put(`/api/tasks/${id}/gp`, taskData);
      return response.data;
    },
    
    delete: async (id) => {
      const response = await api.delete(`/api/tasks/${id}/gp`);
      return response.data;
    },
  },
};

// Utility functions
export const utils = {
  // Format date for display
  formatDate: (date, format = 'short') => {
    if (!date) return 'No date';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    
    const options = {
      short: { month: 'short', day: '2-digit' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      datetime: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    };
    
    return d.toLocaleDateString('en-US', options[format] || options.short);
  },
  
  // Check if date is today
  isToday: (date) => {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    return today.toDateString() === taskDate.toDateString();
  },
  
  // Check if date is overdue
  isOverdue: (date) => {
    if (!date) return false;
    const today = new Date();
    const taskDate = new Date(date);
    return taskDate < today && !utils.isToday(date);
  },
  
  // Get priority color
  getPriorityColor: (priority) => {
    const colors = {
      Low: 'text-green-600 bg-green-50 border-green-200',
      Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      High: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[priority] || colors.Low;
  },
  
  // Get task status
  getTaskStatus: (task) => {
    const isCompleted = task.completed === true || 
                       task.completed === 'Yes' || 
                       task.completed === 'yes' || 
                       task.completed === 1;
    
    if (isCompleted) return 'completed';
    if (task.dueDate && utils.isOverdue(task.dueDate)) return 'overdue';
    if (task.dueDate && utils.isToday(task.dueDate)) return 'due-today';
    return 'pending';
  },
  
  // Filter tasks
  filterTasks: (tasks, filter) => {
    return tasks.filter(task => {
      switch (filter) {
        case 'today':
          return task.dueDate && utils.isToday(task.dueDate);
        case 'week': {
          if (!task.dueDate) return false;
          const today = new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate <= nextWeek;
        }
        case 'high':
        case 'medium':
        case 'low': {
          return task.priority?.toLowerCase() === filter.toLowerCase();
        }
        case 'completed':
          return task.completed === true || 
                 task.completed === 'Yes' || 
                 task.completed === 'yes' || 
                 task.completed === 1;
        case 'pending':
          return !(task.completed === true || 
                   task.completed === 'Yes' || 
                   task.completed === 'yes' || 
                   task.completed === 1);
        default:
          return true;
      }
    });
  },
  
  // Sort tasks
  sortTasks: (tasks, sortBy) => {
    const sorted = [...tasks];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'dueDate': {
        return sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      }
      default:
        return sorted;
    }
  },
  
  // Debounce function for search
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Local storage helpers
  storage: {
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error getting from localStorage:', error);
        return null;
      }
    },
    
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error setting to localStorage:', error);
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    },
  },
};

export default api;
