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
async getWalletById(walletId: number): Promise<IWallet | undefined> {
    return await this.walletRepository.findById(walletId);
  }
  async updateWalletBalance(
    walletId: number,
    newBalance: number
  ): Promise<boolean> {
    return await this.walletRepository.update(walletId, {
      balance: newBalance,
    });
  }

  async getWalletByFlutterwaveRef(
    flutterwaveRef: string
  ): Promise<IWallet | undefined> {
    return await this.walletRepository.findOneByQuery({
      flutterwave_account_ref: flutterwaveRef,
    });
  }

  async getWalletByAccountNumber(
    accountNumber: string
  ): Promise<IWallet | undefined> {
    return await this.walletRepository.findOneByQuery({
      account_number: accountNumber,
    });
  }

  async handleInternalWalletTransfer(
    senderWalletId: number,
    receiverWalletId: number,
    amount: number
  ): Promise<void> {
    return await this.walletRepository.handleInternalWalletTransfer(
      senderWalletId,
      receiverWalletId,
      amount
    );
  }

 async withdrawfromWallet(walletId: number, amount: number): Promise<void> {
    return await this.walletRepository.withdrawfromWallet(walletId, amount);
  }

}

export default WalletUseCases;
