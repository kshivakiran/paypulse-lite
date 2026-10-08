import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TransactionRecord, AuditLogEntry } from '../../types';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import WalletCard from './WalletCard';
import TransferForm from './TransferForm';
import TransactionTable from './TransactionTable';
import AuditLogStream from './AuditLogStream';

export default function Dashboard() {
  const { user, wallet, logout, refreshWallet } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [txRes, auditRes] = await Promise.allSettled([
        api.get<{ transactions: TransactionRecord[] }>('/wallet/transactions'),
        api.get<{ logs: AuditLogEntry[] }>('/audit-logs'),
      ]);

      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data.transactions || []);
      }
      if (auditRes.status === 'fulfilled') {
        setAuditLogs(auditRes.value.data.logs || []);
      }

      await refreshWallet();
    } catch {
      // errors handled by interceptor
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshWallet]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTransferComplete = () => {
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-6 md:p-8">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 pb-5 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PayPulse Lite Portal</h1>
            <p className="text-xs text-gray-400">Enterprise ACID Ledger & DevOps Telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs bg-gray-800/80 border border-gray-700/60 px-3 py-1.5 rounded-lg text-gray-300">
            {user?.name} ({user?.email})
          </span>
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Wallet + Transfer Form */}
        <div className="space-y-6 md:col-span-1">
          <WalletCard wallet={wallet} />
          <TransferForm onTransferComplete={handleTransferComplete} />
        </div>

        {/* Right Column: SQL Ledger & NoSQL Audit */}
        <div className="space-y-6 md:col-span-2">
          <TransactionTable transactions={transactions} walletId={wallet?.id} />
          <AuditLogStream auditLogs={auditLogs} />
        </div>
      </main>
    </div>
  );
}
