import "./config/keyManager.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Database connected successfully");

    // Set PORT with fallback
    const PORT = process.env.PORT || 3000;
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('Server closed successfully');
        process.exit(0);
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit with error code
  }
};

startServer();
