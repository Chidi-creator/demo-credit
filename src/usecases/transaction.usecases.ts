import TransactionRepository from "@repositories/transaction.repository";
import { ITransaction } from "@models/transaction";

class TransactionUseCases {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  public async createTransaction(data: ITransaction): Promise<number> {
    return this.transactionRepository.create(data);
  }

  public async getTransactionById(id: number): Promise<ITransaction | undefined> {
    return this.transactionRepository.findById(id);
  }

  public async updateTransaction(id: number, data: Partial<ITransaction>): Promise<boolean> {
    return this.transactionRepository.update(id, data);
  }

  public async deleteTransaction(id: number): Promise<boolean> {
    return this.transactionRepository.delete(id);
  }
}
export default TransactionUseCases;