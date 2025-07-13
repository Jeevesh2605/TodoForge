import React, { useCallback, useMemo, useState } from 'react'
import { ADD_BUTTON, HEADER, ICON_WRAPPER, STAT_CARD, STATS_GRID, VALUE_CLASS, WRAPPER, STATS, LABEL_CLASS, FILTER_WRAPPER, FILTER_LABELS, SELECT_CLASSES, FILTER_OPTIONS, TABS_WRAPPER, TAB_BASE, TAB_ACTIVE, TAB_INACTIVE, EMPTY_STATE } from '../assets/dummy'
import { HomeIcon, Plus, Filter, CalendarIcon } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import TaskItem from '../components/TaskItem'
import TaskModal from '../components/TaskModal'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api/tasks'

const Dashboard = () => {
  const { tasks = [], refreshTasks } = useOutletContext() || {}
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectTask] = useState(null)
  const [filter, setFilter] = useState("all")

  // Add debug logging
  console.log('Dashboard received tasks:', tasks)
  console.log('Dashboard tasks length:', tasks.length)

  const stats = useMemo(() => ({
    total: tasks.length,
    lowPriority: tasks.filter(t => t.priority?.toLowerCase() === 'low').length,
    mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
    completed: tasks.filter(t => t.completed === true || t.completed === 1 || (
      typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes'
    )).length
  }), [tasks])

  const filteredTasks = useMemo(() => {
    console.log('Filtering tasks with filter:', filter)
    console.log('Raw tasks for filtering:', tasks)
    
    const filtered = tasks.filter(task => {
      console.log('Processing task:', task)
      
      switch(filter) {
        case "today":
          // Fix: Check if task has dueDate and handle undefined/null
          if (!task.dueDate) {
            console.log('Task has no dueDate, excluding from today filter')
            return false
          }
          try {
            const dueDate = new Date(task.dueDate)
            const today = new Date()
            return dueDate.toDateString() === today.toDateString()
          } catch (error) {
            console.log('Invalid dueDate format:', task.dueDate)
            return false
          }
          
        case "week":
          // Fix: Check if task has dueDate and handle undefined/null
          if (!task.dueDate) {
            console.log('Task has no dueDate, excluding from week filter')
            return false
          }
          try {
            const dueDateWeek = new Date(task.dueDate)
            const todayWeek = new Date()
            const nextWeek = new Date(todayWeek)
            nextWeek.setDate(todayWeek.getDate() + 7)
            return dueDateWeek >= todayWeek && dueDateWeek <= nextWeek
          } catch (error) {
            console.log('Invalid dueDate format:', task.dueDate)
            return false
          }
          
        case "high":
        case "medium":
        case "low":
          // Fix: Handle undefined/null priority
          if (!task.priority) {
            console.log('Task has no priority, excluding from priority filter')
            return false
          }
          return task.priority.toLowerCase() === filter
          
        default:
          // Fix: For "all" filter, show all tasks regardless of missing fields
          return true
      }
    })
    
    console.log('Filtered tasks:', filtered)
    return filtered
  }, [tasks, filter])

  // SAVING TASKS - Fixed to handle both create and update
  const handleTaskSave = useCallback(async (taskData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      if (taskData.id || taskData._id) {
        // Update existing task
        const taskId = taskData.id || taskData._id
        await axios.put(`${API_BASE}/${taskId}/gp`, taskData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Task updated successfully')
      } else {
        // Create new task
        await axios.post(`${API_BASE}/gp`, taskData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Task created successfully')
      }
      
      // Refresh tasks and close modal
      await refreshTasks()
      setShowModal(false)
      setSelectTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
      // You might want to show an error message to the user here
    }
  }, [refreshTasks])

  return (
    <div className={WRAPPER}>
      <div className={HEADER}>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:h-6 shrink-0" />
            <span className="truncate"> Task Overview </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7 truncate">Manage your tasks efficiently</p>
        </div>
        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      <div className={STATS_GRID}>
        {STATS.map(({key, label, icon: Icon, iconColor, borderColor = "border-purple-100",
          valueKey, textColor, gradient
        }) => (
          <div key={key} className={`${STAT_CARD} ${borderColor}`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${ICON_WRAPPER} ${iconColor}`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <p className={`${VALUE_CLASS} ${gradient ?
                  "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
                  : textColor}`}>
                  {stats[valueKey]}
                </p>
                <p className={LABEL_CLASS}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONTENTS */}
      <div className='space-y-6'>
        {/* FILTER */}
        <div className={FILTER_WRAPPER}>
          <div className='flex items-center gap-2 min-w-0'>
            <Filter className='w-5 h-5 text-purple-500 shrink-0' />
            <h2 className='text-base md:text-lg font-semibold text-gray-800 truncate'>
              {FILTER_LABELS[filter]}
            </h2>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className={SELECT_CLASSES}>
            {FILTER_OPTIONS.map(opt => <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>)}
          </select>
          <div className={TABS_WRAPPER}>
            {FILTER_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setFilter(opt)} className={`${TAB_BASE} ${filter === opt ?
                TAB_ACTIVE : TAB_INACTIVE}`}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TASK LIST */}
        <div className='space-y-4'>
          {filteredTasks.length === 0 ? (
            <div className={EMPTY_STATE.wrapper}>
              <div className={EMPTY_STATE.iconWrapper}>
                <CalendarIcon className='w-8 h-8 text-purple-500' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                No Tasks Found
              </h3>
              <p className='text-sm text-gray-500 mb-4'>
                {filter === "all" 
                  ? "Create your first task to get started" 
                  : filter === "today" || filter === "week"
                  ? "No tasks with due dates match this filter. Try adding due dates to your tasks."
                  : `No tasks match the '${filter}' filter`}
              </p>
              <button onClick={() => setShowModal(true)} className={EMPTY_STATE.btn}>
                Add New Task
              </button>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={(task) => { setSelectTask(task); setShowModal(true) }}
              />
            ))
          )}
        </div>

        {/* ADD TASK DESKTOP */}
        <div onClick={() => setShowModal(true)}
          className='hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200
           rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer transition-colors'>
          <Plus className='w-5 h-5 text-purple-500 mr-2' />
          <span className='text-gray-600 font-medium'>Add New Task</span>
        </div>
      </div>

      {/* MODAL */}
      <TaskModal 
        isOpen={showModal || !!selectedTask}
        onClose={() => {setShowModal(false); setSelectTask(null)}}
        taskToEdit={selectedTask}
        onSave={handleTaskSave} 
      />
    </div>
  )
}

export default Dashboard