import { IBank } from "@models/bank";
import { BaseRepository } from "./base.repository";

class BankRepository extends BaseRepository<IBank> {
  protected table = "banks";
}

export default BankRepository;
