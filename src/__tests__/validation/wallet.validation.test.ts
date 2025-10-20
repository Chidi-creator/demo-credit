import { validateCreditWalletPayload, validateWithdrawToAccountPayload } from '@validation/Wallet';

describe('Wallet Validation', () => {
  describe('validateCreditWalletPayload', () => {
    it('should validate correct credit wallet payload', () => {
      const payload = {
        account_number: 'ACC123456',
        amount: 100,
        currency: 'NGN',
        description: 'Test transfer',
      };

      const { error } = validateCreditWalletPayload(payload);

      expect(error).toBeUndefined();
    });

    it('should reject payload without account_number', () => {
      const payload = {
        amount: 100,
        currency: 'NGN',
      };

      const { error } = validateCreditWalletPayload(payload as any);

      expect(error).toBeDefined();
      expect(error?.message).toContain('account_number');
    });

    it('should reject negative amount', () => {
      const payload = {
        account_number: 'ACC123456',
        amount: -50,
        currency: 'NGN',
      };

      const { error } = validateCreditWalletPayload(payload);

      expect(error).toBeDefined();
      expect(error?.message).toContain('amount');
    });

    it('should reject invalid currency', () => {
      const payload = {
        account_number: 'ACC123456',
        amount: 100,
        currency: 'USD',
      };

      const { error } = validateCreditWalletPayload(payload);

      expect(error).toBeDefined();
      expect(error?.message).toContain('currency');
    });

    it('should allow optional description', () => {
      const payload = {
        account_number: 'ACC123456',
        amount: 100,
        currency: 'NGN',
      };

      const { error } = validateCreditWalletPayload(payload);

      expect(error).toBeUndefined();
    });
  });

  describe('validateWithdrawToAccountPayload', () => {
    it('should validate correct withdrawal payload', () => {
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 500,
        currency: 'NGN',
        narration: 'Withdrawal to bank',
      };

      const { error } = validateWithdrawToAccountPayload(payload);

      expect(error).toBeUndefined();
    });

    it('should reject payload without account_bank', () => {
      const payload = {
        account_number: '0123456789',
        amount: 500,
        currency: 'NGN',
      };

      const { error } = validateWithdrawToAccountPayload(payload as any);

      expect(error).toBeDefined();
      expect(error?.message).toContain('account_bank');
    });

    it('should reject payload without account_number', () => {
      const payload = {
        account_bank: '044',
        amount: 500,
        currency: 'NGN',
      };

      const { error } = validateWithdrawToAccountPayload(payload as any);

      expect(error).toBeDefined();
      expect(error?.message).toContain('account_number');
    });

    it('should reject zero or negative amount', () => {
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 0,
        currency: 'NGN',
      };

      const { error } = validateWithdrawToAccountPayload(payload);

      expect(error).toBeDefined();
    });

    it('should reject invalid currency', () => {
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 500,
        currency: 'EUR',
      };

      const { error } = validateWithdrawToAccountPayload(payload);

      expect(error).toBeDefined();
      expect(error?.message).toContain('currency');
    });

    it('should allow optional narration', () => {
      const payload = {
        account_bank: '044',
        account_number: '0123456789',
        amount: 500,
        currency: 'NGN',
      };

      const { error } = validateWithdrawToAccountPayload(payload);

      expect(error).toBeUndefined();
    });
  });
});
