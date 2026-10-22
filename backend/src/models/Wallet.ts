import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/postgres';

interface WalletAttributes {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen';
  createdAt?: Date;
  updatedAt?: Date;
}

interface WalletCreationAttributes extends Optional<WalletAttributes, 'id' | 'status'> {}

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> {
  declare id: string;
  declare userId: string;
  declare balance: number;
  declare currency: string;
  declare status: 'active' | 'frozen';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Wallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 1000.0,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('active', 'frozen'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
  }
);
