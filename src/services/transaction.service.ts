import { IWallet } from "@models/wallet";
import { ITransaction } from "@models/transaction";
import logger from "./logger.service";
import WalletUseCases from "@usecases/wallet.usecase";
import UserUseCases from "@usecases/user.usecase";
import TransactionUseCases from "@usecases/transaction.usecases";
import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@config/constants.config";
import { FlutterwaveWebhookPayload } from "./types/transaction";
import { NotFoundError } from "@managers/error.manager";

//handle wallet transactions
class TransactionService {
  private walletUseCases: WalletUseCases;
  private transactionUseCases: TransactionUseCases;
  private userUseCases: UserUseCases;

  constructor() {
    this.walletUseCases = new WalletUseCases();
    this.transactionUseCases = new TransactionUseCases();
    this.userUseCases = new UserUseCases();
  }
  async processDeposit(payload: FlutterwaveWebhookPayload): Promise<void> {
    if (payload.event === "charge.completed") {
      await this.handleAccountDeposits(payload.data);
      return;
    }
    logger.error(`Unhandled webhook event: ${payload.event}`);
    return;
  }

  async handleAccountDeposits(
    flutterwaveData: any 
  ): Promise<void> {
    const email = flutterwaveData.customer?.email;
    console.log("[DEPOSIT] Processing deposit for email:", email);
    logger.info("Processing incoming transaction for user email: " + email);
    const { amount, status } = flutterwaveData;
    
    // Find user by email
    const user = await this.userUseCases.getUserByEmail(email);
    console.log("[DEPOSIT] User found:", user);
    
    if (!user || !user.id) {
      logger.error(`No user found for email: ${email}`);
      throw new NotFoundError(`User not found for email: ${email}`);
    }
    
    // Find wallet by user ID
    const wallet = await this.walletUseCases.getWalletByUserId(user.id);
    console.log("[DEPOSIT] Wallet found:", wallet);
    
    if (!wallet || wallet.id === undefined) {
      logger.error(`No wallet found for user ID: ${user.id}`);
      throw new NotFoundError(`Wallet not found for user ID: ${user.id}`);
    }
    
    if (status !== "successful") {
      logger.error("Transaction not successful, skipping.");
      return;
    }
    
    console.log(`[DEPOSIT] Crediting wallet ${wallet.id} with amount ${amount}`);
    // Use the creditWalletById helper method
    await this.creditWalletById(wallet.id, amount);
  }

  // Helper to credit wallet by wallet ID
  private async creditWalletById(walletId: number, amount: number) {
    try {
      console.log(`[CREDIT WALLET] Starting credit for wallet ${walletId} with amount ${amount}`);
      logger.info(
        "Crediting wallet for wallet ID: " + walletId + " with amount: " + amount
      );
      
      // Fetch current wallet balance
      const wallet = await this.walletUseCases.getWalletById(walletId);
      if (!wallet) {
        logger.error("Wallet not found for wallet ID: " + walletId);
        return;
      }
      
      logger.info("Current wallet balance: " + wallet.balance);
      
      if (wallet.balance === undefined || wallet.balance === null) {
        wallet.balance = 0;
      }
      
      // Ensure amount is treated as a number with proper decimal handling
      const currentBalance = Number(wallet.balance);
      const depositAmount = Number(amount);
      const newBalance = currentBalance + depositAmount;
      
      logger.info("New wallet balance will be: " + newBalance);
      
      const isUpdated = await this.walletUseCases.updateWalletBalance(
        walletId,
        newBalance
      );
      
      logger.info("Wallet balance update result: " + isUpdated);
      
      if (isUpdated) {
        logger.info("Wallet balance updated successfully for wallet: " + walletId);
        logger.info("Creating transaction record for credit transaction: " + walletId);
        
        const transactionData: ITransaction = {
          wallet_id: walletId,
          type: TRANSACTION_TYPE.FUND,
          reference: this.generateTransactionReference(),
          amount: amount,
          currency: "NGN",
          status: TRANSACTION_STATUS.COMPLETED,
          direction: TRANSACTION_DIRECTION.CREDIT,
        };
        await this.CreateTransactionRecord(transactionData);
        logger.info("Transaction record created successfully for wallet: " + walletId);
      } else {
        logger.error("Failed to update wallet balance for wallet: " + walletId);
      }
    } catch (error: any) {
      logger.error("Error crediting wallet: " + error.message);
      logger.error("Error stack: " + error.stack);
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
