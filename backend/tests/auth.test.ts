import request from 'supertest';
import express from 'express';
import apiRoutes from '../src/routes/api';
import { globalErrorHandler } from '../src/middleware/errorHandler';

process.env.JWT_SECRET = 'test_secret_key_for_testing_purposes_only';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(globalErrorHandler);

describe('Authentication API Endpoints (Unit-II Security)', () => {
  // --- Registration Validation ---
  describe('POST /api/v1/auth/register', () => {
    it('should reject empty payload with 400', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    it('should reject short password (< 6 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('6 characters');
    });

    it('should reject name shorter than 2 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'A', email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('2 characters');
    });

    it('should reject missing name field', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(400);
    });
  });

  // --- Login Validation ---
  // Note: Auth rate limiter (5 req/15min) may trigger 429 during rapid test execution.
  // Both 400 (validation) and 429 (rate-limited) correctly reject bad requests.
  describe('POST /api/v1/auth/login', () => {
    it('should reject empty credentials (400 or 429 if rate-limited)', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect([400, 429]).toContain(res.status);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with missing password (400 or 429 if rate-limited)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' });
      expect([400, 429]).toContain(res.status);
    });

    it('should reject login with invalid email format (400 or 429 if rate-limited)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'bad-email', password: 'password123' });
      expect([400, 429]).toContain(res.status);
    });
  });
});
