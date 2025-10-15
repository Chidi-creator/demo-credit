import { EnvConfig } from "./types/env";
import dotenv from 'dotenv'

dotenv.config();

export const env: EnvConfig = {
    DB_HOST: process.env.DB_HOST as string,
    DB_USER: process.env.DB_USER as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    DB_NAME: process.env.DB_NAME as string,
    DB_PORT: Number(process.env.DB_PORT),
    PORT: Number(process.env.PORT) ,
}