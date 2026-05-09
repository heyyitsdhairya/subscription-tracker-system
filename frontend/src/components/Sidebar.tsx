'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CreditCard, 
  Settings, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: PlusCircle, label: 'Add New', href: '/dashboard/add' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-border flex flex-col h-screen sticky top-0 bg-background transition-colors duration-300">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-foreground text-background rounded-2xl flex items-center justify-center shadow-xl shadow-foreground/10 transition-all">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="text-xl font-black text-foreground tracking-tight">
          MySubscriptions
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-muted uppercase tracking-widest mb-4">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                isActive 
                  ? "bg-foreground text-background shadow-lg shadow-foreground/10" 
                  : "text-muted hover:bg-muted/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-background" : "text-muted group-hover:text-foreground"
              )} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-background/40"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-muted/5 border border-border rounded-3xl p-6">
          <p className="text-sm font-black text-foreground mb-1 leading-none tracking-tight">Upgrade to Pro</p>
          <p className="text-xs text-muted mb-4 font-medium leading-relaxed">Unlock advanced analytics and reminders.</p>
          <button className="w-full bg-background border border-border hover:border-muted text-foreground text-xs font-black py-2.5 rounded-xl transition-all shadow-sm">
            Learn More
          </button>
        </div>
      </div>
    </aside>
  );
}
