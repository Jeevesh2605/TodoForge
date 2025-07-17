import React, { useCallback, useEffect, useState } from 'react'
import { baseControlClasses, DEFAULT_TASK, priorityStyles } from '../assets/dummy'
import { AlignLeft, Calendar, PlusCircle, X, Flag, Save, CheckCircle } from 'lucide-react'

const API_BASE = 'https://todoforge-backend.onrender.com/api/tasks'

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      // Normalize the completed status for editing
      const isCompleted = taskToEdit.completed === true ||
                         taskToEdit.completed === 1 ||
                         (typeof taskToEdit.completed === 'string' &&
                          ['yes', 'true', '1'].includes(taskToEdit.completed.toLowerCase()));
      
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'Low',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        completed: isCompleted ? 'Yes' : 'No',
        id: taskToEdit._id,
      });
    } else {
      setTaskData(DEFAULT_TASK)
    }
    setError(null)
  }, [isOpen, taskToEdit])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }))
  }, [])

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No auth Token Found')
    return {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); // Prevent default form submission
    
// Validation
    if (!taskData.title.trim()) {
      setError('Task title is required.');
      return;
    }
    
    if (taskData.dueDate && taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }
    
    setLoading(true)
    setError(null)

    try {
      const isEdit = Boolean(taskData.id);
      const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;
      
      const resp = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      
      if (!resp.ok) {
        if (resp.status === 401) return onLogout?.();
        const err = await resp.json();
        throw new Error(err.message || 'Failed to save task')
      }
      
const saved = await resp.json();
      onSave?.(saved);
      onClose();
    } catch (err) {
      console.error('TaskModal error:', err)
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false)
    }
  }, [taskData, today, getHeaders, onLogout, onSave, onClose])

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4'>
      <div className='bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg relative p-6 animate-fadeIn'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            {taskData.id ? <Save className='text-purple-500 w-5 h-5' /> :
              <PlusCircle className='text-purple-500 w-5 h-5' />}
            {taskData.id ? 'Edit Task' : 'Create New Task'}
          </h2>

          <button onClick={onClose} className='p-2 hover:bg-purple-100 rounded-lg
          transition-colors text-gray-500 hover:text-purple-700'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* FORM TO CREATE/EDIT A TASK */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='text-sm text-red-600 bg-red-50 p-3 rounded-lg
          border border-red-100'>{error}</div>}
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Task Title
            </label>
            <div className='flex items-center border border-purple-100 rounded-lg px-3 py-2.5
            focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500
            transition-all duration-200'>
              <input type="text" name='title' required value={taskData.title}
                onChange={handleChange} className='w-full focus:outline-none text-sm'
                placeholder='Enter Task Title' />
            </div>
          </div>
          
          <div>
            <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
              <AlignLeft className='w-4 h-4 text-purple-500' /> Description
            </label>
            <textarea name="description" rows="3"
              onChange={handleChange} value={taskData.description}
              className={baseControlClasses} placeholder='Add details about your task' />
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                <Flag className='w-4 h-4 text-purple-500' /> Priority
              </label>
              <select name='priority' value={taskData.priority} onChange={handleChange}
                className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-1'>
                <Calendar className='w-4 h-4 text-purple-500' /> Due Date
              </label>
              <input type="date" name='dueDate' min={today} value={taskData.dueDate}
                onChange={handleChange} className={baseControlClasses} />
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end gap-3 pt-4'>
            <button type="button" onClick={onClose} 
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className='px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
              {loading ? 'Saving...' : (taskData.id ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal