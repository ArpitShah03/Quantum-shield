import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { mockUser } from '../../data/mockData';

export function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <button className="md:hidden mr-4 text-text-muted hover:text-text-main">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search papers, logs, or users..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden lg:block text-sm font-medium text-text-muted">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        
        <button className="relative text-text-muted hover:text-text-main transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        <div className="flex items-center space-x-3 border-l border-border pl-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-text-main leading-tight">{mockUser.name}</div>
            <div className="text-xs text-text-muted">{mockUser.role}</div>
          </div>
          <img
            src={mockUser.avatar}
            alt="User Avatar"
            className="w-9 h-9 rounded-full border border-border object-cover"
          />
        </div>
      </div>
    </header>
  );
}
