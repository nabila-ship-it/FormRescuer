import React from 'react';
import { ShieldCheck, HardDrive, Settings, Lock, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, activeFieldsCount }) {
  const navItems = [
    { id: 'current', label: 'Tab Aktif', icon: Sparkles, badge: activeFieldsCount > 0 ? activeFieldsCount : null },
    { id: 'vault', label: 'Semua Draf', icon: HardDrive },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
    { id: 'privacy', label: 'Keamanan', icon: Lock },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 pt-3.5 pb-2">
      {/* Brand & Status Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-wide text-white">FormRescuer</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Penyelamat Form & Google Forms</p>
          </div>
        </div>

        {/* Live Protection Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-pulse"></span>
          <span>Aktif Melindungi</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex space-x-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
