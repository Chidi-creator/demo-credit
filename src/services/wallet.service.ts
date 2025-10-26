import { IWallet } from "@models/wallet";
import {
  flutterwaveWalletProvider,
  flutterwaveWithdrawalProvider,
} from "@providers/index";
import {
  CreateWalletRequest,
  CreateWalletResponse,
} from "@providers/wallet/types/wallet";
import WalletUseCases from "@usecases/wallet.usecase";
import logger from "./logger.service";
import { CreditWalletPayload, WithdrawToAccountPayload } from "./types/wallet";
import { BadRequestError, NotFoundError } from "@managers/error.manager";
import TransactionUseCases from "@usecases/transaction.usecases";
import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@config/constants.config";
import { ITransaction } from "@models/transaction";
import {
  InitiateTransferResponse,
  InitiateWithdrawalRequest,
} from "@providers/wallet/types/transfer";
import { FlutterwaveWebhookPayload } from "./types/transaction";

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

  async handleWalletTransaction(
    payload: CreditWalletPayload,
    userId: number
  ): Promise<void> {
    //handle wallet transaction internally
    try {
      logger.info(`Starting transfer for user ${userId}`, {
        userId,
        accountNumber: payload.account_number,
        amount: payload.amount,
      });

      const senderWallet = await this.walletUsecase.getWalletByUserId(userId);
      logger.debug("Sender wallet retrieved", { senderWallet });

      if (!senderWallet) {
        throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
      }
      if (payload.currency !== "NGN") {
        throw new BadRequestError(`Unsupported currency: ${payload.currency}`);
      }
      const receiverWallet = await this.walletUsecase.getWalletByAccountNumber(
        payload.account_number
      );
      logger.debug("Receiver wallet retrieved", { receiverWallet });

      if (!receiverWallet) {
        throw new NotFoundError(
          `Receiver wallet not found for account number: ${payload.account_number}`
        );
      }

      if (senderWallet.id === receiverWallet.id) {
        throw new BadRequestError("Cannot transfer to your own wallet");
      }

      // Ensure proper number handling
      const amount = Number(payload.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestError("Invalid transfer amount");
      }

      // Check sender has sufficient balance
      const senderBalance = Number(senderWallet.balance || 0);
      if (senderBalance < amount) {
        throw new BadRequestError(
          `Insufficient balance. Available: ${senderBalance}, Required: ${amount}`
        );
      }

      logger.info(`Transferring funds`, {
        amount,
        from: senderWallet.id,
        to: receiverWallet.id,
        senderBalance,
        userId,
      });

      await this.walletUsecase.handleInternalWalletTransfer(
        senderWallet.id!,
        receiverWallet.id!,
        amount
      );

      logger.info(
        `Successfully transferred ${amount} from user ID: ${userId} to account number: ${payload.account_number}`,
        {
          userId,
          amount,
          accountNumber: payload.account_number,
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
        }
      );

      //create transaction records for both sender and receiver
      await this.createInternalWalletTransferTransactionRecords(
        senderWallet,
        receiverWallet,
        amount,
        payload.currency
      );
    } catch (error) {
      logger.error(
        `Error handling wallet transaction for user ID: ${userId}`,
        error
      );
      throw error;
    }
  }

  async handleWithdrawalWebhook(data: any) {
    const { reference, status, amount } = data;

    const transaction =
      await this.transactionUseCases.getTransactionByReference(reference);
    if (!transaction) {
      logger.error(`Transaction not found for reference: ${reference}`);
      return;
    }

    const newAmount = Number(amount);

    if (status === "SUCCESSFUL") {
      // subtract amount from wallet balance
      logger.info(
        `Processing successful withdrawal for transaction ${reference}`
      );
      await this.walletUsecase.withdrawfromWallet(
        transaction.wallet_id!,
        newAmount
      );

      await this.transactionUseCases.updateTransaction(transaction.id!, {
        status: TRANSACTION_STATUS.COMPLETED,
      });

      logger.info(
        `Transaction ${reference} marked as COMPLETED and wallet updated`
      );
    } else {
      await this.transactionUseCases.updateTransaction(transaction.id!, {
        status: TRANSACTION_STATUS.FAILED,
      });
      logger.warn(`Transaction ${reference} failed with status ${status}`);
    }
  }

  async handleWalletWithdrawal(
    payload: WithdrawToAccountPayload,
    userId: number
  ): Promise<InitiateTransferResponse> {
    try {
      logger.info(`initiating withdrawal for user ${userId}`);
      const wallet = await this.walletUsecase.getWalletByUserId(userId);
      if (!wallet) {
        throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
      }

      if (wallet.balance! < payload.amount) {
        throw new BadRequestError(`Insufficient balance in wallet`);
      }

      const withdrawalData: InitiateWithdrawalRequest = {
        account_bank: payload.bank_code,
        account_number: payload.account_number,
        amount: payload.amount,
        currency: payload.currency,
        reference: this.generateTxRef(userId),
        narration: payload.narration,
      };

      const transactionData: ITransaction = {
        wallet_id: wallet.id!,
        type: TRANSACTION_TYPE.WITHDRAW,
        reference: withdrawalData.reference,
        amount: payload.amount,
        currency: payload.currency,
        status: TRANSACTION_STATUS.PENDING,
        direction: TRANSACTION_DIRECTION.DEBIT,
        description: `Withdrawal to account ${payload.account_number}`,
      };

      await this.transactionUseCases.createTransaction(transactionData);
      const response = await flutterwaveWithdrawalProvider.InitiateWithdrawal(
        withdrawalData
      );
      if (response.status !== "success") {
        logger.error(`Flutterwave Withdrawal API Error: ${response.message}`, {
          userId,
          withdrawalData,
        });
      }

      return response;
    } catch (error: any) {
      logger.error(
        `Error handling wallet withdrawal for user ID: ${userId}: ${error.message}`
      );
      throw error;
    }
  }

  private async createInternalWalletTransferTransactionRecords(
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
      logger.info(
        `Transaction records created for sender wallet ${senderWallet.id} and receiver wallet ${receiverWallet.id}`
      );
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
