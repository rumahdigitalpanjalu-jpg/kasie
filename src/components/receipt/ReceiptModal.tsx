import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { X, Printer, Copy, Check, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { selectedReceipt, setSelectedReceipt, settings } = usePOS();
  const [copied, setCopied] = useState(false);

  if (!selectedReceipt) return null;

  const trx = selectedReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTextReceipt = () => {
    const textReceipt = `
================================
${settings.storeName.toUpperCase()}
${settings.storeAddress}
Telp: ${settings.storePhone}
================================
No. Transaksi : ${trx.invoiceNumber}
Waktu         : ${formatDateTime(trx.timestamp)}
Kasir         : ${trx.cashierName}
Pelanggan     : ${trx.customerName}
--------------------------------
${trx.items
  .map(
    (item) =>
      `${item.productName}\n  ${item.quantity} x ${formatRupiah(item.sellPrice)} = ${formatRupiah(item.subtotal)}`
  )
  .join('\n')}
--------------------------------
Subtotal   : ${formatRupiah(trx.subtotal)}
Diskon     : ${formatRupiah(trx.discount)}
PPN (${settings.taxPercentage}%): ${formatRupiah(trx.tax)}
TOTAL      : ${formatRupiah(trx.total)}
Bayar (${trx.paymentMethod}): ${formatRupiah(trx.amountPaid)}
Kembalian  : ${formatRupiah(trx.change)}
================================
${settings.receiptFooter}
================================
`;
    navigator.clipboard.writeText(textReceipt.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Struk Pembayaran</span>
          </div>
          <button
            onClick={() => setSelectedReceipt(null)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Paper */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
          <div
            id="printable-receipt"
            className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-xs font-mono text-xs text-slate-800 space-y-3 leading-relaxed"
          >
            {/* Store Header */}
            <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-slate-300">
              <h2 className="font-bold text-sm text-slate-900 tracking-tight">{settings.storeName}</h2>
              <p className="text-[10px] text-slate-500">{settings.storeTagline}</p>
              <p className="text-[10px] text-slate-500">{settings.storeAddress}</p>
              <p className="text-[10px] text-slate-500">Telp: {settings.storePhone}</p>
            </div>

            {/* Meta */}
            <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold">{trx.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTime(trx.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span className="truncate max-w-[150px]">{trx.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span>{trx.customerName}</span>
              </div>
              {trx.status === 'DIBATALKAN' && (
                <div className="mt-1 p-1 bg-rose-50 text-rose-700 font-bold text-center border border-rose-200 rounded">
                  TRANSAKSI INI TELAH DIBATALKAN
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-300 text-[11px]">
              {trx.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-medium text-slate-900">{item.productName}</div>
                  <div className="flex justify-between text-slate-600">
                    <span className="tabular-nums">
                      {item.quantity} x {formatRupiah(item.sellPrice)}
                    </span>
                    <span className="font-semibold tabular-nums">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Payment */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="tabular-nums">{formatRupiah(trx.subtotal)}</span>
              </div>
              {trx.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span className="tabular-nums">- {formatRupiah(trx.discount)}</span>
                </div>
              )}
              {trx.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({settings.taxPercentage}%):</span>
                  <span className="tabular-nums">{formatRupiah(trx.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 text-xs pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="tabular-nums">{formatRupiah(trx.total)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-600">Bayar ({trx.paymentMethod}):</span>
                <span className="tabular-nums font-semibold">{formatRupiah(trx.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kembalian:</span>
                <span className="tabular-nums font-semibold text-emerald-700">{formatRupiah(trx.change)}</span>
              </div>
            </div>

            {/* Footer message */}
            <div className="text-center space-y-1 pt-1">
              <p className="text-[10px] text-slate-500">{settings.receiptFooter}</p>
              {/* Fake barcode bars */}
              <div className="pt-2 flex justify-center items-center gap-0.5">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3].map((w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w * 1.5}px` }}
                    className="h-6 bg-slate-800"
                  />
                ))}
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest">{trx.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleCopyTextReceipt}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
