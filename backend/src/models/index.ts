import { User } from './User';
import { Wallet } from './Wallet';
import { Transaction } from './Transaction';
import { AuditLog } from './AuditLog';

// Establish Associations
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'senderWalletId', as: 'sentTransactions' });
Wallet.hasMany(Transaction, { foreignKey: 'receiverWalletId', as: 'receivedTransactions' });

export { User, Wallet, Transaction, AuditLog };
