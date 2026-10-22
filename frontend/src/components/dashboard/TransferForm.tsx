import React, { useState } from 'react';
import { api } from '../../services/api';
import { Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransferFormProps {
  onTransferComplete: () => void;
}

export default function TransferForm({ onTransferComplete }: TransferFormProps) {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid transfer amount greater than ₹0.');
      }

      const res = await api.post('/wallet/transfer', {
        receiverEmail,
        amount: parsedAmount,
        referenceNote: referenceNote.trim() || undefined,
      });

      setMessage({ text: res.data.message, type: 'success' });
      setReceiverEmail('');
      setAmount('');
      setReferenceNote('');
      onTransferComplete();
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.error || err.message || 'Transfer failed.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
        <Send className="w-4 h-4 text-indigo-400" />
        Transfer Money (ACID Safe)
      </h2>

      {message && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">Receiver Email</label>
          <input
            type="email"
            required
            placeholder="user2@example.com"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="50.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">Note (Optional)</label>
          <input
            type="text"
            placeholder="Project milestone fee"
            value={referenceNote}
            onChange={(e) => setReferenceNote(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing ACID Transfer...</span>
            </>
          ) : (
            'Send Money'
          )}
        </button>
      </form>
    </div>
  );
}
