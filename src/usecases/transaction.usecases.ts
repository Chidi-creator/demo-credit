import TransactionRepository from "@repositories/transaction.repository";
import { ITransaction } from "@models/transaction";

class TransactionUseCases {
  // Update transaction status by reference
  public async updateTransactionStatusByReference(reference: string, status: string): Promise<boolean> {
    // Find transaction by reference
    const transaction = await this.transactionRepository.findOneByQuery({ reference });
    if (!transaction || !transaction.id) return false;
  return this.transactionRepository.update(transaction.id, { status: status as any });
  }
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
  public async getTransactionByReference(reference: string): Promise<ITransaction | undefined> {
    return this.transactionRepository.findOneByQuery({ reference });
  }
}
export default TransactionUseCases;