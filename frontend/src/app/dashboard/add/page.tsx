'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Save, ChevronLeft, CreditCard, Calendar, Bookmark, Search } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

const LOGO_DEV_PUBLIC_KEY = 'pk_LNGzbHVYTtufuGuti0f-dw';

const POPULAR_PLANS = [
  { name: 'Netflix', domain: 'netflix', price: 15.49, plan: 'Monthly' },
  { name: 'Spotify', domain: 'spotify', price: 10.99, plan: 'Monthly' },
  { name: 'YouTube Premium', domain: 'youtube', price: 13.99, plan: 'Monthly' },
  { name: 'Disney+', domain: 'disney', price: 7.99, plan: 'Monthly' },
  { name: 'Adobe Creative Cloud', domain: 'adobe', price: 54.99, plan: 'Monthly' },
  { name: 'Figma', domain: 'figma', price: 12.00, plan: 'Monthly' },
  { name: 'ChatGPT Plus', domain: 'openai', price: 20.00, plan: 'Monthly' },
  { name: 'Apple Music', domain: 'apple', price: 10.99, plan: 'Monthly' },
  { name: 'Hulu', domain: 'hulu', price: 7.99, plan: 'Monthly' },
  { name: 'Notion', domain: 'notion', price: 8.00, plan: 'Monthly' },
  { name: 'GitHub Copilot', domain: 'github', price: 10.00, plan: 'Monthly' },
  { name: 'Dropbox', domain: 'dropbox', price: 9.99, plan: 'Monthly' },
  { name: 'Slack', domain: 'slack', price: 7.25, plan: 'Monthly' },
  { name: 'Zoom', domain: 'zoom', price: 14.99, plan: 'Monthly' },
  { name: 'Canva Pro', domain: 'canva', price: 12.99, plan: 'Monthly' }
];

