import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@services/types/auth";
import UserUseCases from "@usecases/user.usecase";
import { responseManager } from "@managers/index";
import logger from "@services/logger.service";

export class BlacklistedMiddleware {
  private userUseCases: UserUseCases;

  constructor() {
    this.userUseCases = new UserUseCases();

  
  }

   handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;
      const userId = Number(user?.id);

      if (!user || !userId || isNaN(Number(userId))) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const isUserBlacklisted = await this.userUseCases.isUserBlacklisted(
        userId
      );

      if (isUserBlacklisted) {
        logger.logAuth("BLACKLISTED_ACCESS_ATTEMPT", user.email, false);
        return responseManager.forbidden(
          res,
          "User is blacklisted and cannot perform this action"
        );
      }

      logger.logAuth("BLACKLISTED_ACCESS_CHECK", user.email, true);
      return next();
    } catch (error) {
      logger.error(`Blacklisted middleware error: ${(error as Error).message}`);
      return responseManager.error(
        res,
        "Internal server error in blacklisted middleware"
      );
    }
  }
}

export default BlacklistedMiddleware;
