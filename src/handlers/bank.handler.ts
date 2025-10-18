import BankUseCases from "@usecases/bank.usecase";
import { Request, Response } from "express";
import { responseManager } from "@managers/index";

class BankHandler {
  private bankUseCases: BankUseCases;

  constructor() {
    this.bankUseCases = new BankUseCases();
  }

  createBank = async (req: Request, res: Response) => {
    try {
      const bankData = req.body;
      const bankId = await this.bankUseCases.createBank(bankData);
      return responseManager.success(
        res,
        { id: bankId },
        "Bank created successfully"
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  getAllBanks = async (req: Request, res: Response) => {
    try {
      const banks = await this.bankUseCases.getAllBanks();
      return responseManager.success(
        res,
        banks,
        "Banks retrieved successfully"
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  getBankById = async (req: Request, res: Response) => {
    try {
      const bankId = Number(req.params.id);
      const bank = await this.bankUseCases.getBankById(bankId);
      if (!bank) {
        return responseManager.notFound(res, "Bank not found");
      }
      return responseManager.success(res, bank, "Bank retrieved successfully");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  getBankByCode = async (req: Request, res: Response) => {
    try {
      const bankCode = req.params.code;
      const bank = await this.bankUseCases.getBankByCode(bankCode);
      if (!bank) {
        return responseManager.notFound(res, "Bank not found");
      }
      return responseManager.success(res, bank, "Bank retrieved successfully");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}

export default BankHandler;
