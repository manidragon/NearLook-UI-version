const mongoose = require('mongoose');
const DataInitializationService = require('../services/DataInitializationService');

// Load environment variables from .env file
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGO_URI ? "URI is defined" : "URI is MISSING");
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    DataInitializationService.initializeAdminUser();
  } catch (error) {
    console.error(`MongoDB Connection Error:`, error);
    console.error(`Error Message: ${error.message}`);
    console.log("Holding the server open for 60 seconds so you can read this error in Coolify Runtime Logs...");
    await new Promise(resolve => setTimeout(resolve, 60000));
    process.exit(1); 
  }
};

module.exports = connectDB;