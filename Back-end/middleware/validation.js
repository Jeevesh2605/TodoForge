import validator from 'validator';

// Validation middleware for user registration
export const validateUserRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validation middleware for user login
export const validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Email validation
    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validation middleware for task creation/update
export const validateTask = (req, res, next) => {
    const { title, priority, dueDate } = req.body;
    const errors = [];
    
    // Title validation - only required for POST (creation), not PUT (update)
    if (req.method === 'POST' && (!title || title.trim().length < 1)) {
        errors.push('Task title is required');
    }
    
    // If title is provided in update, validate it
    if (req.method === 'PUT' && title && title.trim().length < 1) {
        errors.push('Task title cannot be empty');
    }

    // Priority validation
    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
        errors.push('Priority must be Low, Medium, or High');
    }

    // Due date validation - only validate if dueDate is provided and not empty
    if (dueDate && typeof dueDate === 'string' && dueDate.trim() !== '' && !validator.isISO8601(dueDate, { strict: false })) {
        errors.push('Due date must be a valid date');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error Details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
    });

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // MongoDB connection errors
    if (err.name === 'MongoError' || err.name === 'MongoNetworkError') {
        return res.status(500).json({
            success: false,
            message: 'Database connection error'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Bcrypt errors
    if (err.message && err.message.includes('hash')) {
        return res.status(500).json({
            success: false,
            message: 'Password processing error'
        });
    }

    // Token creation errors
    if (err.message === 'Token creation failed') {
        return res.status(500).json({
            success: false,
            message: 'Authentication service error'
        });
    }

    // Default error - handle all other cases
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
