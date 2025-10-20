import {
  BadRequestError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  DatabaseError,
  ConflictError,
} from '@managers/error.manager';

describe('Error Manager', () => {
  describe('BadRequestError', () => {
    it('should create error with correct message and status code', () => {
      const message = 'Invalid request';
      const error = new BadRequestError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('BadRequestError');
    });
  });

  describe('NotFoundError', () => {
    it('should create error with correct message and status code', () => {
      const message = 'Resource not found';
      const error = new NotFoundError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ValidationError', () => {
    it('should create error with correct message and status code', () => {
      const message = 'Validation failed';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with correct message and status code', () => {
      const message = 'Unauthorized access';
      const error = new UnauthorizedError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });
  });

  describe('DatabaseError', () => {
    it('should create error with correct message and status code', () => {
      const message = 'Database operation failed';
      const error = new DatabaseError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });
  });

  describe('ConflictError', () => {
    it('should create error with correct message and status code', () => {
      const message = 'Resource conflict';
      const error = new ConflictError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });
});
