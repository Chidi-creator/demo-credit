import { IWallet } from "@models/wallet";
import { flutterwaveWalletProvider } from "@providers/index";
import {
  CreateWalletRequest,
  CreateWalletResponse,
} from "@providers/wallet/types/wallet";
import WalletUseCases from "@usecases/wallet.usecase";
import logger from "./logger.service";
import { CreditWalletPayload } from "./types/wallet";
import { BadRequestError, NotFoundError } from "@managers/error.manager";
import TransactionUseCases from "@usecases/transaction.usecases";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE } from "@config/constants.config";
import { ITransaction } from "@models/transaction";

class WalletService {
  private walletUsecase: WalletUseCases;
  private transactionUseCases: TransactionUseCases;

  constructor() {
    this.walletUsecase = new WalletUseCases();
    this.transactionUseCases = new TransactionUseCases();
  }
  async callWalletCreationApi(
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
      logger.error(`Error creating wallet for user ID: ${userId}`);
      throw error;
    }
  }

  async handleWalletTransaction(payload: CreditWalletPayload, userId: number) {
    //handle wallet transaction internally
    try {
      const senderWallet = await this.walletUsecase.getWalletByUserId(userId);
      if (!senderWallet) {
        throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
      }
      if (payload.currency !== "NGN") {
        throw new BadRequestError(`Unsupported currency: ${payload.currency}`);
      }
      const receiverWallet = await this.walletUsecase.getWalletByAccountNumber(
        payload.account_number
      );
      if (!receiverWallet) {
        throw new NotFoundError(
          `Receiver wallet not found for account number: ${payload.account_number}`
        );
      }

      const amount = Number(payload.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestError("Invalid transfer amount");
      }

      await this.walletUsecase.handleInternalWalletTransfer(
        senderWallet.id!,
        receiverWallet.id!,
        amount
      );
      logger.info(
        `Successfully transferred ${amount} from user ID: ${userId} to account number: ${payload.account_number}`
      );

     //create transaction records for both sender and receiver
      await this.createTransferTransactionRecords(senderWallet, receiverWallet, amount, payload.currency);

     
    } catch (error) {
      logger.error(`Error handling wallet transaction for user ID: ${userId}`);
      throw error;
    }
  }

 
  private async createTransferTransactionRecords(
    senderWallet: IWallet,
    receiverWallet: IWallet,
    amount: number,
    currency: string
  ) {
    // debit transaction
    const senderTxn: ITransaction = {
      wallet_id: senderWallet.id!,
      type: TRANSACTION_TYPE.TRANSFER,
      reference: this.generateTxRef(senderWallet.user_id),
      amount,
      currency,
      status: TRANSACTION_STATUS.COMPLETED,
      direction: TRANSACTION_DIRECTION.DEBIT,
    };
    //credit transaction
    const receiverTxn: ITransaction = {
      wallet_id: receiverWallet.id!,
      type: TRANSACTION_TYPE.TRANSFER,
      reference: this.generateTxRef(receiverWallet.user_id),
      amount,
      currency,
      status: TRANSACTION_STATUS.COMPLETED,
      direction: TRANSACTION_DIRECTION.CREDIT,
    };
    try {
      await this.transactionUseCases.createTransaction(senderTxn);
      await this.transactionUseCases.createTransaction(receiverTxn);
      logger.info(`Transaction records created for sender wallet ${senderWallet.id} and receiver wallet ${receiverWallet.id}`);
    } catch (err: any) {
      logger.error(`Error creating transaction records: ${err.message}`);
      throw err;
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
