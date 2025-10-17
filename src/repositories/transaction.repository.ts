import { ITransaction } from "@models/transaction";
import { BaseRepository } from "./base.repository";

class TransactionRepository extends BaseRepository<ITransaction> {
  protected table = "transactions";
}

export default TransactionRepository;
