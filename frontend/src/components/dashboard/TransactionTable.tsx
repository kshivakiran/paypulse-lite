import React from 'react';
import { Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { TransactionRecord } from '../../types';

interface TransactionTableProps {
  transactions: TransactionRecord[];
  walletId: string | undefined;
}

const formatBalance = (val: string | number | undefined): string => {
  if (val === undefined || val === null) return '0.00';
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export default function TransactionTable({ transactions, walletId }: TransactionTableProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        SQL Ledger Transactions (ACID Guaranteed)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-800/60 text-gray-400">
            <tr>
              <th className="p-3 rounded-l-xl">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3 rounded-r-xl">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No transactions recorded yet. Initiate your first transfer above.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isSender = tx.senderWalletId === walletId;
                return (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition">
                    <td className="p-3 flex items-center gap-2 font-medium">
                      {isSender ? (
                        <ArrowUpRight className="w-4 h-4 text-rose-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className={isSender ? 'text-rose-300' : 'text-emerald-300'}>
                        {isSender ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        isSender ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isSender ? '-' : '+'}${formatBalance(tx.amount)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-semibold">
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
