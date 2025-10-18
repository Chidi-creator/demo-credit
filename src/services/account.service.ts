import { resolveBankAccountRequest } from "./types/bank";
import {
  FlutterwaveBankRequest,

} from "@providers/bankAccount/types/banks";
import { flutterwaveBankResolver } from "@providers/index";
import AccountUseCases from "@usecases/account.usecase";
import { IAccount } from "@models/account";
import { ProviderError } from "@managers/error.manager";
import BanksUseCases from "@usecases/bank.usecase";
import logger from "./logger.service";

class AccountService {
  private accountUseCases: AccountUseCases;
  private bankUsecases: BanksUseCases;

  constructor() {
    this.bankUsecases = new BanksUseCases();
    this.accountUseCases = new AccountUseCases();
  }

  async resolveBankAccount(
    userId: number,
    Data: resolveBankAccountRequest
  ): Promise<IAccount> {
    try {
      const payload: FlutterwaveBankRequest = {
        account_number: Data.account_number,
        account_bank: Data.bank_code,
      };

      const response = await flutterwaveBankResolver.callResolveBankAccountAPI(
        payload,
        userId
      );

      let accountData = {} as IAccount;

      if (response.status == "success") {
        const bank = await this.bankUsecases.getBankByCode(Data.bank_code);
        if (!bank) {
          logger.error(
            `Bank with code ${Data.bank_code} not found in local database.`
          );
          throw new ProviderError(
            `Bank with code ${Data.bank_code} not found in local database.`
          );
        }
        if (bank.id == null || bank.id == undefined) {
          logger.error(
            `Bank with code ${Data.bank_code} has no id in local database.`
          );
          throw new ProviderError(
            `Bank with code ${Data.bank_code} has no id in local database.`
          );
        }

        accountData = {
          bank_id: bank.id,
          user_id: userId,
          bank_name: bank.bank_name,
          account_number: Data.account_number,
          bank_code: Data.bank_code,
          account_name: response.data.account_name,
        };
        await this.CreateUserBankAccount(accountData);
      }

      return accountData;
    } catch (error: any) {
      throw new ProviderError(
        `Bank account resolution failed: ${error.message}`
      );
    }
  }

 private async CreateUserBankAccount(account: IAccount) {
    try {
      return this.accountUseCases.createAccount(account);
    } catch (error: any) {
      throw new ProviderError(
        `Creating user bank account failed: ${error.message}`
      );
    }
  }
}

export default AccountService;
