import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const usePostgres = process.env.NODE_ENV !== 'test' && process.env.USE_POSTGRES === 'true';

export const sequelize = usePostgres
  ? new Sequelize(
      process.env.POSTGRES_DB || 'paypulse_db',
      process.env.POSTGRES_USER || 'postgres',
      process.env.POSTGRES_PASSWORD || 'postgres',
      {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: './paypulse.sqlite',
      logging: false,
    });

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Relational DB Connected via Sequelize (${usePostgres ? 'PostgreSQL' : 'SQLite Local Engine'})`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};
