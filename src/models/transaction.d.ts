import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@config/constants.config";
import { BaseEntity } from "./base";

export interface ITransaction extends BaseEntity {
  wallet_id: number;
  type: TRANSACTION_TYPE;
  reference: string;
  amount: number;
  currency: string;
  status: TRANSACTION_STATUS;
  direction: TRANSACTION_DIRECTION;
  description?: string;
  metadata?: Record<string, any>;
  external_reference?: string | null;
}
