import { IWallet } from "@models/wallet";

import { BaseRepository } from "./base.repository";

class WalletRepository extends BaseRepository<IWallet> {
  protected table = "wallets";
}

export default WalletRepository;