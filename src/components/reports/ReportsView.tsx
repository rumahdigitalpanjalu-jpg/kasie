import React, { useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, downloadCSV } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Award,
  CreditCard,
  Download,
  Package,
  Layers,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, products } = usePOS();

  // Only consider SELESAI transactions for revenue/profit
  const completedTransactions = useMemo(
    () => transactions.filter((t) => t.status === 'SELESAI'),
    [transactions]
  );

  // Financial aggregates
  const totalRevenue = useMemo(
    () => completedTransactions.reduce((sum, t) => sum + t.total, 0),
    [completedTransactions]
  );

  const totalDiscountGiven = useMemo(
    () => completedTransactions.reduce((sum, t) => sum + t.discount, 0),
    [completedTransactions]
  );

  const totalCOGS = useMemo(() => {
    return completedTransactions.reduce((sum, t) => {
      const trxCOGS = t.items.reduce((itemSum, item) => itemSum + item.buyPrice * item.quantity, 0);
      return sum + trxCOGS;
    }, 0);
  }, [completedTransactions]);

  const grossProfit = totalRevenue - totalCOGS;
  const profitMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalItemsSold = useMemo(
    () =>
      completedTransactions.reduce(
        (sum, t) => sum + t.items.reduce((isum, item) => isum + item.quantity, 0),
        0
      ),
    [completedTransactions]
  );

  const averageOrderValue =
    completedTransactions.length > 0 ? Math.round(totalRevenue / completedTransactions.length) : 0;

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; category: string; quantity: number; revenue: number }>();

    for (const trx of completedTransactions) {
      for (const item of trx.items) {
        const existing = map.get(item.productId) || {
          name: item.productName,
          sku: item.sku,
          category: item.category,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        map.set(item.productId, existing);
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [completedTransactions]);

  // Payment Methods Breakdown
  const paymentBreakdown = useMemo(() => {
    const stats = {
      TUNAI: { count: 0, total: 0 },
      QRIS: { count: 0, total: 0 },
      TRANSFER: { count: 0, total: 0 },
      DEBIT: { count: 0, total: 0 },
    };

    for (const trx of completedTransactions) {
      if (stats[trx.paymentMethod]) {
        stats[trx.paymentMethod].count += 1;
        stats[trx.paymentMethod].total += trx.total;
      }
    }

    return stats;
  }, [completedTransactions]);

  // Category breakdown
  const categoryRevenue = useMemo(() => {
    const catMap = new Map<string, number>();
    for (const trx of completedTransactions) {
      for (const item of trx.items) {
        const current = catMap.get(item.category) || 0;
        catMap.set(item.category, current + item.subtotal);
      }
    }
    return Array.from(catMap.entries())
      .map(([cat, total]) => ({ category: cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [completedTransactions]);

  const handleExportFullReport = () => {
    const rows = [
      ['RINGKASAN LAPORAN KEUANGAN & PENJUALAN'],
      ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
      ['Total Omzet Penjualan', totalRevenue],
      ['Total Modal Barang (HPP)', totalCOGS],
      ['Total Estimasi Laba Kotor', grossProfit],
      ['Margin Keuntungan (%)', `${profitMarginPercent}%`],
      ['Total Transaksi Selesai', completedTransactions.length],
      ['Total Unit Terjual', totalItemsSold],
      ['Rata-rata Nilai Nota', averageOrderValue],
      [],
      ['PRODUK TERLARIS'],
      ['Nama Produk', 'SKU', 'Kategori', 'Jumlah Terjual', 'Total Omzet'],
      ...topProducts.map((p) => [p.name, p.sku, p.category, p.quantity, p.revenue]),
      [],
      ['METODE PEMBAYARAN'],
      ['Metode', 'Jumlah Transaksi', 'Total Nominal'],
      ['Tunai', paymentBreakdown.TUNAI.count, paymentBreakdown.TUNAI.total],
      ['QRIS', paymentBreakdown.QRIS.count, paymentBreakdown.QRIS.total],
      ['Transfer', paymentBreakdown.TRANSFER.count, paymentBreakdown.TRANSFER.total],
      ['Kartu Debit', paymentBreakdown.DEBIT.count, paymentBreakdown.DEBIT.total],
    ];

    downloadCSV(`Ringkasan-Laporan-Penjualan-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Laporan & Analisis Penjualan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan omzet, estimasi laba, dan performa inventaris barang secara real-time.
          </p>
        </div>

        <button
          onClick={handleExportFullReport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Laporan Lengkap (.CSV)</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {completedTransactions.length} transaksi selesai
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Estimasi Laba Kotor</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatRupiah(grossProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Margin: <span className="font-semibold text-emerald-700">{profitMarginPercent}%</span> dari omzet
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Item Terjual</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalItemsSold}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unit barang keluar ke pembeli</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Rata-rata Nilai Belanja</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(averageOrderValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Rata-rata per struk belanja</div>
        </div>
      </div>

      {/* 2-Column Split: Top Products & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Produk Terlaris (Top Bestsellers)</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Berdasarkan kuantitas</span>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data transaksi.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, index) => {
                const maxQty = topProducts[0]?.quantity || 1;
                const percent = Math.round((p.quantity / maxQty) * 100);

                return (
                  <div key={p.sku} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 font-mono font-bold text-slate-400 text-center shrink-0">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-slate-900 truncate">{p.name}</span>
                      </div>
                      <div className="text-right font-mono shrink-0 pl-2">
                        <span className="font-bold text-slate-900 tabular-nums">{p.quantity} terjual</span>
                        <span className="text-slate-400 text-[10px] block tabular-nums">
                          {formatRupiah(p.revenue)}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Distribusi Metode Pembayaran</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Pilihan Pelanggan</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(
                [
                  { key: 'TUNAI', label: 'Tunai (Cash)', color: 'border-emerald-200 bg-emerald-50/50' },
                  { key: 'QRIS', label: 'QRIS', color: 'border-blue-200 bg-blue-50/50' },
                  { key: 'TRANSFER', label: 'Transfer Bank', color: 'border-purple-200 bg-purple-50/50' },
                  { key: 'DEBIT', label: 'Kartu Debit', color: 'border-amber-200 bg-amber-50/50' },
                ] as const
              ).map((m) => {
                const stat = paymentBreakdown[m.key];
                const pct = totalRevenue > 0 ? ((stat.total / totalRevenue) * 100).toFixed(0) : '0';

                return (
                  <div key={m.key} className={`p-3 rounded-lg border ${m.color}`}>
                    <div className="text-xs font-semibold text-slate-800">{m.label}</div>
                    <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1">
                      {formatRupiah(stat.total)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {stat.count} trx · {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Revenue Distribution */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Omzet Menurut Kategori:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {categoryRevenue.map((c) => (
                <div key={c.category} className="px-2.5 py-1 bg-slate-100 rounded-md font-mono text-[11px]">
                  <span className="text-slate-600 font-medium">{c.category}: </span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatRupiah(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
