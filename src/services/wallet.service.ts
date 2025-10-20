import { IWallet } from "@models/wallet";
import { flutterwaveWalletProvider, flutterwaveTransferProvider } from "@providers/index";
import {
  CreateWalletRequest,
  CreateWalletResponse,
} from "@providers/wallet/types/wallet";
import WalletUseCases from "@usecases/wallet.usecase";
import logger from "./logger.service";
import { CreditWalletPayload, WithdrawToAccountPayload } from "./types/wallet";
import { BadRequestError, NotFoundError } from "@managers/error.manager";
import TransactionUseCases from "@usecases/transaction.usecases";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE } from "@config/constants.config";
import { ITransaction } from "@models/transaction";
import { InitiateTransferRequest } from "@providers/wallet/types/transfer";

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

  async handleWalletTransaction(payload: CreditWalletPayload, userId: number): Promise<void> {
    //handle wallet transaction internally
    try {
      logger.info(`Starting transfer for user ${userId}`, { 
        userId, 
        accountNumber: payload.account_number, 
        amount: payload.amount 
      });
      
      const senderWallet = await this.walletUsecase.getWalletByUserId(userId);
      logger.debug('Sender wallet retrieved', { senderWallet });

      if (!senderWallet) {
        throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
      }
      if (payload.currency !== "NGN") {
        throw new BadRequestError(`Unsupported currency: ${payload.currency}`);
      }
      const receiverWallet = await this.walletUsecase.getWalletByAccountNumber(
        payload.account_number
      );
      logger.debug('Receiver wallet retrieved', { receiverWallet });
      
      if (!receiverWallet) {
        throw new NotFoundError(
          `Receiver wallet not found for account number: ${payload.account_number}`
        );
      }

      if (senderWallet.id === receiverWallet.id) {
        throw new BadRequestError('Cannot transfer to your own wallet');
      }

      // Ensure proper number handling
      const amount = Number(payload.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestError("Invalid transfer amount");
      }

      // Check sender has sufficient balance
      const senderBalance = Number(senderWallet.balance || 0);
      if (senderBalance < amount) {
        throw new BadRequestError(`Insufficient balance. Available: ${senderBalance}, Required: ${amount}`);
      }

      logger.info(`Transferring funds`, { 
        amount, 
        from: senderWallet.id, 
        to: receiverWallet.id,
        senderBalance,
        userId 
      });
      
      await this.walletUsecase.handleInternalWalletTransfer(
        senderWallet.id!,
        receiverWallet.id!,
        amount
      );
      
      logger.info(`Successfully transferred ${amount} from user ID: ${userId} to account number: ${payload.account_number}`, {
        userId,
        amount,
        accountNumber: payload.account_number,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id
      });

     //create transaction records for both sender and receiver
      await this.createTransferTransactionRecords(senderWallet, receiverWallet, amount, payload.currency);

     
    } catch (error) {
      logger.error(`Error handling wallet transaction for user ID: ${userId}`, error);
      throw error;
    }
  }

  async handleWalletWithdrawal(payload: WithdrawToAccountPayload, userId: number) {
    // Withdraw from wallet to bank account via Flutterwave
    try {
      // Get user wallet
      const wallet = await this.walletUsecase.getWalletByUserId(userId);
      if (!wallet || wallet.id === undefined) {
        throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
      }

      // Validate currency
      if (payload.currency !== "NGN") {
        throw new BadRequestError(`Unsupported currency: ${payload.currency}`);
      }

      // Validate amount
      const amount = Number(payload.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestError("Invalid withdrawal amount");
      }

      // Check sufficient balance
      const walletBalance = Number(wallet.balance || 0);
      if (walletBalance < amount) {
        throw new BadRequestError(
          `Insufficient balance. Available: ${walletBalance}, Required: ${amount}`
        );
      }

      // Generate unique reference for this withdrawal
      const reference = this.generateTxRef(userId);

      // Prepare Flutterwave transfer request
      const transferRequest: InitiateTransferRequest = {
        account_bank: payload.account_bank,
        account_number: payload.account_number,
        amount: amount,
        narration: payload.narration || `Withdrawal by user ${userId}`,
        currency: payload.currency,
        reference: reference,
        debit_currency: payload.currency,
      };

      logger.info(`Initiating withdrawal for user ${userId}: ${amount} ${payload.currency} to ${payload.account_number}`);

      // Call Flutterwave transfer API
      const transferResponse = await flutterwaveTransferProvider.initiateTransfer(transferRequest);

      if (transferResponse.status !== "success") {
        logger.error(`Flutterwave transfer failed: ${transferResponse.message}`);
        throw new BadRequestError(`Withdrawal failed: ${transferResponse.message}`);
      }

      // Debit wallet balance
      const newBalance = walletBalance - amount;
      const isUpdated = await this.walletUsecase.updateWalletBalance(wallet.id, newBalance);

      if (!isUpdated) {
        logger.error(`Failed to update wallet balance after withdrawal for user ${userId}`);
        throw new BadRequestError("Failed to update wallet balance");
      }

      // Create withdrawal transaction record
      const transactionData: ITransaction = {
        wallet_id: wallet.id,
        type: TRANSACTION_TYPE.WITHDRAW,
        reference: reference,
        amount: amount,
        currency: payload.currency,
        status: TRANSACTION_STATUS.COMPLETED,
        direction: TRANSACTION_DIRECTION.DEBIT,
      };

      await this.transactionUseCases.createTransaction(transactionData);

      logger.info(
        `Successfully withdrew ${amount} ${payload.currency} from user ${userId} wallet to account ${payload.account_number}`
      );

      return {
        success: true,
        message: "Withdrawal successful",
        data: {
          reference: reference,
          amount: amount,
          account_number: payload.account_number,
          bank_code: payload.account_bank,
          new_balance: newBalance,
          flutterwave_id: transferResponse.data.id,
        },
      };
    } catch (error: any) {
      logger.error(`Error handling wallet withdrawal for user ID: ${userId}: ${error.message}`);
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
