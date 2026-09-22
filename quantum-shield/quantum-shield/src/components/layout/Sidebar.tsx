import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Security Dashboard', path: '/dashboard/admin' },
  { icon: ShieldCheck, label: 'Crypto Analytics', path: '/dashboard/crypto-analytics' },
  { icon: Activity, label: 'Performance Benchmarks', path: '/dashboard/benchmarks' },
  { icon: ShieldCheck, label: 'Attack Lab', path: '/dashboard/attack-lab' },
  { icon: FileText, label: 'Incident Center', path: '/dashboard/incidents' },
  { icon: Upload, label: 'Upload Paper', path: '/dashboard/upload' },
  { icon: FileText, label: 'Exam Papers', path: '/dashboard/papers' },
  { icon: Users, label: 'Research Mode', path: '/dashboard/research' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <ShieldCheck className="w-8 h-8 text-primary mr-2" />
        <span className="font-bold text-xl tracking-tight text-text-main">QuantumShield</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2">Menu</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-2 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-text-muted hover:bg-surface hover:text-text-main'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <NavLink
          to="/login"
          className="flex items-center px-2 py-2.5 rounded-md text-sm font-medium text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
          Logout
        </NavLink>
      </div>
    </aside>
  );
}
