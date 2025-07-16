import React from 'react';
import TaskItem from '../components/TaskItem';
import { useOutletContext } from 'react-router-dom';
import { CT_CLASSES } from '../assets/dummy';
import { CheckCircle2 } from 'lucide-react';

const CompletePage = () => {
  const { tasks = [], refreshTasks } = useOutletContext() || {};
  
  // Debug context received
  console.log('🔍 CompletePage: Context received:', {
    tasksCount: tasks.length,
    tasks: tasks,
    refreshTasks: typeof refreshTasks
  });
  
  const completedTasks = tasks.filter(task => {
    // Handle boolean values (backend stores as boolean)
    const isCompleted = task.completed === true || 
                       task.completed === 1 || 
                       (typeof task.completed === 'string' && 
                        ['yes', 'true', '1'].includes(task.completed.toLowerCase()));
    
    console.log('🔍 CompletePage: Task', task.title, 'completed status:', task.completed, 'type:', typeof task.completed, 'isCompleted:', isCompleted);
    
    return isCompleted; // Return true for completed tasks
  });
  
  console.log('🔍 CompletePage: Filtered completed tasks:', completedTasks);
  console.log('🔍 CompletePage: Completed tasks length:', completedTasks.length);

  return (
    <div className={CT_CLASSES.page}>
      <div className={CT_CLASSES.header}>
        <div className={CT_CLASSES.titleWrapper}>
          <h1 className={CT_CLASSES.title}>Completed Tasks</h1>
          <p className={CT_CLASSES.subtitle}>Review your completed tasks</p>
        </div>
      </div>

      <div className={CT_CLASSES.list}>
        {completedTasks.length === 0 ? (
          <div className={CT_CLASSES.emptyState}>
            <div className={CT_CLASSES.emptyIconWrapper}>
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className={CT_CLASSES.emptyTitle}>No Completed Tasks</h3>
            <p className={CT_CLASSES.emptyText}>You have not completed any tasks yet.</p>
          </div>
        ) : (
          completedTasks.map(task => (
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

export default CompletePage;
