import TransactionHandler from "@handlers/transaction.handler";
import express from "express";
import { AuthService } from "@services/auth.service";
import BlacklistedMiddleware from "@middleware/blacklisted.middleware.auth";

const router = express.Router();
const authService = new AuthService();
const blacklistedMiddleware = new BlacklistedMiddleware();

const transactionHandler = new TransactionHandler();

router
  .route("/webhook/flutterwave/deposit")
  .post(
    transactionHandler.handleDepositWebhook
  );

  export default router;  

