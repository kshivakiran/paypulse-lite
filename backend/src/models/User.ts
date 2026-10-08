import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/postgres';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> {
  // Use `declare` instead of class fields to avoid shadowing Sequelize getters
  declare id: string;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: 'customer' | 'admin';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin'),
      defaultValue: 'customer',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
