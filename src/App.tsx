/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import SystemLogs from './components/SystemLogs';
import { LayoutDashboard, Package, ArrowLeftRight, Settings as SettingsIcon, Stethoscope, Activity } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'inventory' | 'transactions' | 'logs' | 'settings';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const navItems = [
    { id: 'dashboard', label: '仪表盘概览', icon: LayoutDashboard },
    { id: 'inventory', label: '物料库存', icon: Package },
    { id: 'transactions', label: '出入库明细', icon: ArrowLeftRight },
    { id: 'logs', label: '系统日志', icon: Activity },
    { id: 'settings', label: '数据备份', icon: SettingsIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar Top / Left */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col shrink-0">
        <div className="p-6 pb-2 border-b border-slate-800 flex items-center gap-3 text-white">
          <div className="bg-teal-500 p-2 rounded-lg">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white leading-tight">门诊活动物料系统</h1>
            <p className="text-xs text-slate-400 font-medium">Dental Clinic Inventory</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-x-auto md:overflow-x-visible flex md:block scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal w-full text-left",
                activeTab === item.id 
                  ? "bg-teal-600 text-white shadow-sm" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-teal-100" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'logs' && <SystemLogs />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
}
