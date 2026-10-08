import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface AuditLogStreamProps {
  auditLogs: AuditLogEntry[];
  isAdmin?: boolean;
}

export default function AuditLogStream({ auditLogs, isAdmin = false }: AuditLogStreamProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Security Audit Stream (MongoDB Telemetry)
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
          isAdmin ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>
          {isAdmin ? 'ADMIN LIVE STREAM' : 'ROLE: CUSTOMER'}
        </span>
      </h2>

      {!isAdmin ? (
        <div className="text-center text-gray-400 py-6 border border-dashed border-gray-800 rounded-xl bg-gray-950/40">
          <Lock className="w-6 h-6 text-indigo-400 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-medium text-gray-300">Telemetry Stream Restricted to Administrators</p>
          <p className="text-[11px] text-gray-500 mt-1">
            As a Customer, all your transactions are securely audited in MongoDB automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
          {auditLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              Audit logs stream will appear here in real-time as transactions occur.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log._id}
                className="bg-gray-950/80 p-3 rounded-xl border border-gray-800/80 hover:border-gray-700 transition"
              >
                <div className="flex items-center justify-between text-indigo-400 mb-1">
                  <span className="font-semibold">{log.eventType}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-400 text-[11px] truncate">
                  {JSON.stringify(log.details)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
