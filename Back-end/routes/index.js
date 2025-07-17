import express from 'express';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

// Use the routes
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);

export default router;