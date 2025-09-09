import React, { useEffect, useState } from 'react'
import { getPriorityColor, MENU_OPTIONS, TI_CLASSES } from '../assets/dummy'
import { CheckCircle2, MoreVertical, Calendar, Clock } from 'lucide-react'
import axios from 'axios'
// import { format, isToday } from 'date-fns'
import TaskModal from './TaskModal'

const API_BASE = 'http://todoforge-env.eba-y7mayiri.ap-south-1.elasticbeanstalk.com/api/tasks'

const TaskItem = ({ task, onRefresh, onLogout, showCompleteCheckbox = true, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  
// Fix: Use task.completed instead of task.isCompleted
  const [isCompleted, setIsCompleted] = useState(() => {
    // Backend stores as boolean, so check for true/false directly
    return task.completed === true || 
           task.completed === 1 || 
           (typeof task.completed === 'string' && 
            ['yes', 'true', '1'].includes(task.completed.toLowerCase()))
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [subtasks] = useState(task.subtasks || [])

  useEffect(() => {
    // Fix: Use task.completed instead of task.isCompleted
    setIsCompleted(
      task.completed === true || 
      task.completed === 1 || 
      (typeof task.completed === 'string' && 
       ['yes', 'true', '1'].includes(task.completed.toLowerCase()))
    )
  }, [task.completed])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error("No auth token found")
    return { Authorization: `Bearer ${token}` }
  }

  const getPriorityBadgeColor = (priority) => {
    const priorityColors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    }
    return priorityColors[priority] || 'bg-gray-100 text-gray-800'
  }

  const handleDelete = async () => {
    try {
      // Fix: Use task._id || task.id to handle both cases
      const taskId = task._id || task.id
      await axios.delete(`${API_BASE}/${taskId}/gp`, {headers: getAuthHeaders()})
      onRefresh?.()
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) onLogout?.()
    }
  }

  const handleAction = (action) => {
    setShowMenu(false)
    switch (action) {
      case 'edit':
        // Fix: Use onEdit prop if provided, otherwise use local modal
        if (onEdit) {
          onEdit(task)
        } else {
          setShowEditModal(true)
        }
        break
      case 'delete':
        handleDelete()
        break
case 'duplicate':
        // Handle duplicate action
        break
      default:
        // Unknown action
    }
  }

  const borderColor = isCompleted ? "border-green-500" : getPriorityColor(task.priority).split(" ")[0]

const handleComplete = async () => {
    const newStatus = isCompleted ? false : true; // Send boolean instead of string
    
    if (isToggling) return; // Prevent multiple clicks
    
    setIsToggling(true);
    
    try {
      const taskId = task._id || task.id
      
      const response = await axios.put(`${API_BASE}/${taskId}/gp`, { completed: newStatus }, 
        { headers: getAuthHeaders() }
      )
      
      setIsCompleted(!isCompleted)
      
      // Force refresh after a short delay to ensure state update
      setTimeout(() => {
        onRefresh?.()
      }, 100);
      
    } catch (err) {
      console.error('Error updating completion status:', err)
      if (err.response?.status === 401) onLogout?.()
    } finally {
      setIsToggling(false);
    }
  }

  const handleSave = async (updatedTask) => {
    try {
      const payload = (({ title, description, priority, dueDate, completed }) => 
        ({ title, description, priority, dueDate, completed }))(updatedTask)
      
      // Fix: Use task._id || task.id
      const taskId = task._id || task.id
      await axios.put(`${API_BASE}/${taskId}/gp`, payload, 
        { headers: getAuthHeaders() })
      setShowEditModal(false)
      onRefresh?.()
    } catch (err) {
      console.error(err)
      if (err.response?.status === 401) onLogout?.()
    }
  }

  const isTaskToday = (date) => {
    if (!date) return false
    try {
      const today = new Date()
      const taskDate = new Date(date)
      return today.toDateString() === taskDate.toDateString()
    } catch {
      return false
    }
  }

  const formatDate = (date, format) => {
    if (!date) return '--'
    try {
      const d = new Date(date)
      if (format === 'MMM dd') {
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
      }
      return d.toLocaleDateString()
    } catch {
      return '--'
    }
  }

  // const progress = subtasks.length ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100 : 0

  return (
    <>
      <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
        <div className={TI_CLASSES.leftContainer}>
{showCompleteCheckbox && (
            <button onClick={handleComplete}
              disabled={isToggling}
              className={`${TI_CLASSES.completeBtn} ${isCompleted ? 'text-green-500' : 'text-gray-500'} ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <CheckCircle2 size={18} className={`${TI_CLASSES.checkboxIconBase} ${
                isCompleted ? 'fill-green-500' : ''} ${isToggling ? 'animate-spin' : ''}`} />
            </button>
          )}
          <div className='flex-1 min-w-0'>
            <div className='flex items-baseline gap-2 mb-1 flex-wrap'>
              <h3 className={`${TI_CLASSES.titleBase}
                ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              {task.priority && (
                <span className={`${TI_CLASSES.priorityBadge}
                  ${getPriorityBadgeColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
            </div>
            {task.description && <p className={TI_CLASSES.description}>
              {task.description}</p>}
            
            {/* Due Date Section */}
            <div className={`${TI_CLASSES.dateRow} ${task.dueDate && isTaskToday(task.dueDate) 
              ? 'text-fuchsia-600' : 'text-gray-500'}`}>
              <Calendar className='w-3.5 h-3.5' />
              {task.dueDate ? (isTaskToday(task.dueDate) ? 
                'Today' : formatDate(task.dueDate, 'MMM dd')) : 'No due date'}
            </div>
            
            {/* Created Date Section */}
            <div className={TI_CLASSES.createdRow}>
              <Clock className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
              {task.createdAt ? 
                `Created ${formatDate(task.createdAt, 'MMM dd')}` : 'No date'}
            </div>
          </div>
        </div>
        <div className={TI_CLASSES.rightContainer}>
          <div className='relative'>
            <button onClick={() => setShowMenu(!showMenu)}
              className={TI_CLASSES.menuButton}>
              <MoreVertical className='w-4 h-4 sm:w-5 sm:h-5' size={18} />
            </button>
            {showMenu && (
              <div className={TI_CLASSES.menuDropdown}>
                {MENU_OPTIONS.flatMap(opt => (
                  <button key={opt.action} onClick={() => handleAction(opt.action)}
                    className='w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-purple-50
                     flex items-center gap-2 transition-colors duration-200'>
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Task Edit Modal - Only show if onEdit is not provided */}
      {!onEdit && (
        <TaskModal 
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          taskToEdit={task}
          onSave={handleSave} 
        />
      )}
    </>
  )
}

export default TaskItem