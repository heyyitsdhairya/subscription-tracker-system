'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, User, Bell, Search, Sun, Moon, Monitor, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = user?.notifications?.filter(n => !n.read).length || 0;

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    if (theme === 'system') return <Monitor className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const getThemeTitle = () => {
    if (theme === 'light') return 'Switch to Dark Mode';
    if (theme === 'dark') return 'Switch to System Mode';
    return 'Switch to Light Mode';
  };

  return (
    <nav className="h-20 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-2.5 w-96 group focus-within:border-blue-500/30 transition-all">
        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search subscriptions..." 
          className="bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 w-full font-medium"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          title={getThemeTitle()}
        >
          {getThemeIcon()}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 z-50 text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-sm font-black uppercase tracking-widest opacity-50">Notifications</h4>
                  {unreadNotifications > 0 && <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">{unreadNotifications} New</span>}
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {user?.notifications && user.notifications.length > 0 ? (
                    user.notifications.slice().reverse().map((n, idx) => (
                      <div key={n.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs font-bold leading-relaxed">{n.text}</p>
                        <p className="text-[10px] opacity-50 mt-1 font-medium">{new Date(n.date).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                      <ShieldCheck className="w-8 h-8 opacity-20 mx-auto mb-2" />
                      <p className="text-xs font-bold">All caught up!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block text-slate-900 dark:text-white">
            <p className="text-sm font-black leading-none mb-1">{user?.username || 'User'}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Premium</p>
          </div>
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10 overflow-hidden">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <button 
            onClick={logout}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
