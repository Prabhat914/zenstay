import mongoose from "mongoose";

let connectionPromise = null;

const connectDb = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
    if (!mongoUrl) {
        throw new Error("MongoDB connection string is missing");
    }

    connectionPromise = mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 8000
    }).then((connection) => {
        console.log("DB connected");
        return connection;
    }).catch((error) => {
        connectionPromise = null;
        console.log("db error", error?.message || error);
        throw error;
    });

    return connectionPromise;
};

export default connectDb;
