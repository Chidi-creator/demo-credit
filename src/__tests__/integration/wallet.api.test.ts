import request from 'supertest';
import express, { Express } from 'express';
import walletRouter from '@deliverymen/wallet.delivery';
import { AuthService } from '@services/auth.service';

// This is a simplified integration test
// In a real scenario, you'd use a test database
describe('Wallet API Integration Tests', () => {
  let app: Express;
  let authToken: string;

  beforeAll(() => {
    // Setup express app
    app = express();
    app.use(express.json());
    app.use('/wallets', walletRouter);

    // Mock authentication token
    const authService = new AuthService();
    authToken = authService.generateToken({
      id: 1,
      email: 'test@example.com',
    });
  });

  describe('POST /wallets/transfer', () => {
    it('should return 401 if no authentication token provided', async () => {
      const response = await request(app)
        .post('/wallets/transfer')
        .send({
          account_number: 'ACC123456',
          amount: 100,
          currency: 'NGN',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid payload', async () => {
      const response = await request(app)
        .post('/wallets/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_number: 'ACC123456',
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /wallets/withdraw', () => {
    it('should return 401 if no authentication token provided', async () => {
      const response = await request(app)
        .post('/wallets/withdraw')
        .send({
          account_bank: '044',
          account_number: '0123456789',
          amount: 500,
          currency: 'NGN',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/wallets/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_bank: '044',
          // Missing account_number, amount, currency
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid currency', async () => {
      const response = await request(app)
        .post('/wallets/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_bank: '044',
          account_number: '0123456789',
          amount: 500,
          currency: 'USD', // Invalid, should be NGN
        });

      expect(response.status).toBe(400);
    });
  });
});
