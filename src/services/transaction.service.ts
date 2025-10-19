import { IWallet } from "@models/wallet";
import { ITransaction } from "@models/transaction";
import logger from "./logger.service";
import WalletUseCases from "@usecases/wallet.usecase";
import TransactionUseCases from "@usecases/transaction.usecases";
import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@config/constants.config";
import { FlutterwaveWebhookPayload } from "./types/transaction";

//handle wallet transactions
class TransactionService {
  private walletUseCases: WalletUseCases;
  private transactionUseCases: TransactionUseCases;

  constructor() {
    this.walletUseCases = new WalletUseCases();
    this.transactionUseCases = new TransactionUseCases();
  }
  async processDeposit(payload: FlutterwaveWebhookPayload): Promise<void> {
    if (payload.event === "virtualaccount.transaction") {
      await this.handleAccountDeposits(payload.data);
      return;
    }
    logger.error(`Unhandled webhook event: ${payload.event}`);
    return;
  }

  private async handleAccountDeposits(
    flutterwaveData: FlutterwaveWebhookPayload["data"]
  ): Promise<void> {
    logger.info(
      "Processing incoming transaction for:" + flutterwaveData.account_reference
    );

    const { account_reference, amount, status } = flutterwaveData;
    if (status !== "successful") {
      logger.error("Transaction not successful, skipping.");
      await this.creditWallet(account_reference, amount);

      return;
    }
  }

  private async creditWallet(account_reference: string, amount: number) {
    try {
      logger.info(
        "Crediting wallet for account reference: " +
          account_reference +
          " with amount: " +
          amount
      );
      const wallet = await this.walletUseCases.getWalletByFlutterwaveRef(
        account_reference
      );
      if (!wallet) {
        logger.error(
          "Wallet not found for account reference: " + account_reference
        );
        return;
      }
      //update wallet balance
      if (wallet.balance === undefined) {
        wallet.balance = 0;
      }

      if (wallet.id === undefined) {
        logger.error(
          "Wallet ID is undefined for account reference: " + account_reference
        );

        return;
      }
      wallet.balance += amount;
      const isUpdated = await this.walletUseCases.updateWalletBalance(
        wallet.id,
        wallet.balance
      );
      if (!isUpdated) {
        //create transaction record
        logger.info(
          "wallet balance updated successfully for sender: " + wallet.id
        );
        logger.info(
          "Creating transaction record for credit transaction:" + wallet.id
        );
        const transactionData: ITransaction = {
          wallet_id: wallet.id,
          type: TRANSACTION_TYPE.FUND,
          reference: this.generateTransactionReference(),
          amount: amount,
          currency: "NGN",
          status: TRANSACTION_STATUS.COMPLETED,
          direction: TRANSACTION_DIRECTION.CREDIT,
        };
        await this.CreateTransactionRecord(transactionData);
      }
    } catch (error: any) {
      logger.error("Error crediting wallet: " + error.message);
    }
  }

  private async CreateTransactionRecord(transactionData: ITransaction) {
    try {
      await this.transactionUseCases.createTransaction(transactionData);
    } catch (error: any) {
      logger.error("Error creating transaction record: " + error.message);
    }
  }

  private generateTransactionReference(): string {
    return "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

export default TransactionService;
