import request from 'supertest';
import express from 'express';
import apiRoutes from '../src/routes/api';
import { globalErrorHandler } from '../src/middleware/errorHandler';

process.env.JWT_SECRET = 'test_secret_key_for_testing_purposes_only';

const app = express();
app.use(express.json());
app.get('/health', (_req, res) => {
  res.json({ status: 'UP', service: 'PayPulse Lite API', timestamp: new Date() });
});
app.use('/api/v1', apiRoutes);
app.use(globalErrorHandler);

describe('PayPulse Lite — Core API Integration Tests', () => {
  // --- Health Check (Unit-V) ---
  describe('Health Endpoint', () => {
    it('GET /health should return status UP with service name', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('PayPulse Lite API');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // --- 404 Handler ---
  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  // --- Auth Endpoint Integration ---
  describe('Auth Endpoints (Unit-II)', () => {
    it('POST /api/v1/auth/register should reject empty payloads with 400 and validation error', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/v1/auth/login should reject empty credentials with 400', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // --- Protected Route Guards ---
  describe('JWT Protected Routes (Unit-II Middleware)', () => {
    it('GET /api/v1/wallet should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/wallet');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/v1/wallet/transfer should reject without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/transfer')
        .send({ receiverEmail: 'test@example.com', amount: 50 });
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/wallet/transactions should reject without auth', async () => {
      const res = await request(app).get('/api/v1/wallet/transactions');
      expect(res.status).toBe(401);
    });
  });
});
