import RedisConfig from "./cache/redis";
import NodemailerConfig from "./notification/nodemailer";

export const redisConfig = RedisConfig.getInstance();
export const nodemailerConfig = NodemailerConfig.getInstance();
