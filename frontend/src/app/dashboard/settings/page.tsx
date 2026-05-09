'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  User, 
  Lock, 
  Bell, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Camera,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Palette,
  Calendar,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('Profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState(user?.username || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setProfilePic(user.profilePic || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.put('/users/profile', { username, profilePic, phone });
      updateUser(data);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put('/users/security', { currentPassword, newPassword });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Appearance', icon: Palette },
    { name: 'Security', icon: Lock },
    { name: 'Notifications', icon: Bell },
  ];

  const themeOptions = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Classic bright look' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Easier on the eyes' },
    { id: 'system', name: 'System', icon: Monitor, description: 'Follows OS setting' },
  ] as const;

  const currencyOptions = [
    { id: 'INR', name: 'INR (₹)', description: 'Indian Rupee' },
    { id: 'USD', name: 'USD ($)', description: 'US Dollar' },
    { id: 'EUR', name: 'EUR (€)', description: 'Euro' },
    { id: 'GBP', name: 'GBP (£)', description: 'British Pound' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in duration-500 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Settings</h1>
          <p className="text-muted font-medium mt-1">Manage your account and preferences.</p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                activeTab === tab.name 
                  ? 'bg-foreground text-background shadow-xl shadow-foreground/5' 
                  : 'text-muted hover:bg-card hover:text-foreground border border-transparent hover:border-border'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-10 transition-colors">
            {/* Tab Header */}
            <div className="border-b border-border pb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {(() => {
                  const CurrentIcon = tabs.find(t => t.name === activeTab)?.icon || User;
                  return <CurrentIcon className="w-6 h-6" />;
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">{activeTab}</h2>
                <p className="text-sm text-muted font-medium">Manage your {activeTab.toLowerCase()} settings</p>
              </div>
            </div>

            {activeTab === 'Profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-10">
                {/* Profile Picture Section */}
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2rem] bg-background border border-border flex items-center justify-center text-5xl font-black text-foreground overflow-hidden shadow-inner group-hover:border-primary/50 transition-all duration-500">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-foreground text-background p-3 rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-card"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">Profile Photo</h3>
                    <p className="text-muted text-sm font-medium leading-relaxed max-w-xs">
                      Update your account photo for easier identification. Professional photos are recommended.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-50" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Choose a cool handle"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-30" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || 'Not provided'}
                        className="w-full bg-muted/5 border border-border/50 rounded-2xl py-4 pl-14 pr-6 text-foreground/60 font-medium cursor-not-allowed italic"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-30" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed border-border">
                  <div className="flex items-center gap-4 px-6 py-4 bg-muted/5 rounded-2xl border border-border">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                         <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-wider">Plan Status</p>
                        <p className="text-sm font-black text-foreground">Premium Member</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-4 bg-muted/5 rounded-2xl border border-border">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-wider">Member Since</p>
                        <p className="text-sm font-black text-foreground">March 2024</p>
                      </div>
                  </div>
                </div>

                {/* Feedback & Action */}
                <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex-1">
                      {success && (
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-500/5 px-5 py-3 rounded-2xl border border-emerald-500/20 animate-in">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-black">{success}</span>
                        </div>
                      )}
                      {error && (
                        <div className="flex items-center gap-3 text-rose-600 bg-rose-500/5 px-5 py-3 rounded-2xl border border-rose-500/20 animate-in">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-black">{error}</span>
                        </div>
                      )}
                      {!success && !error && (
                        <div className="flex items-center gap-3 text-foreground/40">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                             <Lock className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider opacity-80">Verified & Encrypted</span>
                        </div>
                      )}
                   </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-foreground text-background hover:opacity-90 disabled:bg-muted px-12 py-4 rounded-2xl font-black transition-all shadow-xl shadow-foreground/5 flex items-center justify-center gap-3 min-w-[200px]"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'SYNCING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'Appearance' && (
              <div className="space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Theme Mode</h3>
                    <div className="h-px bg-border flex-1 ml-6" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as any)}
                        className={`flex flex-col p-6 rounded-[2rem] border-2 text-left transition-all duration-300 ${
                          theme === option.id 
                            ? 'bg-foreground border-foreground text-background shadow-2xl shadow-foreground/10' 
                            : 'bg-background border-border text-foreground hover:border-primary/30'
                        }`}
                      >
                        <option.icon className={`w-6 h-6 mb-5 ${theme === option.id ? 'text-background' : 'text-primary'}`} />
                        <span className="font-black text-base">{option.name}</span>
                        <span className={`text-[10px] font-medium mt-1 leading-relaxed ${theme === option.id ? 'opacity-70' : 'text-muted'}`}>
                          {option.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Currency Display</h3>
                    <div className="h-px bg-border flex-1 ml-6" />
                  </div>
                  <p className="text-sm text-muted font-medium">Select your preferred currency for dashboard tracking.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currencyOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCurrency(opt.id as any)}
                        className={`p-5 rounded-2xl border-2 transition-all text-center ${
                          currency === opt.id 
                            ? 'bg-primary/10 border-primary text-primary font-black shadow-lg shadow-primary/5' 
                            : 'bg-background border-border text-muted hover:border-primary/20 hover:text-foreground'
                        }`}
                      >
                        <span className="block text-xl mb-1">{CURRENCY_SYMBOLS[opt.id]}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.id}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 flex gap-6 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Palette className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-black text-foreground">Premium Experience</p>
                    <p className="text-sm font-medium text-muted mt-1">Our UI adapts and learns from your preferences to provide the ultimate tracking experience.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <form onSubmit={handleChangePassword} className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Update Password</h3>
                    <div className="h-px bg-border flex-1 ml-6" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted opacity-50" />
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-background border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-background border border-border rounded-2xl py-4 px-6 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex-1">
                      {success && (
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-500/5 px-5 py-3 rounded-2xl border border-emerald-500/20 animate-in">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-black">{success}</span>
                        </div>
                      )}
                      {error && (
                        <div className="flex items-center gap-3 text-rose-600 bg-rose-500/5 px-5 py-3 rounded-2xl border border-rose-500/20 animate-in">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-black">{error}</span>
                        </div>
                      )}
                      {!success && !error && (
                        <p className="text-xs text-muted font-medium flex items-center gap-2">
                           <AlertCircle className="w-4 h-4 text-primary" />
                           Security tip: Use a unique password with at least 8 characters.
                        </p>
                      )}
                   </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-foreground text-background hover:opacity-90 disabled:bg-muted px-12 py-4 rounded-2xl font-black transition-all shadow-xl shadow-foreground/5 flex items-center justify-center gap-3 min-w-[200px]"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'SECURING...' : 'UPDATE PASSWORD'}
                  </button>
                </div>

                <div className="mt-12 bg-muted/5 border border-border rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-foreground">Two-Factor Authentication</h4>
                                <p className="text-xs text-muted font-medium">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <button type="button" className="px-5 py-2.5 bg-background border border-border rounded-xl text-xs font-black text-foreground hover:bg-muted/10 transition-colors">
                            Enable
                        </button>
                    </div>

                    <div className="h-px bg-border/50" />

                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted">Last Login</span>
                        <span className="text-foreground">Today at 10:45 AM from Chrome (Windows)</span>
                    </div>
                </div>
              </form>
            )}

            {activeTab === 'Notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    push: true
  });

  const toggles = [
    { id: 'email' as const, title: 'Email Alerts', description: 'Monthly summaries and renewal reminders.', icon: Bell },
    { id: 'sms' as const, title: 'SMS Updates', description: 'Critical expiry alerts to your mobile.', icon: Smartphone },
    { id: 'push' as const, title: 'Push Notifications', description: 'Instant browser alerts for price changes.', icon: Monitor },
  ];

  return (
    <div className="space-y-10 animate-in slide-in-from-right-2 duration-300">
      <div className="space-y-8">
        {toggles.map((item) => {
          const isActive = prefs[item.id];
          return (
            <div key={item.id} className="flex items-center justify-between p-6 bg-muted/3 rounded-[2rem] border border-border hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                        <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-xs text-muted font-medium">{item.description}</p>
                    </div>
                </div>
                <button 
                  onClick={() => setPrefs({ ...prefs, [item.id]: !isActive })}
                  className={`w-14 h-8 rounded-full transition-all relative p-1 ${isActive ? 'bg-primary' : 'bg-muted/20'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
          );
        })}
      </div>

      <div className="p-8 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 text-center">
          <p className="text-xs text-muted font-bold leading-relaxed">
              We respect your privacy. You can unsubscribe from these alerts at any time by toggling the options above.
          </p>
      </div>
    </div>
  );
}
