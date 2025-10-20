import Middleware from "./middleware";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import passport from "passport";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from '../swagger';

const specs = swaggerJsdoc(swaggerOptions);
import AuthRouter from "@deliverymen/auth.delivery";
import VerificationRouter from "@deliverymen/verification.delivery";
import AccountRouter from "@deliverymen/accounts.delivery";
import BankRoute from "@deliverymen/banks.delivery";
import WalletRouter from "@deliverymen/wallet.delivery";
import UserRouter from "@deliverymen/users.delivery";
import TransactionRouter from "@deliverymen/transaction.delivery";
import requestLogger from "@middleware/logger.middleware";
import { swaggerUiMiddleware, swaggerUiHandler } from "@config/swagger.setup";

const app = express();
const middleware = new Middleware(app);

const setUpRoutes = (middleware: Middleware) => {
  // Healthcheck route
  middleware.addMiddleware("/healthcheck", (req: Request, res: Response) => {
    res.status(200).send("Demo Credit Server is up and running!");
  });

  // Swagger documentation route
  middleware.addMiddleware("/api-docs", swaggerUi.serve);
  middleware.addMiddleware("/api-docs", swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Demo Credit API Documentation'
  }));

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
