'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  CreditCard, 
  CheckCircle2, 
  ArrowUpRight, 
  Download, 
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Star
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';

const MOCK_INVOICES: any[] = [];

export default function BillingPage() {
  const { formatPrice, currency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await api.get('/subscriptions');
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const { user, updateUser } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'Active') return acc;
    let price = sub.price;
    if (sub.planType === 'Yearly') price /= 12;
    if (sub.planType === 'Weekly') price *= 4;
    return acc + price;
  }, 0);

  const yearlyProjection = totalMonthly * 12;

  const currentPlan = user?.plan || 'Starter';

  const planDetails: Record<string, any> = {
    Starter: { name: 'Starter Tier', desc: 'You are currently on the free Starter plan. Track your subscriptions locally.', price: 0, color: 'text-foreground' },
    Pro: { name: 'Pro Professional', desc: 'Enjoy unlimited subscription tracking, advanced analytics, and priority notifications across all your devices.', price: 1999, color: 'text-primary' },
    Enterprise: { name: 'Enterprise', desc: 'Full concierge support with white-label features, custom integrations, and dedicated account manager.', price: 7999, color: 'text-amber-500' }
  };

  const activePlanDetails = planDetails[currentPlan];

  const handleSelectPlan = async (newPlan: string) => {
    if (newPlan === currentPlan) return;
    setUpgrading(true);
    try {
      const { data } = await api.put('/users/plan', { plan: newPlan });
      updateUser(data);
      setShowPlans(false);
    } catch (err: any) {
      alert('Failed to upgrade plan: ' + err.message);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-foreground">Preparing Billing Details...</h2>
          <p className="text-sm font-medium text-muted">Securely fetching your payment history and current plan specifics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Billing & Plans</h1>
          <p className="text-muted mt-2 font-medium">Manage your subscription plan, payment methods, and billing history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Current Plan Card */}
          <div className="bg-card border border-primary/20 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-sm transition-all hover:border-primary/40">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Zap className={`w-48 h-48 ${activePlanDetails.color}`} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-primary/20">
                  Current Tier
                </div>
                <h2 className="text-4xl font-black text-foreground">{activePlanDetails.name}</h2>
                <p className="text-muted max-w-sm text-sm font-medium leading-relaxed">{activePlanDetails.desc}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
                  <div className="flex items-center gap-3 text-foreground font-black text-lg">
                    {currentPlan !== 'Starter' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    {formatPrice(activePlanDetails.price)} <span className="text-xs text-foreground/45">/ mo</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 min-w-[200px]">
                <button 
                  onClick={() => setShowPlans(!showPlans)}
                  className="bg-foreground text-background dark:bg-white dark:text-slate-950 px-8 py-4 rounded-2xl font-black hover:opacity-95 transition-all shadow-xl shadow-foreground/5 active:scale-[0.98]">
                  {showPlans ? 'Close Plans' : (currentPlan === 'Starter' ? 'Upgrade Plan' : 'Change Plan')}
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Selector Menu */}
          {showPlans && (
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm transition-all grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
              {['Starter', 'Pro', 'Enterprise'].map((p) => (
                <div key={p} className={`border ${currentPlan === p ? 'border-primary bg-primary/5' : 'border-border bg-background'} rounded-2xl p-6 flex flex-col items-center justify-center text-center group transition-all hover:border-primary/40`}>
                  <Star className={`w-10 h-10 mb-4 ${planDetails[p].color} opacity-80`} />
                  <h3 className="text-lg font-black text-foreground mb-2">{planDetails[p].name}</h3>
                  <p className="text-xl font-bold text-foreground mb-6">{formatPrice(planDetails[p].price)}<span className="text-xs text-muted font-black uppercase">/mo</span></p>
                  
                  <button 
                    onClick={() => handleSelectPlan(p)}
                    disabled={currentPlan === p || upgrading}
                    className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPlan === p ? 'bg-primary/20 text-primary cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`}>
                    {upgrading ? 'Updating...' : (currentPlan === p ? 'Current Plan' : 'Select Plan')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Payment Methods */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-foreground">Payment Methods</h3>
              </div>
              <button className="bg-muted/5 text-primary border border-primary/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 transition-all">
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center py-8">
                 <p className="text-muted font-bold text-sm">No payment methods added</p>
                 <p className="text-muted/60 font-medium text-xs mt-1">Add a payment method to upgrade your plan.</p>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm transition-colors">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                  <History className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-black text-foreground">Billing History</h3>
            </div>
            
            <div className="overflow-x-auto text-center py-10">
              <p className="text-muted font-bold text-sm">No billing history empty</p>
              <p className="text-muted/60 font-medium text-xs mt-1">Your past invoices will appear here.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Billing Insights */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-foreground uppercase tracking-tight">Financial Insights</h4>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-foreground/45 uppercase tracking-widest mb-1">Monthly Spending</p>
                  <p className="text-3xl font-black text-foreground">{formatPrice(totalMonthly)}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-black leading-none mb-1.5">
                  <ArrowUpRight className="w-3 h-3" />
                  2.4%
                </div>
              </div>
              <div className="h-1.5 bg-muted/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed border-border">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-foreground/45 uppercase tracking-widest mb-1">Yearly Projection</p>
                  <p className="text-3xl font-black text-foreground">{formatPrice(yearlyProjection)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 space-y-6 transition-colors">
            <div className="flex items-center gap-4 text-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Premium Guard</span>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed font-bold">
              We use 256-bit encryption for all financial transactions. Your payment data is never stored locally on our servers.
            </p>
            <div className="pt-6 border-t border-emerald-500/10 flex items-center justify-between">
              <span className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">Verified by Stripe</span>
              <div className="flex gap-4 opacity-40">
                <div className="text-foreground font-black text-[9px]">VISA</div>
                <div className="text-foreground font-black text-[9px]">MASTERCARD</div>
              </div>
            </div>
          </div>

          {/* Support Link */}
          <div className="bg-primary rounded-[2rem] p-8 text-center space-y-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-white/5 translate-x-full transition-transform duration-1000 group-hover:translate-x-0" />
            <h4 className="text-2xl font-black text-white relative z-10">Need Help?</h4>
            <p className="text-white/80 text-xs leading-relaxed font-bold relative z-10">
              If you have any questions about your plan or billing history, our experts are here 24/7.
            </p>
            <button className="w-full bg-white text-primary font-black py-4 rounded-2xl hover:bg-primary/5 hover:text-white transition-all border-2 border-transparent hover:border-white relative z-10 active:scale-[0.98] shadow-lg">
              Contact Support Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
