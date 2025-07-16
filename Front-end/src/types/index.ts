// User related types
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Task related types
export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  completed: boolean | string | number;
  owner: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  completed: string;
  id?: string;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  task?: Task;
  tasks?: Task[];
}

// Component props types
export interface TaskItemProps {
  task: Task;
  onRefresh?: () => void;
  onLogout?: () => void;
  showCompleteCheckbox?: boolean;
  onEdit?: (task: Task) => void;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
  onSave?: (task: Task) => void;
  onLogout?: () => void;
}

export interface LayoutProps {
  onLogout: () => void;
  user: User;
  children: React.ReactNode;
}

// Context types
export interface TaskContext {
  tasks: Task[];
  refreshTasks: () => void;
  loading: boolean;
  error: string | null;
  stats: TaskStats;
}

export interface TaskStats {
  totalCount: number;
  completedTasks: number;
  pendingCount: number;
  completionPercentage: number;
}

// API types
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
}

export interface PasswordFormData {
  current: string;
  new: string;
  confirm: string;
}

// Filter types
export type TaskFilter = 'all' | 'today' | 'week' | 'high' | 'medium' | 'low';

// Sort types
export type SortOption = 'newest' | 'oldest' | 'priority';

// Theme types
export type Theme = 'light' | 'dark';

// Status types
export type TaskStatus = 'pending' | 'completed';

// Priority colors
export interface PriorityColors {
  Low: string;
  Medium: string;
  High: string;
}

// Navigation types
export interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  USER: 'currentUser',
  TOKEN: 'token',
  THEME: 'theme',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:4000',
  USER: {
    REGISTER: '/api/user/register',
    LOGIN: '/api/user/login',
    ME: '/api/user/me',
    PROFILE: '/api/user/profile',
    PASSWORD: '/api/user/password',
  },
  TASKS: {
    BASE: '/api/tasks/gp',
    BY_ID: (id: string) => `/api/tasks/${id}/gp`,
  },
} as const;
