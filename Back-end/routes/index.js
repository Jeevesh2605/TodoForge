const express = require('express');
const router = express.Router();

// Import individual route files
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const aiRoutes = require('./aiRoutes');

// Use the routes
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);

module.exports = router;