export default function AddSubscriptionPage() {
  const router = useRouter();
  const { symbol, currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    price: 0,
    currency: currency,
    status: 'Active',
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    purchaseDate: new Date().toISOString().split('T')[0],
    planType: 'Monthly',
  });

  const calculateExpiry = (purchaseDate: string, planType: string) => {
    if (!purchaseDate) return '';
    const date = new Date(purchaseDate);
    if (isNaN(date.getTime())) return '';
    if (planType === 'Weekly') date.setDate(date.getDate() + 7);
    else if (planType === 'Monthly') date.setMonth(date.getMonth() + 1);
    else if (planType === 'Yearly') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (date: string, plan: string) => {
    const expiry = calculateExpiry(date, plan);
    setFormData({ ...formData, purchaseDate: date, expiryDate: expiry || formData.expiryDate, planType: plan });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscriptions', { ...formData, currency });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Failed to add subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPopular = (plan: typeof POPULAR_PLANS[0]) => {
    // Determine the equivalent price based on currency, or just use raw if standard
    let localizedPrice = plan.price;
    if (currency === 'INR') localizedPrice = plan.price * 80;
    else if (currency === 'EUR') localizedPrice = plan.price * 0.9;
    else if (currency === 'GBP') localizedPrice = plan.price * 0.8;
    
    setFormData({
      ...formData,
      serviceName: plan.name,
      price: Math.round(localizedPrice * 100) / 100,
      planType: plan.plan
    });
  };

  const filteredPlans = POPULAR_PLANS.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClasses = "w-full bg-background border border-border rounded-2xl py-4 px-5 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-muted/50";
  const labelClasses = "text-[10px] font-black text-foreground/45 mb-2 block ml-1 uppercase tracking-widest";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="p-3 bg-card border border-border rounded-2xl text-muted hover:text-foreground hover:border-muted transition-all shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Add New</h1>
          <p className="text-muted font-medium">Enter the details of your new subscription service.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Popular Plans Quick Select */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-sm font-black text-foreground/50 uppercase tracking-widest">Quick Add Popular Plans</h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
                />
              </div>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
              {filteredPlans.map(plan => (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => handleSelectPopular(plan)}
                  className="flex-shrink-0 w-36 p-4 bg-muted/5 border border-border hover:border-primary/30 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-95 snap-center"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-border/50 flex items-center justify-center mb-3 overflow-hidden p-2">
                    <img 
                      src={`https://img.logo.dev/name/${plan.domain}?token=${LOGO_DEV_PUBLIC_KEY}`} 
                      alt={plan.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(plan.name)}&background=random&color=fff`;
                      }}
                    />
                  </div>
                  <span className="font-bold text-foreground text-xs leading-tight mb-1">{plan.name}</span>
                  <span className="text-[10px] font-black text-muted">{symbol}{plan.price} / {plan.plan === 'Monthly' ? 'mo' : 'yr'}</span>
                </button>
              ))}
              
              {/* Dynamic Search Generation */}
              {searchQuery.length > 1 && !POPULAR_PLANS.some(p => p.name.toLowerCase() === searchQuery.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleSelectPopular({ name: searchQuery, domain: searchQuery.toLowerCase().replace(/\s+/g, ''), price: 0, plan: 'Monthly' })}
                  className="flex-shrink-0 w-36 p-4 bg-primary/5 border border-primary/30 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-95 snap-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-border/50 flex items-center justify-center mb-3 overflow-hidden p-2">
                    <img 
                      src={`https://img.logo.dev/name/${searchQuery.toLowerCase().replace(/\s+/g, '')}?token=${LOGO_DEV_PUBLIC_KEY}`} 
                      alt={searchQuery}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(searchQuery)}&background=random&color=fff`;
                      }}
                    />
                  </div>
                  <span className="font-bold text-primary text-xs leading-tight mb-1">Add "{searchQuery}"</span>
                  <span className="text-[10px] font-black text-primary/60">Dynamic Match</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-10 space-y-8 shadow-sm transition-colors">
            <div className="space-y-4">
              <label className={labelClasses}>Service Information</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted">
                  <Bookmark className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className={`${inputClasses} pl-14 font-bold`}
                  placeholder="Service Name (e.g. Netflix, Spotify, AWS)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClasses}>Price</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-black text-xl">
                    {symbol}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className={`${inputClasses} pl-12 font-black`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className={labelClasses}>Active Currency</label>
                <div className={`${inputClasses} flex items-center bg-muted/5 font-black text-blue-600 dark:text-blue-400 opacity-90 cursor-not-allowed`}>
                   {currency} - ({symbol})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClasses}>Billing Cycle</label>
                <select
                  value={formData.planType}
                  onChange={(e) => handleDateChange(formData.purchaseDate, e.target.value)}
                  className={`${inputClasses} font-bold appearance-none`}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className={labelClasses}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`${inputClasses} font-bold appearance-none`}
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>Purchase Date</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  required
                  value={formData.purchaseDate}
                  onClick={(e) => 'showPicker' in e.target && (e.target as HTMLInputElement).showPicker()}
                  onChange={(e) => handleDateChange(e.target.value, formData.planType)}
                  className={`${inputClasses} pl-14 font-bold cursor-pointer`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClasses}>Calculated Expiry Date</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  readOnly
                  value={formData.expiryDate}
                  className={`${inputClasses} pl-14 bg-muted/5 cursor-not-allowed text-blue-600 dark:text-blue-400 font-black`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm transition-colors">
            <h3 className="text-xl font-black text-foreground mb-6 uppercase tracking-tight">Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground/45">Plan</span>
                <span className="text-foreground">{formData.planType}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground/45">Total Price</span>
                <span className="text-foreground">{formData.price} {currency}</span>
              </div>
              <div className="pt-6 border-t border-border flex justify-between items-end">
                <span className="text-foreground font-black text-xs uppercase tracking-widest opacity-60">Monthly Impact</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                    {symbol}{formData.planType === 'Yearly' ? (formData.price / 12).toFixed(2) : formData.price.toFixed(2)}
                  </p>
                   <p className="text-[10px] font-black text-foreground/45 uppercase tracking-widest mt-1">{currency}</p>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground dark:bg-white hover:opacity-90 text-background dark:text-slate-900 font-black py-5 rounded-2xl transition-all shadow-xl shadow-foreground/10 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-background dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Subscription</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Premium Security</span>
            </div>
            <p className="text-xs text-foreground/50 leading-relaxed font-bold">
              Your subscription data is encrypted and stored securely. We never share your payment information with third parties.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
