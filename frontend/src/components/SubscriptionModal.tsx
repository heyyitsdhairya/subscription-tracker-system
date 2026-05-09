'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface Subscription {
  _id?: string;
  serviceName: string;
  price: number;
  currency: string;
  status: 'Active' | 'Expired' | 'Cancelled';
  expiryDate: string;
  purchaseDate?: string;
  planType: string;
  serviceWebsite?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: any) => void;
  subscription?: Subscription | null;
}

export default function SubscriptionModal({ isOpen, onClose, onSave, subscription }: Props) {
  const { symbol, currency } = useCurrency();
  const [formData, setFormData] = useState<Subscription>({
    serviceName: '',
    price: 0,
    currency: currency,
    status: 'Active',
    expiryDate: '',
    planType: 'Monthly',
    serviceWebsite: '',
  });

  const calculateExpiry = (purchaseDate: string, planType: string) => {
    const date = new Date(purchaseDate);
    if (planType === 'Weekly') date.setDate(date.getDate() + 7);
    else if (planType === 'Monthly') date.setMonth(date.getMonth() + 1);
    else if (planType === 'Yearly') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (date: string, plan: string) => {
    const expiry = calculateExpiry(date, plan);
    setFormData({ ...formData, purchaseDate: date, expiryDate: expiry, planType: plan });
  };

  useEffect(() => {
    if (subscription) {
      setFormData({
        ...subscription,
        expiryDate: subscription.expiryDate.split('T')[0],
        purchaseDate: (subscription.purchaseDate || subscription.expiryDate).split('T')[0],
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const defaultExpiry = calculateExpiry(today, 'Monthly');
      setFormData({
        serviceName: '',
        price: 0,
        currency: currency,
        status: 'Active',
        purchaseDate: today,
        expiryDate: defaultExpiry,
        planType: 'Monthly',
        serviceWebsite: '',
      });
    }
  }, [subscription, isOpen, currency]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in transition-colors duration-300">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            {subscription ? 'Edit Plan' : 'Add New'}
          </h2>
          <button onClick={onClose} className="p-3 text-muted hover:text-foreground hover:bg-muted/10 rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-10 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Service Name</label>
            <input
              type="text"
              required
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold placeholder:text-muted/30 placeholder:font-medium"
              placeholder="e.g. Netflix, Spotify"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Service Website (for Logo)</label>
            <input
              type="text"
              value={formData.serviceWebsite}
              onChange={(e) => setFormData({ ...formData, serviceWebsite: e.target.value })}
              className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold placeholder:text-muted/30 placeholder:font-medium"
              placeholder="e.g. netflix.com, spotify.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Price</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-black text-xl">{symbol}</div>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Currency</label>
              <div className="w-full bg-muted/5 border border-border rounded-2xl py-4 px-6 text-blue-600 dark:text-blue-400 font-black flex items-center opacity-90">
                <span>{currency} ({symbol})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Plan Type</label>
              <select
                value={formData.planType}
                onChange={(e) => handleDateChange(formData.purchaseDate || '', e.target.value)}
                className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Purchase Date</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => handleDateChange(e.target.value, formData.planType)}
                className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground/45 uppercase tracking-widest ml-1">Calculated Expiry</label>
              <input
                type="date"
                readOnly
                value={formData.expiryDate}
                className="w-full bg-muted/5 border border-border rounded-2xl py-4 px-6 text-blue-600 dark:text-blue-400 font-black cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-background border border-border hover:bg-muted/5 text-muted font-bold py-4 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-foreground dark:bg-white hover:opacity-90 text-background dark:text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-xl shadow-foreground/10 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
