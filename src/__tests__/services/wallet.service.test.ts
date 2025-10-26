import WalletService from '@services/wallet.service';
import WalletUseCases from '@usecases/wallet.usecase';
import TransactionUseCases from '@usecases/transaction.usecases';
import { flutterwaveWalletProvider, flutterwaveTransferProvider } from '@providers/index';
import { BadRequestError, NotFoundError } from '@managers/error.manager';
import { TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_DIRECTION } from '@config/constants.config';

// Mock dependencies
jest.mock('@usecases/wallet.usecase');
jest.mock('@usecases/transaction.usecases');
jest.mock('@providers/index');

describe('WalletService', () => {
  let walletService: WalletService;
  let mockWalletUsecase: jest.Mocked<WalletUseCases>;
  let mockTransactionUseCases: jest.Mocked<TransactionUseCases>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create service instance
    walletService = new WalletService();

    // Get mocked instances
    mockWalletUsecase = (walletService as any).walletUsecase;
    mockTransactionUseCases = (walletService as any).transactionUseCases;
  });

  describe('handleWalletTransaction', () => {
    it('should successfully transfer funds between wallets', async () => {
      const userId = 1;
      const payload = {
        account_number: 'ACC123456',
        amount: 100,
        currency: 'NGN',
        description: 'Test transfer',
      };

      const senderWallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 500,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      const receiverWallet = {
        id: 2,
        user_id: 2,
        account_number: 'ACC123456',
        balance: 200,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_002',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      // Mock implementations
      mockWalletUsecase.getWalletByUserId.mockResolvedValue(senderWallet);
      mockWalletUsecase.getWalletByAccountNumber.mockResolvedValue(receiverWallet);
      mockWalletUsecase.handleInternalWalletTransfer.mockResolvedValue(undefined);
      mockTransactionUseCases.createTransaction.mockResolvedValue({ id: 1 } as any);

      // Execute
      await walletService.handleWalletTransaction(payload, userId);

      // Assertions
      expect(mockWalletUsecase.getWalletByUserId).toHaveBeenCalledWith(userId);
      expect(mockWalletUsecase.getWalletByAccountNumber).toHaveBeenCalledWith(payload.account_number);
      expect(mockWalletUsecase.handleInternalWalletTransfer).toHaveBeenCalledWith(
        senderWallet.id,
        receiverWallet.id,
        payload.amount
      );
      expect(mockTransactionUseCases.createTransaction).toHaveBeenCalledTimes(2); // Debit and Credit
    });

    it('should throw error if sender wallet not found', async () => {
      const userId = 1;
      const payload = {
        account_number: 'ACC123456',
        amount: 100,
        currency: 'NGN',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(undefined);

      await expect(walletService.handleWalletTransaction(payload, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if receiver wallet not found', async () => {
      const userId = 1;
      const payload = {
        account_number: 'ACC123456',
        amount: 100,
        currency: 'NGN',
      };

      const senderWallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 500,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(senderWallet);
      mockWalletUsecase.getWalletByAccountNumber.mockResolvedValue(undefined);

      await expect(walletService.handleWalletTransaction(payload, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if insufficient balance', async () => {
      const userId = 1;
      const payload = {
        account_number: 'ACC123456',
        amount: 1000,
        currency: 'NGN',
      };

      const senderWallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 100,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      const receiverWallet = {
        id: 2,
        user_id: 2,
        account_number: 'ACC123456',
        balance: 200,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_002',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(senderWallet);
      mockWalletUsecase.getWalletByAccountNumber.mockResolvedValue(receiverWallet);

      await expect(walletService.handleWalletTransaction(payload, userId)).rejects.toThrow(BadRequestError);
      await expect(walletService.handleWalletTransaction(payload, userId)).rejects.toThrow(/Insufficient balance/);
    });

    it('should throw error if trying to transfer to own wallet', async () => {
      const userId = 1;
      const payload = {
        account_number: 'ACC000001',
        amount: 100,
        currency: 'NGN',
      };

      const senderWallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 500,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(senderWallet);
      mockWalletUsecase.getWalletByAccountNumber.mockResolvedValue(senderWallet);

      await expect(walletService.handleWalletTransaction(payload, userId)).rejects.toThrow(BadRequestError);
      await expect(walletService.handleWalletTransaction(payload, userId)).rejects.toThrow(/Cannot transfer to your own wallet/);
    });
  });

  describe('handleWalletWithdrawal', () => {
    it('should successfully withdraw funds to bank account', async () => {
      const userId = 1;
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 500,
        currency: 'NGN',
        narration: 'Test withdrawal',
      };

      const wallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 1000,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      const transferResponse = {
        status: 'success',
        message: 'Transfer initiated',
        data: {
          id: 12345,
          amount: 500,
          reference: 'TXN123456789',
          status: 'pending',
        },
      };

      // Mock implementations
      mockWalletUsecase.getWalletByUserId.mockResolvedValue(wallet);
      mockWalletUsecase.updateWalletBalance.mockResolvedValue(true);
      mockTransactionUseCases.createTransaction.mockResolvedValue({ id: 1 } as any);
      (flutterwaveTransferProvider.InitiateWithdrawal as jest.Mock).mockResolvedValue(transferResponse);

      // Execute
      const result = await walletService.handleWalletWithdrawal(payload, userId);

      // Assertions
      expect(mockWalletUsecase.getWalletByUserId).toHaveBeenCalledWith(userId);
      expect(flutterwaveTransferProvider.InitiateWithdrawal).toHaveBeenCalled();
      expect(mockWalletUsecase.updateWalletBalance).toHaveBeenCalledWith(wallet.id, 500); // 1000 - 500
      expect(mockTransactionUseCases.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_id: wallet.id,
          type: TRANSACTION_TYPE.WITHDRAW,
          amount: payload.amount,
          currency: payload.currency,
          status: TRANSACTION_STATUS.COMPLETED,
          direction: TRANSACTION_DIRECTION.DEBIT,
        })
      );
      expect(result.success).toBe(true);
    });

    it('should throw error if wallet not found', async () => {
      const userId = 1;
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 500,
        currency: 'NGN',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(undefined);

      await expect(walletService.handleWalletWithdrawal(payload, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw error for unsupported currency', async () => {
      const userId = 1;
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 500,
        currency: 'USD',
      };

      const wallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 1000,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(wallet);

      await expect(walletService.handleWalletWithdrawal(payload, userId)).rejects.toThrow(BadRequestError);
      await expect(walletService.handleWalletWithdrawal(payload, userId)).rejects.toThrow(/Unsupported currency/);
    });

    it('should throw error if insufficient balance for withdrawal', async () => {
      const userId = 1;
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 2000,
        currency: 'NGN',
      };

      const wallet = {
        id: 1,
        user_id: userId,
        account_number: 'ACC000001',
        balance: 1000,
        currency: 'NGN',
        flutterwave_account_ref: 'FLW_REF_001',
        bank_name: 'Test Bank',
        bank_code: '232',
      };

      mockWalletUsecase.getWalletByUserId.mockResolvedValue(wallet);

      await expect(walletService.handleWalletWithdrawal(payload, userId)).rejects.toThrow(BadRequestError);
      await expect(walletService.handleWalletWithdrawal(payload, userId)).rejects.toThrow(/Insufficient balance/);
    });
  });
});