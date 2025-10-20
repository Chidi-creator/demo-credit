import { env } from "@config/env";
import { connectDB } from "./db/mysql";
import { redisConfig } from "@providers/index";
import middleware from "./middleware";
import logger from "@services/logger.service";
import dotenv from "dotenv";

dotenv.config();

const startServer = async () => {
  try {
    // Connect to database FIRST
    await connectDB();
    logger.info(" MySQL database connected successfully");

    // Initialize and connect to Redis
    logger.info("Connecting to Redis...");
    await redisConfig.connect();
    logger.info(" Redis connected successfully");

    const PORT = process.env.PORT || env.PORT || 3078;
    // THEN start the server
    middleware.getApp().listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};  

// Start the application
startServer();
