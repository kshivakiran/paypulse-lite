import { sequelize } from '../config/postgres';
import { User, Wallet, Transaction, AuditLog } from '../models';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface TransferParams {
  senderUserId: string;
  receiverEmail: string;
  amount: number;
  referenceNote?: string;
  ipAddress?: string;
}

/**
 * Converts a dollar amount to integer cents to avoid JS floating-point errors.
 * e.g. $10.50 → 1050 cents
 */
function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts integer cents back to dollar string for storage.
 * e.g. 1050 → 10.50
 */
function fromCents(cents: number): number {
  return cents / 100;
}

export class TransferService {
  /**
   * Executes a monetary transfer with:
   * - Integer cents arithmetic (Task 1.2: no floating-point corruption)
   * - Deterministic lock ordering (Task 1.3: no deadlocks)
   * - Safe rollback (Task 1.5: rollback errors don't mask original error)
   */
  public static async executeTransfer(params: TransferParams) {
    const { senderUserId, receiverEmail, amount, referenceNote, ipAddress } = params;

    if (amount <= 0) {
      throw new BadRequestError('Transfer amount must be greater than zero.');
    }

    if (amount > 100000) {
      throw new BadRequestError('Transfer amount cannot exceed $100,000.');
    }

    const amountCents = toCents(amount);

    const transaction = await sequelize.transaction();
    let committed = false;

    try {
      // --- Step 1: Look up both wallets WITHOUT locks first ---
      const senderWallet = await Wallet.findOne({
        where: { userId: senderUserId },
        transaction,
      });

      if (!senderWallet) {
        throw new NotFoundError('Sender wallet not found.');
      }

      if (senderWallet.status !== 'active') {
        throw new BadRequestError('Sender wallet is frozen or inactive.');
      }

      const receiverUser = await User.findOne({
        where: { email: receiverEmail },
        include: [{ model: Wallet, as: 'wallet' }],
        transaction,
      });

      const receiverWallet = (receiverUser as any)?.wallet as Wallet | undefined;

      if (!receiverUser || !receiverWallet) {
        throw new NotFoundError(`Receiver with email '${receiverEmail}' not found.`);
      }

      if (senderWallet.id === receiverWallet.id) {
        throw new BadRequestError('Cannot transfer funds to your own wallet.');
      }

      // --- Step 2: DETERMINISTIC LOCK ORDERING (Task 1.3) ---
      // Always lock the wallet with the smaller ID first.
      // This guarantees that two concurrent transfers between the same
      // two users will always acquire locks in the same order → no deadlock.
      const [firstId, secondId] = [senderWallet.id, receiverWallet.id].sort();

      const firstWallet = await Wallet.findOne({
        where: { id: firstId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const secondWallet = await Wallet.findOne({
        where: { id: secondId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!firstWallet || !secondWallet) {
        throw new NotFoundError('Wallet disappeared during transfer.');
      }

      // Re-resolve which is sender and which is receiver after locking
      const lockedSender = firstWallet.id === senderWallet.id ? firstWallet : secondWallet;
      const lockedReceiver = firstWallet.id === receiverWallet.id ? firstWallet : secondWallet;

      // --- Step 3: INTEGER CENTS ARITHMETIC (Task 1.2) ---
      const senderBalanceCents = toCents(parseFloat(lockedSender.balance.toString()));
      const receiverBalanceCents = toCents(parseFloat(lockedReceiver.balance.toString()));

      if (senderBalanceCents < amountCents) {
        const available = fromCents(senderBalanceCents);
        throw new BadRequestError(`Insufficient funds. Available: $${available.toFixed(2)}`);
      }

      const newSenderCents = senderBalanceCents - amountCents;
      const newReceiverCents = receiverBalanceCents + amountCents;

      await lockedSender.update({ balance: fromCents(newSenderCents) }, { transaction });
      await lockedReceiver.update({ balance: fromCents(newReceiverCents) }, { transaction });

      // --- Step 4: Record transaction in SQL ledger ---
      const txRecord = await Transaction.create(
        {
          senderWalletId: lockedSender.id,
          receiverWalletId: lockedReceiver.id,
          amount,
          currency: 'USD',
          status: 'COMPLETED',
          referenceNote,
        },
        { transaction }
      );

      await transaction.commit();
      committed = true;

      // --- Step 5: Async audit log to MongoDB (fire-and-forget) ---
      if (mongoose.connection.readyState === 1) {
        AuditLog.create({
          eventType: 'MONEY_TRANSFER_COMPLETED',
          userId: senderUserId,
          ipAddress,
          details: {
            transactionId: txRecord.id,
            senderWalletId: lockedSender.id,
            receiverWalletId: lockedReceiver.id,
            amount,
            senderNewBalance: fromCents(newSenderCents),
          },
        }).catch((err) => console.error('Audit log write failed:', err.message));
      }

      return {
        transactionId: txRecord.id,
        amount,
        senderNewBalance: fromCents(newSenderCents),
        status: 'COMPLETED',
      };
    } catch (error: any) {
      // --- Task 1.5: Safe rollback ---
      if (!committed) {
        try {
          await transaction.rollback();
        } catch (rollbackErr: any) {
          console.error('Rollback failed (connection may have dropped):', rollbackErr.message);
        }
      }

      // Async failure audit log
      if (mongoose.connection.readyState === 1) {
        AuditLog.create({
          eventType: 'MONEY_TRANSFER_FAILED',
          userId: senderUserId,
          ipAddress,
          details: { receiverEmail, amount, reason: error.message },
        }).catch(() => {});
      }

      throw error;
    }
  }
}
