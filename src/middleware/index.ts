import Middleware from "./middleware";
import express from "express";
import cors from "cors";
import passport from "passport";
import AuthRouter from "@deliverymen/auth.delivery";
import VerificationRouter from "@deliverymen/verification.delivery";
import AccountRouter from "@deliverymen/accounts.delivery";
import BankRoute from "@deliverymen/banks.delivery";
import WalletRouter from "@deliverymen/wallet.delivery";
import UserRouter from "@deliverymen/users.delivery";
import TransactionRouter from "@deliverymen/transaction.delivery";
import requestLogger from "@middleware/logger.middleware";


const middleware = new Middleware(express());

const setUpRoutes = (middleware: Middleware) => {
  //healthcheck route
  middleware.addMiddleware("/healthcheck", (req, res) => {
    res.status(200).send("Demo Credit Server is up and running!");
  });


  middleware.addMiddleware("/auth", AuthRouter);
  middleware.addMiddleware("/verification", VerificationRouter);
  middleware.addMiddleware("/accounts", AccountRouter);
  middleware.addMiddleware("/users", UserRouter);
  middleware.addMiddleware("/banks", BankRoute);
  middleware.addMiddleware("/wallets", WalletRouter);
  middleware.addMiddleware("/transactions", TransactionRouter);
};

const setUpMiddleware = () => {
  middleware.addMiddleware(cors());
  middleware.addMiddleware(express.json());
  
  // Add request logging middleware
  middleware.addMiddleware(requestLogger);
  
  middleware.addMiddleware(passport.initialize());

  setUpRoutes(middleware);
};

setUpMiddleware();

export default middleware;
