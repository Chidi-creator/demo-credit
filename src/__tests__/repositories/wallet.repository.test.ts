import WalletRepository from '@repositories/wallet.repository';
import db from '@db/mysql';
import { DatabaseError } from '@managers/error.manager';

// Mock the database
jest.mock('@db/mysql', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('WalletRepository', () => {
  let walletRepository: WalletRepository;
  let mockTrx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    walletRepository = new WalletRepository();

    // Mock transaction behavior - need to return a function that creates a chainable query builder
    mockTrx = jest.fn((tableName: string) => ({
      where: jest.fn().mockReturnThis(),
      forUpdate: jest.fn().mockReturnThis(),
      first: jest.fn(),
      update: jest.fn(),
    }));

    (db as any).transaction = jest.fn((callback) => callback(mockTrx));
  });

  describe('handleInternalWalletTransfer', () => {
    it('should successfully transfer funds between wallets', async () => {
      const senderWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        currency: 'NGN',
      };

      const receiverWallet = {
        id: 2,
        user_id: 2,
        balance: 500,
        currency: 'NGN',
      };

      const amount = 200;

      // Create mock query builders for sender and receiver
      const senderQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(senderWallet),
        update: jest.fn().mockResolvedValue(1),
      };

      const receiverQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(receiverWallet),
        update: jest.fn().mockResolvedValue(1),
      };

      // Mock trx to return different query builders for each call
      mockTrx
        .mockReturnValueOnce(senderQuery)
        .mockReturnValueOnce(receiverQuery);

      await walletRepository.handleInternalWalletTransfer(1, 2, amount);

      expect(mockTrx).toHaveBeenCalledWith('wallets');
      expect(senderQuery.where).toHaveBeenCalledWith({ id: 1 });
      expect(receiverQuery.where).toHaveBeenCalledWith({ id: 2 });
    });

    it('should throw error if sender wallet not found', async () => {
      const senderQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockTrx.mockReturnValueOnce(senderQuery);

      await expect(
        walletRepository.handleInternalWalletTransfer(1, 2, 100)
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw error if sender has insufficient balance', async () => {
      const senderWallet = {
        id: 1,
        user_id: 1,
        balance: 50,
        currency: 'NGN',
      };

      const senderQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(senderWallet),
      };

      mockTrx.mockReturnValueOnce(senderQuery);

      await expect(
        walletRepository.handleInternalWalletTransfer(1, 2, 100)
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw error if receiver wallet not found', async () => {
      const senderWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        currency: 'NGN',
      };

      const senderQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(senderWallet),
      };

      const receiverQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockTrx
        .mockReturnValueOnce(senderQuery)
        .mockReturnValueOnce(receiverQuery);

      await expect(
        walletRepository.handleInternalWalletTransfer(1, 2, 100)
      ).rejects.toThrow(DatabaseError);
    });

    it('should handle decimal precision correctly', async () => {
      const senderWallet = {
        id: 1,
        user_id: 1,
        balance: '1000.50',
        currency: 'NGN',
      };

      const receiverWallet = {
        id: 2,
        user_id: 2,
        balance: '250.25',
        currency: 'NGN',
      };

      const amount = 100.75;

      const senderQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(senderWallet),
        update: jest.fn().mockResolvedValue(1),
      };

      const receiverQuery = {
        where: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(receiverWallet),
        update: jest.fn().mockResolvedValue(1),
      };

      // Mock trx to return appropriate query builders:
      // 1st call: sender wallet read
      // 2nd call: receiver wallet read  
      // 3rd call: sender wallet update
      // 4th call: receiver wallet update
      mockTrx
        .mockReturnValueOnce(senderQuery)
        .mockReturnValueOnce(receiverQuery)
        .mockReturnValueOnce(senderQuery)
        .mockReturnValueOnce(receiverQuery);

      await walletRepository.handleInternalWalletTransfer(1, 2, amount);

      // Verify correct balance calculations
      expect(senderQuery.update).toHaveBeenCalledWith({ balance: 899.75 }); // 1000.50 - 100.75
      expect(receiverQuery.update).toHaveBeenCalledWith({ balance: 351 }); // 250.25 + 100.75
    });
  });
});
