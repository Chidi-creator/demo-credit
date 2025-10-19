import { ValidationError } from "@managers/error.manager";
import { responseManager } from "@managers/index";
import logger from "@services/logger.service";
import { AuthenticatedRequest } from "@services/types/auth";
import { CreditWalletPayload } from "@services/types/wallet";
import WalletService from "@services/wallet.service";
import { validateCreditWalletPayload } from "@validation/Wallet";
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
}

export default WalletHandler;
