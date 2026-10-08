/**
 * Task 3.1 — Shared TypeScript interfaces for the React frontend.
 * Replaces all `any` types with proper type safety.
 */

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface WalletInfo {
  id: string;
  userId?: string;
  balance: string | number;
  currency: string;
  status?: 'active' | 'frozen';
}

export interface TransactionRecord {
  id: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: string | number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'FLAGGED';
  referenceNote?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  eventType: string;
  userId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserInfo;
  wallet: WalletInfo;
}
