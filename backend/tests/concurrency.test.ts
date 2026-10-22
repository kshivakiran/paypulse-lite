import { sequelize } from '../src/config/postgres';
import { User, Wallet, Transaction } from '../src/models';
import { TransferService } from '../src/services/transferService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

describe('TransferService Concurrency & Overspend Invariant Tests (Unit-III)', () => {
  let senderUserId: string;
  let senderWalletId: string;
  let receiverEmail: string;
  let receiverWalletId: string;

  beforeAll(async () => {
    // Ensure clean schema sync before running concurrency tests
    await sequelize.sync({ force: true });

    const passwordHash = await bcrypt.hash('testpassword', 8);

    // Create Sender with exactly $1,000.00 starting balance
    const sender = await User.create({
      id: crypto.randomUUID(),
      name: 'Concurrent Sender',
      email: 'concurrent-sender@paypulse.test',
      passwordHash,
      role: 'customer',
    });
    senderUserId = sender.id;

    const senderWallet = await Wallet.create({
      id: crypto.randomUUID(),
      userId: sender.id,
      balance: 1000.0,
      currency: 'USD',
      status: 'active',
    });
    senderWalletId = senderWallet.id;

    // Create Receiver with $0.00 starting balance
    const receiver = await User.create({
      id: crypto.randomUUID(),
      name: 'Concurrent Receiver',
      email: 'concurrent-receiver@paypulse.test',
      passwordHash,
      role: 'customer',
    });
    receiverEmail = receiver.email;

    const receiverWallet = await Wallet.create({
      id: crypto.randomUUID(),
      userId: receiver.id,
      balance: 0.0,
      currency: 'USD',
      status: 'active',
    });
    receiverWalletId = receiverWallet.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should safely handle 5 simultaneous $500 transfers from a $1,000 balance: 2 succeed, 3 fail, final balance = $0', async () => {
    // Expected scenario from architectural review:
    // Starting balance: $1,000
    // Concurrent requests: 5 × $500 ($2,500 total demand)
    // Successful transfers: 2 ($1,000 processed)
    // Rejected transfers: 3 (Rejected with Insufficient Funds)
    // Final sender balance: $0.00

    const transferPromises = Array.from({ length: 5 }, (_, idx) =>
      TransferService.executeTransfer({
        senderUserId,
        receiverEmail,
        amount: 500.0,
        referenceNote: `Concurrent Request #${idx + 1}`,
      })
    );

    const outcomes = await Promise.allSettled(transferPromises);

    const successful = outcomes.filter((o) => o.status === 'fulfilled');
    const rejected = outcomes.filter((o) => o.status === 'rejected') as PromiseRejectedResult[];

    // 1. Verify transfer count invariants
    expect(successful.length).toBe(2);
    expect(rejected.length).toBe(3);

    // 2. Verify all rejected attempts failed due to Insufficient Funds (not crash or unhandled error)
    rejected.forEach((rej) => {
      expect(rej.reason.message).toMatch(/Insufficient funds/i);
    });

    // 3. Verify final database state for sender wallet
    const updatedSender = await Wallet.findByPk(senderWalletId);
    expect(parseFloat(updatedSender!.balance.toString())).toBe(0.0);

    // 4. Verify final database state for receiver wallet
    const updatedReceiver = await Wallet.findByPk(receiverWalletId);
    expect(parseFloat(updatedReceiver!.balance.toString())).toBe(1000.0);

    // 5. Verify immutable double-entry ledger transactions
    const recordedTransactions = await Transaction.findAll({
      where: { senderWalletId },
    });
    expect(recordedTransactions.length).toBe(2);
    recordedTransactions.forEach((tx) => {
      expect(parseFloat(tx.amount.toString())).toBe(500.0);
      expect(tx.status).toBe('COMPLETED');
    });
  });

  it('should reject a negative balance update at model validation level', async () => {
    // Verification of check constraint / model validation: balance >= 0
    await expect(
      Wallet.create({
        id: crypto.randomUUID(),
        userId: senderUserId,
        balance: -250.0,
        currency: 'USD',
        status: 'active',
      })
    ).rejects.toThrow();
  });
});
