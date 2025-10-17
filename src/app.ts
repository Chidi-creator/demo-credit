import { env } from "@config/env";
import { connectDB } from "./db/mysql";
import { redisConfig } from "@providers/index";
import middleware from "./middleware";
import logger from "@services/logger.service";

const startServer = async () => {
  try {
    // Connect to database FIRST
    await connectDB();
    logger.info(" MySQL database connected successfully");

    // Initialize and connect to Redis
    logger.info("Connecting to Redis...");
    await redisConfig.connect();
    logger.info(" Redis connected successfully");

    // THEN start the server
    middleware.getApp().listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

// Start the application
startServer();
