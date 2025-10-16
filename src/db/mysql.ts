import knex from "knex";
import config from "../../knexfile";

const db = knex(config);

export const connectDB = async () => {
  try {
    await db.raw("SELECT 1");
    console.log("MySQL database connected successfully.");
  } catch (error: any) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default db;