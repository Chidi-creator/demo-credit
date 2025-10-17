import { EnvConfig } from "./types/env";
import dotenv from "dotenv";

dotenv.config();

export const env: EnvConfig = {
  DB_HOST: process.env.DB_HOST as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_PORT: Number(process.env.DB_PORT),
  PORT: Number(process.env.PORT),
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REDIS_USERNAME: process.env.REDIS_USERNAME as string,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  JWT_ACCESS_TOKEN_EXPIRES_IN: process.env
    .JWT_ACCESS_TOKEN_EXPIRES_IN as string,
  JWT_REFRESH_TOKEN_EXPIRES_IN: process.env
    .JWT_REFRESH_TOKEN_EXPIRES_IN as string,
  ADJUITOR_API_KEY: process.env.ADJUITOR_API_KEY as string,
  MAIL_USER: process.env.MAIL_USER as string,
  MAIL_PASS: process.env.MAIL_PASS as string,
  MAIL_HOST: process.env.MAIL_HOST as string,
  MAIL_PORT: Number(process.env.MAIL_PORT),
  MAIL_SECURE: process.env.MAIL_SECURE === "true",
  MAIL_SERVICE: process.env.MAIL_SERVICE as string,
  OTP_EXPIRES_IN: Number(process.env.OTP_EXPIRES_IN)
};
