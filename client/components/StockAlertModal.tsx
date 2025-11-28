import React, { useState } from 'react';
import { BellRing, Check, X } from 'lucide-react';
import { ModernButton } from './ui/modern-button';
import { ModernInput } from './ui/modern-input';
import { api } from '../lib/api';

interface StockAlertModalProps {
  productId: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StockAlertModal: React.FC<StockAlertModalProps> = ({
  productId,
  productName,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.products.subscribeToStock(productId, email);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to subscribe to stock alerts');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <BellRing className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Stock Alert</h3>
            <p className="text-sm text-slate-600">Get notified when this item is back in stock</p>
          </div>
        </div>

        <p className="mb-6 text-slate-600">
          Product: <span className="font-medium text-slate-900">{productName}</span>
        </p>

        {success ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5" />
            Successfully subscribed to stock alerts!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <ModernInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <ModernButton
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Notify Me'}
            </ModernButton>
          </form>
        )}
      </div>
    </div>
  );
}
