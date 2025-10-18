import { IBank } from "@models/bank";
import BankRepository from "@repositories/banks.repository";
class BanksUseCases {
  bankRepository: BankRepository;
  constructor() {
    this.bankRepository = new BankRepository();
  }

  async createBank(bankData: IBank): Promise<number> {
    return await this.bankRepository.create(bankData);
  }

  async insertBanks(banksData: IBank[]): Promise<number[]> {
    return await this.bankRepository.insertMany(banksData);
  }

  async getAllBanks(): Promise<IBank[]> {
    return await this.bankRepository.findAll();
  }
  async getBankById(id: number): Promise<IBank | undefined> {
    return await this.bankRepository.findById(id);
  }
  async getBankByCode(bankCode: string): Promise<IBank | undefined> {
    return await this.bankRepository.findOneByQuery({ bank_code: bankCode });
  }
}

export default BanksUseCases;