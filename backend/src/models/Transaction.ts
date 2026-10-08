import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/postgres';

interface TransactionAttributes {
  id: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'FLAGGED';
  referenceNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id'> {}

export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> {
  declare id: string;
  declare senderWalletId: string;
  declare receiverWalletId: string;
  declare amount: number;
  declare currency: string;
  declare status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'FLAGGED';
  declare referenceNote: string | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderWalletId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverWalletId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'FLAGGED'),
      defaultValue: 'PENDING',
    },
    referenceNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
  }
);
