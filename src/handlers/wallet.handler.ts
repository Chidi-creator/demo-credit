import { ValidationError } from "@managers/error.manager";
import { responseManager } from "@managers/index";
import logger from "@services/logger.service";
import { AuthenticatedRequest } from "@services/types/auth";
import { CreditWalletPayload, WithdrawToAccountPayload } from "@services/types/wallet";
import WalletService from "@services/wallet.service";
import { validateCreditWalletPayload, validateWithdrawToAccountPayload } from "@validation/Wallet";
import { Request, Response } from "express";

class WalletHandler {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  handleWalletTransaction = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const body: CreditWalletPayload = req.body;

      const { error } = validateCreditWalletPayload(req.body);
      if (error) {
        throw new ValidationError(`Invalid request payload: ${error.message}`);
      }

      await this.walletService.handleWalletTransaction(body, userId);
      responseManager.success(res, {
        message: "Wallet transaction completed successfully",
      });
    } catch (error: any) {
      logger.error(`Error handling wallet transaction : ${error.message}`);
      responseManager.handleError(res, error);
    }
  };

  handleWalletWithdrawal = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const body: WithdrawToAccountPayload = req.body;

      const { error } = validateWithdrawToAccountPayload(req.body);
      if (error) {
        throw new ValidationError(`Invalid request payload: ${error.message}`);
      }

      const result = await this.walletService.handleWalletWithdrawal(body, userId);
      responseManager.success(res, result, "Withdrawal initiated successfully");
    } catch (error: any) {
      logger.error(`Error handling wallet withdrawal: ${error.message}`);
      responseManager.handleError(res, error);
    }
  };
}

export default WalletHandler;
