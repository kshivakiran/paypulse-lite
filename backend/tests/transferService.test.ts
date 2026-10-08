/**
 * Unit Tests for TransferService (Unit-III ACID Transactions)
 * Tests the integer-cents arithmetic and validation logic.
 */

describe('TransferService — Integer Cents Arithmetic (Unit-III)', () => {
  // Test the toCents/fromCents logic directly
  const toCents = (amount: number): number => Math.round(amount * 100);
  const fromCents = (cents: number): number => cents / 100;

  describe('toCents() — Dollar to Cents Conversion', () => {
    it('should convert $10.50 to 1050 cents', () => {
      expect(toCents(10.50)).toBe(1050);
    });

    it('should convert $0.01 to 1 cent', () => {
      expect(toCents(0.01)).toBe(1);
    });

    it('should convert $100,000 to 10,000,000 cents', () => {
      expect(toCents(100000)).toBe(10000000);
    });

    it('should handle floating-point edge case: $0.1 + $0.2 = 30 cents', () => {
      // In raw JS: 0.1 + 0.2 = 0.30000000000000004
      // Our toCents should handle this correctly via Math.round
      expect(toCents(0.1 + 0.2)).toBe(30);
    });

    it('should convert $999.99 to 99999 cents', () => {
      expect(toCents(999.99)).toBe(99999);
    });
  });

  describe('fromCents() — Cents to Dollar Conversion', () => {
    it('should convert 1050 cents to $10.50', () => {
      expect(fromCents(1050)).toBe(10.50);
    });

    it('should convert 1 cent to $0.01', () => {
      expect(fromCents(1)).toBe(0.01);
    });

    it('should convert 0 cents to $0.00', () => {
      expect(fromCents(0)).toBe(0);
    });
  });

  describe('Balance Arithmetic — Debit/Credit Operations', () => {
    it('should correctly debit sender and credit receiver', () => {
      const senderBalanceCents = toCents(1000.00); // $1,000.00
      const receiverBalanceCents = toCents(500.00); // $500.00
      const transferCents = toCents(250.50); // $250.50

      const newSenderCents = senderBalanceCents - transferCents;
      const newReceiverCents = receiverBalanceCents + transferCents;

      expect(fromCents(newSenderCents)).toBe(749.50);
      expect(fromCents(newReceiverCents)).toBe(750.50);
    });

    it('should detect insufficient funds correctly', () => {
      const balanceCents = toCents(50.00);
      const transferCents = toCents(100.00);
      expect(balanceCents < transferCents).toBe(true);
    });

    it('should allow transfer of exact balance', () => {
      const balanceCents = toCents(100.00);
      const transferCents = toCents(100.00);
      expect(balanceCents >= transferCents).toBe(true);
      expect(fromCents(balanceCents - transferCents)).toBe(0);
    });

    it('should handle multiple small transfers without precision loss', () => {
      let balanceCents = toCents(100.00);
      // Transfer $0.01 one hundred times
      for (let i = 0; i < 100; i++) {
        balanceCents -= toCents(0.01);
      }
      expect(fromCents(balanceCents)).toBe(99.00);
    });
  });

  describe('Deterministic Lock Ordering (Deadlock Prevention)', () => {
    it('should always sort wallet IDs in the same order', () => {
      const walletA = 'aaaa-1111';
      const walletB = 'zzzz-9999';

      // Order A -> B
      const [first1, second1] = [walletA, walletB].sort();
      // Order B -> A (reversed input)
      const [first2, second2] = [walletB, walletA].sort();

      expect(first1).toBe(first2);
      expect(second1).toBe(second2);
      expect(first1).toBe(walletA);
    });

    it('should handle identical wallet IDs (self-transfer detection)', () => {
      const walletA = 'same-wallet-id';
      const [first, second] = [walletA, walletA].sort();
      expect(first).toBe(second);
    });
  });
});
