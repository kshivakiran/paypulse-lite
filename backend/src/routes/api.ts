import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { getWalletDetails, transferFunds, getTransactionHistory } from '../controllers/walletController';
import { getAuditLogs } from '../controllers/auditController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { getMetricsHandler } from '../middleware/metrics';
import { validate, registerSchema, loginSchema, transferSchema } from '../middleware/validate';
import { authLimiter, transferLimiter } from '../middleware/rateLimiter';

const router = Router();

// --- Public Auth Routes (Rate Limited + Validated) ---
router.post('/auth/register', authLimiter, validate(registerSchema), register);
router.post('/auth/login', authLimiter, validate(loginSchema), login);

// --- Protected Wallet & Transfer Routes (JWT + Validated) ---
router.get('/wallet', authenticateJWT, getWalletDetails);
router.post('/wallet/transfer', authenticateJWT, transferLimiter, validate(transferSchema), transferFunds);
router.get('/wallet/transactions', authenticateJWT, getTransactionHistory);

// --- Admin Audit Logs Route (JWT + Admin Role Required) ---
router.get('/audit-logs', authenticateJWT, requireAdmin, getAuditLogs);

// --- Observability Route (Prometheus scraping) ---
router.get('/metrics', getMetricsHandler);

export default router;
