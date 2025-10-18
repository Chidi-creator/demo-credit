import { AuthService } from "@services/auth.service";
import express from "express";
import BlacklistedMiddleware from "@middleware/blacklisted.middleware.auth";
import AccountHandler from "@handlers/account.handler";

const router = express.Router();
const authService = new AuthService();
const accountHandler = new AccountHandler();
const blacklistedMiddleware = new BlacklistedMiddleware();

router
  .route("/create")
  .post(
    [authService.auth, blacklistedMiddleware.handle],
    accountHandler.createAccount
  );

export default router;
