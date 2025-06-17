import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://jeeveshchaurasiya:Bhoomi13@cluster0.vncpsoq.mongodb.net/TodoForge')
     .then(() => console.log('DB CONNECTED'));
}