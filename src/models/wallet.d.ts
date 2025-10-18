import { WALLET_STATUS } from "@config/constants.config";
import { BaseEntity } from "./base";

export interface IWallet extends BaseEntity {
  user_id: number;
  balance?: number;
  currency?: string;
  flutterwave_account_ref: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  
  status?: WALLET_STATUS;
}
