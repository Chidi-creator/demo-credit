export interface EnvConfig {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
  PORT: number;
  JWT_SECRET: string;
  FLUTTERWAVE_SECRET_KEY: string;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
  ADJUITOR_API_KEY: string;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_SECURE: boolean;
  MAIL_SERVICE: string;
  OTP_EXPIRES_IN: number;
  FLUTTERWAVE_SANDBOX_SECRET_KEY: string;
}
