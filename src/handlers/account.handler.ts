import { Request, Response } from "express";
import { responseManager } from "@managers/index";
import AccountService from "@services/account.service";
import { AuthenticatedRequest } from "@services/types/auth";
import { IAccount } from "@models/account";
import { resolveBankAccountRequest } from "@services/types/bank";
import { validateAccountCreation } from "@validation/Account";
import AccountUseCases from "@usecases/account.usecase";

class AccountHandler {
  private accountService: AccountService;
  private accountUsecases: AccountUseCases;
  constructor() {
    this.accountService = new AccountService();
    this.accountUsecases = new AccountUseCases();
  }

  //this resolves user's bank account and creates it
  createAccount = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = Number(authReq.user?.id);

      if (!authReq.user || !authReq.user.id || isNaN(userId)) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const data: resolveBankAccountRequest = req.body;

      const { error } = validateAccountCreation(req.body);
      if (error) {
        return responseManager.validationError(res, error.details[0].message);
      }

      const account: IAccount = await this.accountService.resolveBankAccount(
        userId,
        data
      );

      return responseManager.success(
        res,
        account,
        "Bank account resolved and created successfully",
        201
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  //this finds user's bank accounts
  findUserAccountsById = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = Number(authReq.user?.id);

      if (!authReq.user || !authReq.user.id || isNaN(userId)) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const accounts: IAccount[] =
        await this.accountUsecases.findUserAccountsById(userId);

      return responseManager.success(
        res,
        accounts,
        "User accounts retrieved successfully"
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}

export default AccountHandler;
