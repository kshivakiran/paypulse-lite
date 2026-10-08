import React from 'react';
import { Wallet } from 'lucide-react';
import { WalletInfo } from '../../types';

interface WalletCardProps {
  wallet: WalletInfo | null;
}

const formatBalance = (val: string | number | undefined): string => {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-950 via-gray-900 to-gray-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between text-indigo-300 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider">Digital Wallet</span>
        <Wallet className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="text-3xl font-black text-white mb-2 tracking-tight">
        ${formatBalance(wallet?.balance)}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{wallet?.currency || 'USD'}</span>
        <span>•</span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {wallet?.status?.toUpperCase() || 'ACTIVE'}
        </span>
      </div>
    </div>
  );
}
