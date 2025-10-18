import { BaseEntity } from "./base";

export interface IAccount extends BaseEntity {
  user_id: number;
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  bank_id: number;
  deleted_at?: Date | null;
}
