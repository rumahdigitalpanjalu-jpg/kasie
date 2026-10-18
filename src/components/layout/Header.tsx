import React from 'react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types/pos';
import { ShoppingCart, Package, ReceiptText, BarChart3, ShieldCheck, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, cart, products, settings, updateSettings } = usePOS();

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pos', label: 'Kasir', icon: <ShoppingCart className="w-4 h-4" />, badge: cartItemCount > 0 ? cartItemCount : undefined },
    { id: 'inventory', label: 'Inventaris & Stok', icon: <Package className="w-4 h-4" />, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan Penjualan', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'admin', label: 'Dashboard Admin', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            K
          </div>
          <button
            onClick={() => setActiveTab('pos')}
            className="text-left font-bold text-lg tracking-tight text-slate-900 hover:text-emerald-700 transition-colors whitespace-nowrap"
          >
            KasirPintar
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean text states) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[11px] font-mono tabular-nums ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : item.id === 'inventory'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action & Cashier Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => updateSettings({ enableSound: !settings.enableSound })}
            title={settings.enableSound ? 'Suara Aktif (Klik untuk Matikan)' : 'Suara Mati (Klik untuk Nyalakan)'}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle sound"
          >
            {settings.enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 border-l border-slate-200 pl-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-800 truncate max-w-[140px]">{settings.activeCashier}</span>
          </div>

          {lowStockCount > 0 && activeTab === 'pos' && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{lowStockCount} Stok Menipis</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-200 px-3 py-2 gap-1 bg-slate-50">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="text-[10px] font-mono">({item.badge})</span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
