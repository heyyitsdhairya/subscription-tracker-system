'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const { formatPrice } = useCurrency();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, insightsRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/subscriptions/insights')
        ]);
        setSubscriptions(subsRes.data);
        setInsights(insightsRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'Active') return acc;
    let price = sub.price;
    if (sub.planType === 'Yearly') price /= 12;
    if (sub.planType === 'Weekly') price *= 4;
    return acc + price;
  }, 0);

  const activeCount = subscriptions.filter(s => s.status === 'Active').length;
  const yearlyProjection = insights?.annualProjection || (totalMonthly * 12);

  const getMonthlyTotals = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((_, i) => {
      const variance = 0.8 + (Math.random() * 0.4); 
      return (totalMonthly * variance).toFixed(2);
    });
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Monthly Spending',
        data: getMonthlyTotals(),
        borderColor: isDark ? '#60a5fa' : '#3b82f6',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(59, 130, 246, 0.07)',
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: insights?.categoryBreakdown?.map((c: any) => c._id) || ['No Data'],
    datasets: [{
      data: insights?.categoryBreakdown?.length > 0 ? insights.categoryBreakdown.map((c: any) => c.total) : [100],
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: isDark ? '#64748b' : '#334155', font: { weight: 600 } } 
      },
      y: { 
        grid: { color: isDark ? 'rgba(51,65,85,0.6)' : 'rgba(0,0,0,0.06)' }, 
        ticks: { color: isDark ? '#64748b' : '#334155', font: { weight: 600 } } 
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Spending Analytics</h1>
          <p className="text-muted mt-2 font-medium">Deep dive into your subscription costs and usage patterns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-card border border-border text-muted px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-muted/5 hover:text-foreground transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Monthly Average', value: formatPrice(totalMonthly), icon: CreditCard, color: 'text-blue-500', isUp: null },
          { label: 'Yearly Estimate', value: formatPrice(yearlyProjection), icon: TrendingUp, color: 'text-emerald-500', isUp: null },
          { label: 'Active Subscriptions', value: activeCount, icon: BarChart3, color: 'text-amber-500', isUp: null },
          { label: 'Total Services', value: subscriptions.length, icon: PieChart, color: 'text-indigo-500', isUp: null },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 hover:border-primary/20 transition-all shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-muted/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-foreground/45 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-foreground">Expense Trend</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white">Monthly</button>
              <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-muted/10 text-muted hover:text-foreground transition-all">Yearly</button>
            </div>
          </div>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-8">Category Split</h3>
          <div className="h-64 relative mb-6">
            <Pie data={categoryData} options={{...chartOptions, plugins: { legend: { display: false }}}} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{subscriptions.length ? '100%' : '0%'}</span>
              <span className="text-xs text-muted font-bold">Allocated</span>
            </div>
          </div>
          <div className="space-y-3">
            {categoryData.labels.map((label: string, i: number) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryData.datasets[0].backgroundColor[i] }}></div>
                  <span className="text-sm text-muted font-bold">{label}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{categoryData.datasets[0].data[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-foreground mb-6">Subscription Renewals by Status</h3>
        <div className="h-64">
          <Bar 
            data={{
              labels: ['Active', 'Expired', 'Cancelled'],
              datasets: [{
                label: 'Status Count',
                data: [
                  subscriptions.filter((s:any) => s.status === 'Active').length,
                  subscriptions.filter((s:any) => s.status === 'Expired').length,
                  subscriptions.filter((s:any) => s.status === 'Cancelled').length,
                ],
                backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444'],
                borderRadius: 8,
              }]
            }} 
            options={chartOptions} 
          />
        </div>
      </div>
    </div>
  );
}
