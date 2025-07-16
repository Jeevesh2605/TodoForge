import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export default async function authMiddleware(req, res, next) {
    // GRAB THE BEARER TOKEN FROM AUTHORIZATION HEADER
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
            .status(401)
            .json({ success: false, message: "Not Authorized, token missing" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // VERIFY & ATTACH THE USER OBJECT
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        req.user = user;
        next();
        
    } catch (err) {
        
        // Handle different types of JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired", 
                code: "TOKEN_EXPIRED" 
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token", 
                code: "INVALID_TOKEN" 
            });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: "Token verification failed", 
                code: "VERIFICATION_FAILED" 
            });
        }
    }
}