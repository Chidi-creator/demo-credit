import TransactionService from '@services/transaction.service';
import WalletUseCases from '@usecases/wallet.usecase';
import UserUseCases from '@usecases/user.usecase';
import TransactionUseCases from '@usecases/transaction.usecases';
import { NotFoundError } from '@managers/error.manager';

// Mock the use case modules
jest.mock('@usecases/wallet.usecase');
jest.mock('@usecases/user.usecase');
jest.mock('@usecases/transaction.usecases');

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let mockWalletUseCases: jest.Mocked<WalletUseCases>;
  let mockUserUseCases: jest.Mocked<UserUseCases>;
  let mockTransactionUseCases: jest.Mocked<TransactionUseCases>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create service instance first
    transactionService = new TransactionService();
    
    // Get the mocked instances that were created by the constructor
    mockWalletUseCases = (transactionService as any).walletUseCases;
    mockUserUseCases = (transactionService as any).userUseCases;
    mockTransactionUseCases = (transactionService as any).transactionUseCases;
  });

  describe('handleAccountDeposits', () => {
    it('should successfully credit wallet on valid deposit', async () => {
      const user = { id: 1, email: 'user@example.com' };
      const wallet = { id: 1, user_id: 1, balance: 500, currency: 'NGN' };
      const flutterwaveData = {
        customer: { email: 'user@example.com' },
        amount: 1000,
        status: 'successful',
      };

      mockUserUseCases.getUserByEmail = jest.fn().mockResolvedValue(user);
      mockWalletUseCases.getWalletByUserId = jest.fn().mockResolvedValue(wallet);
      mockWalletUseCases.getWalletById = jest.fn().mockResolvedValue(wallet);
      mockWalletUseCases.updateWalletBalance = jest.fn().mockResolvedValue(true);
      mockTransactionUseCases.createTransaction = jest.fn().mockResolvedValue(undefined);

      await transactionService.handleAccountDeposits(flutterwaveData);

      expect(mockUserUseCases.getUserByEmail).toHaveBeenCalledWith(flutterwaveData.customer.email);
      expect(mockWalletUseCases.getWalletByUserId).toHaveBeenCalledWith(user.id);
      expect(mockWalletUseCases.getWalletById).toHaveBeenCalledWith(wallet.id);
      expect(mockWalletUseCases.updateWalletBalance).toHaveBeenCalledWith(
        wallet.id,
        1500 // 500 + 1000
      );
    });

    it('should throw error if user not found by email', async () => {
      const flutterwaveData = {
        customer: { email: 'nonexistent@example.com' },
        amount: 1000,
        status: 'successful',
      };

      mockUserUseCases.getUserByEmail = jest.fn().mockResolvedValue(undefined);

      await expect(
        transactionService.handleAccountDeposits(flutterwaveData)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw error if wallet not found for user', async () => {
      const user = { id: 1, email: 'user@example.com' };
      const flutterwaveData = {
        customer: { email: 'user@example.com' },
        amount: 1000,
        status: 'successful',
      };

      mockUserUseCases.getUserByEmail = jest.fn().mockResolvedValue(user);
      mockWalletUseCases.getWalletByUserId = jest.fn().mockResolvedValue(undefined);

      await expect(
        transactionService.handleAccountDeposits(flutterwaveData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('creditWalletById', () => {
    it('should credit wallet with correct amount', async () => {
      const wallet = { id: 1, user_id: 1, balance: 1000, currency: 'NGN' };
      const amount = 500;

      mockWalletUseCases.getWalletById = jest.fn().mockResolvedValue(wallet);
      mockWalletUseCases.updateWalletBalance = jest.fn().mockResolvedValue(true);
      mockTransactionUseCases.createTransaction = jest.fn().mockResolvedValue(undefined);

      await (transactionService as any).creditWalletById(wallet.id, amount);

      expect(mockWalletUseCases.updateWalletBalance).toHaveBeenCalledWith(1, 1500);
    });

    it('should handle decimal precision correctly', async () => {
      const wallet = { id: 1, user_id: 1, balance: '100.50', currency: 'NGN' };
      const amount = 50.25;

      mockWalletUseCases.getWalletById = jest.fn().mockResolvedValue(wallet);
      mockWalletUseCases.updateWalletBalance = jest.fn().mockResolvedValue(true);
      mockTransactionUseCases.createTransaction = jest.fn().mockResolvedValue(undefined);

      await (transactionService as any).creditWalletById(wallet.id, amount);

      expect(mockWalletUseCases.updateWalletBalance).toHaveBeenCalledWith(1, 150.75);
    });
  });
});
