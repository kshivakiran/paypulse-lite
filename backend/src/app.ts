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

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'UP', service: 'PayPulse Lite API', timestamp: new Date() });
});

// --- API Routes ---
app.use('/api/v1', apiRoutes);

// --- 404 Handler ---
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// --- Global Error Handler (Task 2.5) ---
app.use(globalErrorHandler);

// --- Database Sync & Server Launch ---
const startServer = async () => {
  await connectPostgres();
  await connectMongo();

  await sequelize.sync();
  console.log('✅ Relational Database Schema Synced');

  app.listen(PORT, () => {
    console.log(`🚀 PayPulse Lite Server running on http://localhost:${PORT}`);
    console.log(`📊 Prometheus Metrics at http://localhost:${PORT}/api/v1/metrics`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
