import joi from "joi";
import { CreditWalletPayload, WithdrawToAccountPayload } from "@services/types/wallet";

export const validateCreditWalletPayload = (object: CreditWalletPayload) => {
  const schema = joi.object({
    account_number: joi.string().required(),
    amount: joi.number().min(0).required(),
    currency: joi.string().valid("NGN").required(),
    description: joi.string().optional(),
  });
  return schema.validate(object);
};

export const validateWithdrawToAccountPayload = (object: WithdrawToAccountPayload) => {
  const schema = joi.object({
    account_bank: joi.string().required(),
    account_number: joi.string().required(),
    amount: joi.number().positive().required(),
    currency: joi.string().valid("NGN").required(),
    narration: joi.string().optional(),
  });
  return schema.validate(object);
};
