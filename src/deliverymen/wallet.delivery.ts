import express from "express";
import { AuthService } from "@services/auth.service";
import BlacklistedMiddleware from "@middleware/blacklisted.middleware.auth";
import WalletHandler from "@handlers/wallet.handler";

const router = express.Router();
const walletHandler = new WalletHandler();
const authService = new AuthService();
const blacklistedMiddleware = new BlacklistedMiddleware();

router
  .route("/transfer")
  .post(
    [authService.auth, blacklistedMiddleware.handle],
    walletHandler.handleWalletTransaction
  );

router
  .route("/withdraw")
  .post(
    [authService.auth, blacklistedMiddleware.handle],
    walletHandler.handleWalletWithdrawal
  );

export default router;
