import { env } from "@config/env";
import knex from "knex";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = env;

 const db = knex({
  client: "mysql2",
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
  },
});

export const connectDB = async () => {
  try {
    await db.raw("SELECT 1");
    console.log("MySQL database connected successfully.");
  } catch (error: any) {
    console.error(" Database connection failed:", error.message);
    throw error;
  } 
};

export default db;