// Global test setup
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.FLUTTERWAVE_SANDBOX_SECRET_KEY = 'test-flutterwave-key';
process.env.FLUTTERWAVE_SECRET_HASH = 'test-secret-hash';
process.env.ADJUITOR_API_KEY = 'test-adjuitor-key';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_USERNAME = 'default';
process.env.REDIS_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';

// Mock logger to reduce noise in tests
jest.mock('@services/logger.service', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    logEmail: jest.fn(),
  },
}));

