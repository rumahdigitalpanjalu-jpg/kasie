/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/layout/Header';
import { POSView } from './components/pos/POSView';
import { InventoryView } from './components/inventory/InventoryView';
import { TransactionHistoryView } from './components/transactions/TransactionHistoryView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReceiptModal } from './components/receipt/ReceiptModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, notification, setNotification } = usePOS();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'transactions' && <TransactionHistoryView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-800 text-white border-slate-700'
            } px-4 py-3 rounded-xl shadow-xl`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-300 shrink-0" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Receipt Modal */}
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
