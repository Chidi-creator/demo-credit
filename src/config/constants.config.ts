import { NodeMailerConfigType } from "@providers/notification/types/email";
import { env } from "./env";

export enum TRANSACTION_TYPE {
  FUND = "fund",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
  REVERSAL = "reversal",
}

export enum TRANSACTION_DIRECTION {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum TRANSACTION_STATUS {
  PENDING = "pending",
  COMPLETED = "successful",
  FAILED = "failed",
}

export enum WALLET_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}
export const nodeMailerConfig: NodeMailerConfigType = {
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
};
