import { AuthService } from '@services/auth.service';
import UserUseCases from '@usecases/user.usecase';
import CacheService from '@services/cache.service';
import MailService from '@services/mail.service';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@managers/error.manager';

// Mock dependencies
jest.mock('@usecases/user.usecase');
jest.mock('@services/cache.service');
jest.mock('@services/mail.service');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserUseCase: jest.Mocked<UserUseCases>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockMailService: jest.Mocked<MailService>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockUserUseCase = (authService as any).userUseCase;
    mockCacheService = (authService as any).cacheService;
    mockMailService = (authService as any).mailService;
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      const mockToken = 'mock.access.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = authService.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      const mockToken = 'mock.refresh.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = authService.generateRefreshToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshToken = 'valid.refresh.token';
      const decoded = {
        id: 1,
        email: 'test@example.com',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        user_bvn: '12345678901',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      mockUserUseCase.getUserById.mockResolvedValue(user as any);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('new.access.token')
        .mockReturnValueOnce('new.refresh.token');

      const result = await authService.refreshAccessToken(refreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String));
      expect(mockUserUseCase.getUserById).toHaveBeenCalledWith(decoded.id);
      expect(result).toEqual({
        accessToken: 'new.access.token',
        refreshToken: 'new.refresh.token',
      });
    });

    it('should return null for invalid refresh token', async () => {
      const refreshToken = 'invalid.refresh.token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      const refreshToken = 'valid.refresh.token';
      const decoded = {
        id: 1,
        email: 'test@example.com',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decoded);
      mockUserUseCase.getUserById.mockResolvedValue(undefined);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toBeNull();
    });
  });

  describe('sendOTPEmail', () => {
    it('should send OTP to user email and cache it', async () => {
      const email = 'test@example.com';

      mockCacheService.set.mockResolvedValue(undefined);
      mockMailService.sendMail.mockResolvedValue(undefined);

      await authService.sendOTPEmail(email);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        `otp_${email}`,
        expect.any(String),
        60
      );
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'Your OTP Code',
        })
      );
    });
  });

  describe('validateOTP', () => {
    it('should validate correct OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      mockCacheService.get.mockResolvedValue(otp);
      mockCacheService.del.mockResolvedValue(undefined);

      const result = await authService.validateOTP(email, otp);

      expect(mockCacheService.get).toHaveBeenCalledWith(`otp_${email}`);
      expect(mockCacheService.del).toHaveBeenCalledWith(`otp_${email}`);
      expect(result).toBe(true);
    });

    it('should reject incorrect OTP', async () => {
      const email = 'test@example.com';
      const correctOTP = '123456';
      const wrongOTP = '654321';

      mockCacheService.get.mockResolvedValue(correctOTP);

      const result = await authService.validateOTP(email, wrongOTP);

      expect(result).toBe(false);
      expect(mockCacheService.del).not.toHaveBeenCalled();
    });

    it('should reject expired OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      mockCacheService.get.mockResolvedValue(null);

      const result = await authService.validateOTP(email, otp);

      expect(result).toBe(false);
    });
  });
});
