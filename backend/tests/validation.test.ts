import request from 'supertest';
import express from 'express';
import apiRoutes from '../src/routes/api';
import { globalErrorHandler } from '../src/middleware/errorHandler';

process.env.JWT_SECRET = 'test_secret_key_for_testing_purposes_only';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(globalErrorHandler);

describe('API Security & Validation (Unit-II Middleware Stack)', () => {
  // --- Protected Route Access ---
  describe('Protected Routes (JWT Authentication)', () => {
    it('GET /api/v1/wallet should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/wallet');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('denied');
    });

    it('GET /api/v1/wallet/transactions should reject without token', async () => {
      const res = await request(app).get('/api/v1/wallet/transactions');
      expect(res.status).toBe(401);
    });

    it('POST /api/v1/wallet/transfer should reject without token', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/transfer')
        .send({ receiverEmail: 'user@test.com', amount: 50 });
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/audit-logs should reject without token', async () => {
      const res = await request(app).get('/api/v1/audit-logs');
      expect(res.status).toBe(401);
    });

    it('should reject requests with malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/wallet')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('should reject requests with expired-format token', async () => {
      const res = await request(app)
        .get('/api/v1/wallet')
        .set('Authorization', 'InvalidScheme token123');
      expect(res.status).toBe(401);
    });
  });

  // --- Transfer Validation (Zod Schema) ---
  describe('POST /api/v1/wallet/transfer (Validation)', () => {
    const validToken = 'Bearer test'; // Will be rejected by JWT, testing validation order

    it('should validate that amount is a number', async () => {
      // Even though JWT will fail first, we test the schema independently
      const { transferSchema } = require('../src/middleware/validate');
      const result = transferSchema.safeParse({
        receiverEmail: 'user@test.com',
        amount: 'not-a-number',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative amounts in schema validation', async () => {
      const { transferSchema } = require('../src/middleware/validate');
      const result = transferSchema.safeParse({
        receiverEmail: 'user@test.com',
        amount: -100,
      });
      expect(result.success).toBe(false);
    });

    it('should reject amounts exceeding $100,000', async () => {
      const { transferSchema } = require('../src/middleware/validate');
      const result = transferSchema.safeParse({
        receiverEmail: 'user@test.com',
        amount: 150000,
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid transfer payload', async () => {
      const { transferSchema } = require('../src/middleware/validate');
      const result = transferSchema.safeParse({
        receiverEmail: 'user@test.com',
        amount: 50.00,
        referenceNote: 'Payment for services',
      });
      expect(result.success).toBe(true);
    });

    it('should reject amounts with more than 2 decimal places', async () => {
      const { transferSchema } = require('../src/middleware/validate');
      const result = transferSchema.safeParse({
        receiverEmail: 'user@test.com',
        amount: 10.999,
      });
      expect(result.success).toBe(false);
    });
  });

  // --- Health Check ---
  describe('Health & Metrics Endpoints (Unit-V Observability)', () => {
    it('GET /api/v1/metrics should return Prometheus metrics', async () => {
      const res = await request(app).get('/api/v1/metrics');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text');
    });
  });
});
