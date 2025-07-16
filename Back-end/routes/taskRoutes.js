import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { validateTask } from '../middleware/validation.js';
import { 
    createTask, 
    deleteTask, 
    getTask, 
    getTaskById, 
    updateTask 
} from '../controllers/taskController.js';

const taskRouter = express.Router();

taskRouter.route('/gp')
    .get(authMiddleware, getTask)   
    .post(authMiddleware, validateTask, createTask);  

taskRouter.route('/:id/gp')
    .get(authMiddleware, getTaskById)  
    .put(authMiddleware, validateTask, updateTask)
    .delete(authMiddleware, deleteTask);

export default taskRouter;
