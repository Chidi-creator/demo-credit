import { Request, Response } from "express";
import TransactionService from "@services/transaction.service";
import { env } from "@config/env";
import logger from "@services/logger.service";
import { FlutterwaveWebhookPayload } from "@services/types/transaction";
import { responseManager } from "@managers/index";

class TransactionHandler {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  handleDepositWebhook = async (req: Request, res: Response) => {
    try {
      const signature = req.headers["verif-hash"] as string;
      const FLW_SECRET_HASH = env.FLUTTERWAVE_SECRET_HASH;

      if (!signature || signature !== FLW_SECRET_HASH) {
        logger.error("Invalid Flutterwave signature");
        return res.status(401).send("Unauthorized");
      }

      const payload: FlutterwaveWebhookPayload = req.body;

      console.log("Flutterwave Webhook Payload:", payload);

      await this.transactionService.processDeposit(payload);
      responseManager.success(
        res,
        {},
        "Flutterwave webhook received successfully"
      );

      logger.info("Request received from flutterwave");
    } catch (err) {}
  };
}

export default TransactionHandler;
