import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Transaction, PaymentMethod } from '../../types/pos';
import { formatRupiah, formatDateTime, downloadCSV } from '../../utils/formatters';
import {
  ReceiptText,
  Search,
  Printer,
  RotateCcw,
  Download,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  X,
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { transactions, cancelTransaction, setSelectedReceipt } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SELESAI' | 'DIBATALKAN'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Selected Transaction for details modal
  const [inspectTrx, setInspectTrx] = useState<Transaction | null>(null);

  // Cancellation modal state
  const [trxToCancel, setTrxToCancel] = useState<Transaction | null>(null);
  const [cancelReason, setCancelReason] = useState('Pelanggan membatalkan pesanan');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (methodFilter !== 'ALL' && t.paymentMethod !== methodFilter) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchInv = t.invoiceNumber.toLowerCase().includes(q);
      const matchCust = t.customerName.toLowerCase().includes(q);
      const matchItem = t.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));

      return matchInv || matchCust || matchItem;
    });
  }, [transactions, statusFilter, methodFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'No. Nota',
      'Waktu Transaksi',
      'Kasir',
      'Pelanggan',
      'Jumlah Item',
      'Subtotal',
      'Diskon',
      'PPN',
      'Total',
      'Metode Bayar',
      'Uang Diterima',
      'Kembalian',
      'Status',
      'Alasan Pembatalan',
    ];

    const rows = transactions.map((t) => [
      t.invoiceNumber,
      formatDateTime(t.timestamp),
      t.cashierName,
      t.customerName,
      t.items.reduce((sum, i) => sum + i.quantity, 0),
      t.subtotal,
      t.discount,
      t.tax,
      t.total,
      t.paymentMethod,
      t.amountPaid,
      t.change,
      t.status,
      t.cancellationReason || '',
    ]);

    downloadCSV(`Laporan-Transaksi-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxToCancel) return;

    cancelTransaction(trxToCancel.id, cancelReason);
    setTrxToCancel(null);
    setCancelReason('Pelanggan membatalkan pesanan');
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'TUNAI':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'QRIS':
        return <QrCode className="w-3.5 h-3.5" />;
      case 'TRANSFER':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'DEBIT':
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari no nota, pelanggan, atau nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'SELESAI' | 'DIBATALKAN')}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="SELESAI">Selesai</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-slate-700"
            >
              <option value="ALL">Semua Metode</option>
              <option value="TUNAI">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="TRANSFER">Transfer</option>
              <option value="DEBIT">Kartu Debit</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Transaksi</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono">No. Nota</th>
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Pelanggan</th>
                <th className="py-2.5 px-4">Rincian Item</th>
                <th className="py-2.5 px-4 text-center">Metode</th>
                <th className="py-2.5 px-4 text-right">Total Transaksi</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itemCount = trx.items.reduce((sum, i) => sum + i.quantity, 0);
                  const isCancelled = trx.status === 'DIBATALKAN';

                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCancelled ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {trx.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(trx.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {trx.customerName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                        <span className="font-semibold text-slate-800">{itemCount} item</span> (
                        {trx.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                        )
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {getMethodIcon(trx.paymentMethod)}
                          <span>{trx.paymentMethod}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 text-sm">
                        {formatRupiah(trx.total)}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        {isCancelled ? (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Dibatalkan</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Selesai</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectTrx(trx)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Rincian Transaksi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedReceipt(trx)}
                            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Lihat / Cetak Struk"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => setTrxToCancel(trx)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Batalkan Transaksi & Kembalikan Stok"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Transaction Detail Modal */}
      {inspectTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-slate-700" />
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Rincian Transaksi</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{inspectTrx.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectTrx(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Waktu:</span>
                  <span className="font-medium text-slate-800">{formatDateTime(inspectTrx.timestamp)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kasir:</span>
                  <span className="font-medium text-slate-800">{inspectTrx.cashierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pelanggan:</span>
                  <span className="font-medium text-slate-800">{inspectTrx.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span
                    className={`font-bold ${
                      inspectTrx.status === 'DIBATALKAN' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {inspectTrx.status}
                  </span>
                </div>
              </div>

              {inspectTrx.status === 'DIBATALKAN' && inspectTrx.cancellationReason && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  <span className="font-semibold">Alasan Pembatalan:</span> {inspectTrx.cancellationReason}
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Item yang Dibeli:</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                  {inspectTrx.items.map((i, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{i.productName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {i.sku} · {i.quantity} x {formatRupiah(i.sellPrice)}
                        </div>
                      </div>
                      <div className="font-mono font-bold tabular-nums text-slate-900">
                        {formatRupiah(i.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="space-y-1 text-xs border-t border-slate-200 pt-3 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatRupiah(inspectTrx.subtotal)}</span>
                </div>
                {inspectTrx.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon</span>
                    <span className="tabular-nums">- {formatRupiah(inspectTrx.discount)}</span>
                  </div>
                )}
                {inspectTrx.tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>PPN</span>
                    <span className="tabular-nums">{formatRupiah(inspectTrx.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL TAGIHAN</span>
                  <span className="tabular-nums text-emerald-700">{formatRupiah(inspectTrx.total)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Metode Pembayaran</span>
                  <span>{inspectTrx.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Nominal Diterima</span>
                  <span className="tabular-nums">{formatRupiah(inspectTrx.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Kembalian</span>
                  <span className="tabular-nums text-emerald-700">{formatRupiah(inspectTrx.change)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedReceipt(inspectTrx);
                  setInspectTrx(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel / Refund Confirmation Modal */}
      {trxToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-rose-50 text-rose-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-semibold text-sm">Batalkan Transaksi & Retur Stok</h3>
              </div>
              <button
                onClick={() => setTrxToCancel(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Anda akan membatalkan transaksi{' '}
                <strong className="font-mono text-slate-900">{trxToCancel.invoiceNumber}</strong> senilai{' '}
                <strong className="font-mono text-slate-900">{formatRupiah(trxToCancel.total)}</strong>.
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <span className="font-bold block">Integrasi Stok Otomatis:</span>
                <p>
                  Sistem akan secara otomatis <strong>mengembalikan kuantitas semua item</strong> dalam transaksi
                  ini kembali ke stok inventaris secara real-time.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alasan Pembatalan *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="Pelanggan membatalkan pesanan">Pelanggan membatalkan pesanan</option>
                  <option value="Salah input item atau nominal">Salah input item atau nominal kasir</option>
                  <option value="Barang rusak / dikembalikan pelanggan">Barang rusak / retur pelanggan</option>
                  <option value="Pembayaran gagal / kartu ditolak">Pembayaran gagal / kartu ditolak</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrxToCancel(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Batalkan & Kembalikan Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
