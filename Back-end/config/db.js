import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoForge';
        await mongoose.connect(mongoURI);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}
