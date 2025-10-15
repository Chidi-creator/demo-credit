import { env } from "@config/env";
import { connectDB } from "./db/mysql";
import middleware from "./middleware";

const startServer = async () => {
  try {
    // Connect to database FIRST
    await connectDB();

    //  start the server
    middleware.getApp().listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();
