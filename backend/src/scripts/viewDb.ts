import { sequelize } from '../config/postgres';
import { User, Wallet, Transaction } from '../models';

async function displayDatabase() {
  await sequelize.authenticate();

  console.log('\n========================================================================');
  console.log('             PAYPULSE LITE — PHYSICAL DATABASE LEDGER VIEW              ');
  console.log('========================================================================');
  console.log(`Database Dialect : ${sequelize.getDialect().toUpperCase()}`);
  console.log(`Storage Location : D:\\Agile\\backend\\paypulse.sqlite`);
  console.log('========================================================================\n');

  // 1. Users Table
  console.log('--- 👤 TABLE: users ---');
  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
  console.table(users.map((u) => u.toJSON()));

  // 2. Wallets Table
  console.log('\n--- 💳 TABLE: wallets ---');
  const wallets = await Wallet.findAll({ attributes: ['id', 'userId', 'balance', 'currency', 'status'] });
  console.table(wallets.map((w) => w.toJSON()));

  // 3. Transactions Table
  console.log('\n--- 💸 TABLE: transactions (Double-Entry SQL Ledger) ---');
  const transactions = await Transaction.findAll({
    attributes: ['id', 'senderWalletId', 'receiverWalletId', 'amount', 'currency', 'status', 'referenceNote', 'createdAt'],
  });
  if (transactions.length === 0) {
    console.log('  (No transfer transactions recorded yet. Transfer money on http://localhost:3000 to see ledger rows!)');
  } else {
    console.table(transactions.map((t) => t.toJSON()));
  }

  console.log('\n========================================================================\n');
  await sequelize.close();
}

displayDatabase().catch(console.error);
