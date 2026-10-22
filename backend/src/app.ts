import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectPostgres, sequelize } from './config/postgres';
import { connectMongo } from './config/mongo';
import apiRoutes from './routes/api';
import { metricsMiddleware } from './middleware/metrics';
import { globalErrorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Global Middleware Stack ---
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent abuse
app.use(generalLimiter);
app.use(metricsMiddleware);

// --- Root Welcome Route ---
app.get('/', (_req, res) => {
  res.json({
    service: 'PayPulse Lite REST API Server',
    status: 'ONLINE',
    version: '1.0.0',
    frontendUrl: 'http://localhost:3000',
    documentation: {
      health: '/health',
      metrics: '/api/v1/metrics',
      apiBase: '/api/v1',
    },
    message: 'Welcome to PayPulse Lite API. Open http://localhost:3000 in your browser to access the Web Portal.',
  });
});

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'UP', service: 'PayPulse Lite API', timestamp: new Date() });
});

// --- API Routes ---
app.use('/api/v1', apiRoutes);

// --- 404 Handler ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found. Valid API routes are under /api/v1. Web portal is at http://localhost:3000' });
});

// --- Global Error Handler (Task 2.5) ---
app.use(globalErrorHandler);

// --- Database Sync & Server Launch ---
const startServer = async () => {
  await connectPostgres();
  await connectMongo();

  await sequelize.sync();
  console.log('✅ Relational Database Schema Synced');

  // Enforce DB-level constraint for non-negative balances (Unit-III Financial Invariant)
  try {
    if (sequelize.getDialect() === 'postgres') {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'check_balance_non_negative'
          ) THEN
            ALTER TABLE "wallets" ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
          END IF;
        END $$;
      `);
      console.log('🔒 Database Constraint Verified: check_balance_non_negative');
    }
  } catch (constraintErr: any) {
    console.warn('⚠️ Could not verify DB check constraint:', constraintErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 PayPulse Lite Server running on http://localhost:${PORT}`);
    console.log(`📊 Prometheus Metrics at http://localhost:${PORT}/api/v1/metrics`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
