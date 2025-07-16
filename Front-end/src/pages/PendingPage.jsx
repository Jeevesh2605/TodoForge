import React from 'react';
import TaskItem from '../components/TaskItem';
import { useOutletContext } from 'react-router-dom';
import { CT_CLASSES } from '../assets/dummy';
import { Calendar } from 'lucide-react';

const PendingPage = () => {
  const { tasks = [], refreshTasks } = useOutletContext() || {};
  
  
const pendingTasks = tasks.filter(task => {
    // Handle boolean values (backend stores as boolean)
    // For pending tasks, we want completed === false
    const isCompleted = task.completed === true || 
                       task.completed === 1 || 
                       (typeof task.completed === 'string' && 
                        ['yes', 'true', '1'].includes(task.completed.toLowerCase()));
    
    return !isCompleted; // Return true for pending tasks (not completed)
  });

  return (
    <div className={CT_CLASSES.page}>
      <div className={CT_CLASSES.header}>
        <div className={CT_CLASSES.titleWrapper}>
          <h1 className={CT_CLASSES.title}>Pending Tasks</h1>
          <p className={CT_CLASSES.subtitle}>Manage your pending tasks</p>
        </div>
      </div>

      <div className={CT_CLASSES.list}>
        {pendingTasks.length === 0 ? (
          <div className={CT_CLASSES.emptyState}>
            <div className={CT_CLASSES.emptyIconWrapper}>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className={CT_CLASSES.emptyTitle}>No Pending Tasks</h3>
            <p className={CT_CLASSES.emptyText}>You have no pending tasks.</p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <TaskItem 
              key={task._id || task.id} 
              task={task} 
              onRefresh={refreshTasks}
              showCompleteCheckbox={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PendingPage;
