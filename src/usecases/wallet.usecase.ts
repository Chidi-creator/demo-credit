import { IWallet } from "@models/wallet";
import WalletRepository from "@repositories/wallet.repository";

class WalletUseCases {
  walletRepository: WalletRepository;
    constructor() {
    this.walletRepository = new WalletRepository();
  }
  async createWallet(walletData: IWallet): Promise<number> {
    return await this.walletRepository.create(walletData);
  }
    async insertWallets(walletsData: IWallet[]): Promise<number[]> {
    return await this.walletRepository.insertMany(walletsData);
  }
  async getWalletByUserId(userId: number): Promise<IWallet | undefined> {
    return await this.walletRepository.findOneByQuery({ user_id: userId });
  }
}


export default WalletUseCases;