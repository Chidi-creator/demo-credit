import AccountRepository from "@repositories/account.repository";
import { IAccount } from "@models/account";

class AccountUseCases {
  accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  async createAccount(accountData: IAccount): Promise<number> {
    return this.accountRepository.create(accountData);
  }

  async getAccountById(accountId: number): Promise<IAccount | undefined> {
    return this.accountRepository.findById(accountId);
  }

  async updateAccount(
    accountId: number,
    accountData: Partial<IAccount>
  ): Promise<boolean> {
    return this.accountRepository.update(accountId, accountData);
  }

  async deleteAccount(accountId: number): Promise<boolean> {
    return this.accountRepository.delete(accountId);
  }

  async findUserAccountsById(userId: number): Promise<IAccount[]> {
    return await this.accountRepository.findAllByColumn("user_id", userId);
  }
}
export default AccountUseCases;
