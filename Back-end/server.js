import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import {connectDB} from './config/db.js'
import userRouter from './routes/userRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import { errorHandler } from './middleware/validation.js'

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

connectDB();

app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/ai", aiRouter);

app.get('/', (req, res) =>{
    res.json({
        success: true,
        message: 'Todo Forge API is working',
        version: '1.0.0'
    });
})

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server URL: http://localhost:${port}`);
    console.log(`📝 API Documentation: http://localhost:${port}/api`);
});
