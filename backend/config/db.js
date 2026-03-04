import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);
        console.log("DB connected");
    } catch (error) {
        console.log("db error", error?.message || error);
    }
};

export default connectDb;
