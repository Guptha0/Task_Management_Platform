const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow_pro', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Warning: ${error.message}`);
    console.warn(
      `[MongoDB] Tip: Ensure a local MongoDB daemon is running at ${process.env.MONGODB_URI || 'mongodb://localhost:27017'} or update MONGODB_URI in backend/.env to a MongoDB Atlas cluster URI.`
    );
    console.warn(`[MongoDB] Note: TaskFlow Pro frontend will automatically operate seamlessly via Smart Hybrid LocalStorage fallback if the live database is offline.`);
    return null;
  }
};

module.exports = connectDB;
