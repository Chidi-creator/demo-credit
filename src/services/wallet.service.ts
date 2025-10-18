import { IWallet } from "@models/wallet";
import { flutterwaveWalletProvider } from "@providers/index";
import {
  CreateWalletRequest,
  CreateWalletResponse,
} from "@providers/wallet/types/wallet";
import WalletUseCases from "@usecases/wallet.usecase";
import logger from "./logger.service";

class WalletService {
  private walletUsecase: WalletUseCases;

  constructor() {
    this.walletUsecase = new WalletUseCases();
  }
  async CallWalletApi(
    Data: CreateWalletRequest,
    userId: number
  ): Promise<IWallet> {
    try {
      const response = await flutterwaveWalletProvider.createWallet(Data);
      console.log("Flutterwave Wallet Response:", response);
      let walletData = {} as IWallet;

      if (response.status == "success") {
        walletData = {
          user_id: userId,
          account_number: response.data.account_number,
          bank_name: response.data.bank_name,
          bank_code: Data.bank_code,
          flutterwave_account_ref: response.data.flw_ref,
        };
        await this.createWalletRecord(walletData);
      } else {
        logger.error(
          `Failed to create wallet for user ID: ${userId}. Flutterwave response status: ${response.status}`
        );
        throw new Error(`Failed to create wallet: ${response.message}`);
      }
      return walletData;
    } catch (error: any) {
      logger.error(
        `Error creating wallet for user ID: ${userId}`
      );
      throw error;
    }
  }
  private createWalletRecord(data: IWallet) {
    return this.walletUsecase.createWallet(data);
  }

  public generateTxRef(userId: number): string {
    const timestamp = Date.now();
    return `DC${userId}_${timestamp}`;
  }
}

export default WalletService;
