import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  LayoutDashboard, UploadCloud, CheckSquare, 
  Download, Settings, FileText, ShieldCheck
} from 'lucide-react';

export default function MainLayout() {
  const { role, email, name, logout } = useContext(AuthContext); 
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Professor', 'Administrator', 'Exam Centre'] },
    { label: 'Upload Paper', path: '/upload', icon: UploadCloud, roles: ['Professor'] },
    { label: 'My Papers', path: '/my-papers', icon: FileText, roles: ['Professor'] },
    { label: 'Pending Approvals', path: '/approvals', icon: CheckSquare, roles: ['Administrator'] },
    { label: 'Downloads', path: '/downloads', icon: Download, roles: ['Exam Centre'] },
    { label: 'Profile', path: '/settings', icon: Settings, roles: ['Professor', 'Administrator', 'Exam Centre'] },
  ];

  const authorizedNav = navItems.filter(item => item.roles.includes(role || ''));

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-[260px] bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="h-[72px] flex items-center px-6 border-b border-slate-800">
          <ShieldCheck className="w-8 h-8 text-blue-500 mr-3" />
          <span className="text-xl font-bold tracking-wide">QuantumShield</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {authorizedNav.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center px-4 py-3 rounded-md transition ${location.pathname === item.path ? 'bg-slate-800 border-l-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}
          </h2>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{name || email}</p>
              <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-1">
                {role}
              </p>
            </div>
            <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-red-500 transition">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
