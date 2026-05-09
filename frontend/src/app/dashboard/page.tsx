'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import SubscriptionCard from '@/components/SubscriptionCard';
import SubscriptionModal from '@/components/SubscriptionModal';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info as InfoIcon, Zap, ShieldCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const { user, updateUser } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const { theme, resolvedTheme } = useTheme();
  const { formatPrice } = useCurrency();

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSubscriptions(data);
      fetchInsights();
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const { data } = await api.get('/subscriptions/insights');
      setInsights(data);
      // Synchronize notifications with user state
      if (user && data.notifications) {
        updateUser({ ...user, notifications: data.notifications });
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSave = async (formData: any) => {
    try {
      if (selectedSub) {
        await api.put(`/subscriptions/${selectedSub._id}`, formData);
      } else {
        await api.post('/subscriptions', formData);
      }
      fetchSubscriptions();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      try {
        await api.delete(`/subscriptions/${id}`);
        fetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };
  


  const filteredSubs = subscriptions.filter(sub => 
    filter === 'All' ? true : sub.status === filter
  );

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'Active') return acc;
    let price = sub.price;
    if (sub.planType === 'Yearly') price /= 12;
    if (sub.planType === 'Weekly') price *= 4;
    return acc + price;
  }, 0);

  const activeCount = subscriptions.filter(s => s.status === 'Active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'Expired').length;

  const getMonthlyTotals = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((_, i) => {
      // For demo purposes, we'll vary the total slightly per month 
      // but base it on the current totalMonthly to make it 'real-ish'
      const variance = 0.8 + (Math.random() * 0.4); 
      return (totalMonthly * variance).toFixed(2);
    });
  };

  const isDark = resolvedTheme === 'dark';

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Monthly Spending',
        data: getMonthlyTotals(),
        borderColor: isDark ? '#60a5fa' : '#3b82f6',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(59, 130, 246, 0.07)',
        tension: 0.4,
        pointBackgroundColor: isDark ? '#60a5fa' : '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#334155' : '#f1f5f9',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        boxShadow: isDark ? undefined : '0 4px 24px rgba(0,0,0,0.08)',
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#64748b' : '#334155', font: { weight: 600 } },
        border: { display: false },
      },
      y: {
        grid: { color: isDark ? 'rgba(51,65,85,0.6)' : 'rgba(0,0,0,0.06)', drawBorder: false },
        ticks: { color: isDark ? '#64748b' : '#334155', font: { weight: 600 } },
        border: { display: false },
      },
    },
  }), [isDark]);

  const doughnutData = {
    labels: insights?.categoryBreakdown?.map((c: any) => c._id) || [],
    datasets: [
      {
        data: insights?.categoryBreakdown?.map((c: any) => c.total) || [],
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'
        ],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 transition-colors">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Welcome to MySubscriptions</h1>
          <p className="text-muted mt-2 font-medium">Track your recurring expenses and effortlessly optimize your spending habits.</p>
        </div>
        <div className="flex gap-4 items-center">



          <button 
            onClick={() => { setSelectedSub(null); setIsModalOpen(true); }}
            className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-foreground/45 text-[10px] font-black uppercase tracking-widest">Monthly Expense</p>
          <h2 className="text-3xl font-black text-foreground mt-1">{formatPrice(totalMonthly)}</h2>
          <div className="mt-4 flex items-center gap-2 text-blue-500 text-xs font-black">
             <TrendingUp className="w-3 h-3" />
             Active Monthly Burn
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-foreground/45 text-[10px] font-black uppercase tracking-widest">Annual Projection</p>
          <h2 className="text-3xl font-black text-foreground mt-1">{formatPrice(insights?.annualProjection || totalMonthly * 12)}</h2>
          <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-black">
             <Zap className="w-3 h-3" />
             Est. Yearly Spending
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-red-500/30 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-foreground/45 text-[10px] font-black uppercase tracking-widest">Active Plans</p>
          <h2 className="text-3xl font-black text-foreground mt-1">{activeCount}</h2>
          <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-black font-mono">
             SUBS-ACTIVE-SECURE
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-foreground">Expense Analytics</h3>
            <select className="bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold text-muted outline-none cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions / Categories */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm transition-colors text-center relative overflow-hidden">
            <h3 className="text-lg font-black text-foreground mb-6">Category Split</h3>
            <div className="h-44 relative mb-4">
              {insights?.categoryBreakdown?.length > 0 ? (
                <Doughnut data={doughnutData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-muted font-bold">No categorical data yet</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {insights?.categoryBreakdown?.map((c: any, i: number) => (
                <div key={c._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/5 border border-border rounded-full">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }}></div>
                   <span className="text-[10px] font-black text-muted">{c._id}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Savings Advisor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <InfoIcon className="w-12 h-12 text-blue-400" />
             </div>
             <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Savings Advisor
             </h3>
             <div className="space-y-3">
                {insights?.savingsInsights?.length > 0 ? (
                  insights.savingsInsights.map((insight: any, i: number) => (
                    <div key={i} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                       <p className="text-xs font-medium text-blue-100">{insight.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                     <p className="text-xs font-medium text-emerald-100">All sets! No redundant subscriptions found.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Subscription List */}
      {loading || filteredSubs.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-foreground tracking-tight">Your Subscriptions</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 bg-muted/5 animate-pulse rounded-3xl border border-border"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredSubs.map((sub) => (
                <SubscriptionCard 
                  key={sub._id} 
                  subscription={sub} 
                  onEdit={(s) => { setSelectedSub(s); setIsModalOpen(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subscription={selectedSub}
      />


    </div>
  );
}
