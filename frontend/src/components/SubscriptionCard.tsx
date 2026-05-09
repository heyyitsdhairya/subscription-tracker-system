'use client';

import {
  Calendar,
  CreditCard,
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '@/context/CurrencyContext';

interface Subscription {
  _id: string;
  serviceName: string;
  price: number;
  currency: string;
  status: 'Active' | 'Expired' | 'Cancelled';
  expiryDate: string;
  planType: string;
  serviceWebsite?: string;
  logoUrl?: string;
}

interface Props {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const LOGO_DEV_PUBLIC_KEY = 'pk_LNGzbHVYTtufuGuti0f-dw';

const getLogo = (name: string, website?: string) => {
  // If a website domain is provided, use it directly (extract domain name)
  let query = encodeURIComponent(name.toLowerCase());
  if (website) {
    const domain = website.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    query = domain;
  }
  
  return `https://img.logo.dev/name/${query}?token=${LOGO_DEV_PUBLIC_KEY}`;
};

export default function SubscriptionCard({ subscription, onEdit, onDelete }: Props) {
  const isExpired = subscription.status === 'Expired' || new Date(subscription.expiryDate) < new Date();
  const { formatPrice } = useCurrency();
  const statusColors = {
    Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    Expired: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    Cancelled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  };

  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
      {/* Premium Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500 shadow-sm relative overflow-hidden">
             {/* Icon inner glow */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            {subscription.logoUrl || getLogo(subscription.serviceName, subscription.serviceWebsite) ? (
              <img 
                src={subscription.logoUrl || getLogo(subscription.serviceName, subscription.serviceWebsite)!} 
                alt={subscription.serviceName}
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`text-2xl font-black text-muted group-hover:text-primary transition-colors duration-500 ${subscription.logoUrl || getLogo(subscription.serviceName, subscription.serviceWebsite) ? 'hidden' : ''}`}>
              {subscription.serviceName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground leading-none mb-3 group-hover:text-primary transition-colors duration-500">
              {subscription.serviceName}
            </h3>
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${statusColors[subscription.status]} transition-all duration-500`}>
              {subscription.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(subscription)} className="p-2.5 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300">
            <Edit3 className="w-4.5 h-4.5" />
          </button>
          <button onClick={() => onDelete(subscription._id)} className="p-2.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-300">
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted font-bold">
            <div className="w-8 h-8 rounded-lg bg-muted/5 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <CreditCard className="w-4 h-4 opacity-70" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-black text-foreground/45">Price</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-foreground">
              {formatPrice(subscription.price)}
            </span>
            <span className="text-[10px] text-muted ml-1 font-bold opacity-60">/{subscription.planType}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted font-bold">
            <div className="w-8 h-8 rounded-lg bg-muted/5 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <Calendar className="w-4 h-4 opacity-70" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-black text-foreground/45">Expiry</span>
          </div>
          <span className={`font-black tracking-tight ${isExpired ? 'text-rose-500' : 'text-foreground'}`}>
            {format(new Date(subscription.expiryDate), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      {isExpired && subscription.status !== 'Cancelled' && (
        <div className="mt-8 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse relative z-10">
          <AlertTriangle className="w-4 h-4" />
          Action Required: Renewal Due
        </div>
      )}

      <button className="w-full mt-8 py-4 bg-foreground dark:bg-slate-800 hover:bg-primary dark:hover:bg-primary text-background dark:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500 border border-border hover:border-primary flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/20 relative z-10">
        <ExternalLink className="w-4 h-4" />
        Visit Service
      </button>
    </div>
  );
}
