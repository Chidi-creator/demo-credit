import { IAccount } from "@models/account";
import { BaseRepository } from "./base.repository";

class AccountRepository extends BaseRepository<IAccount> {
  protected table = "accounts";


}

export default AccountRepository;