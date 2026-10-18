import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, ScanBarcode, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { products, addToCart, cart } = usePOS();
  const [manualSku, setManualSku] = useState('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanSku = (skuToScan: string) => {
    const cleanSku = skuToScan.trim().toUpperCase();
    if (!cleanSku) return;

    const matched = products.find(
      (p) => p.sku.toUpperCase() === cleanSku || p.id.toUpperCase() === cleanSku
    );

    if (matched) {
      const success = addToCart(matched, 1);
      if (success) {
        setScanStatus(`Berhasil scan: ${matched.name}`);
        setManualSku('');
        setTimeout(() => setScanStatus(null), 2500);
      } else {
        setScanStatus(`Gagal: Stok "${matched.name}" habis!`);
      }
    } else {
      setScanStatus(`SKU / Barcode "${cleanSku}" tidak ditemukan!`);
      setTimeout(() => setScanStatus(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanSku(manualSku);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Scanner Barcode / SKU</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* Simulated Scanner Viewport */}
          <div className="relative rounded-lg bg-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden border border-slate-800">
            {/* Red Laser Scanning line */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />

            <ScanBarcode className="w-16 h-16 text-slate-600 mb-2" />
            <p className="text-xs text-slate-300 font-medium">Arahkan barcode scanner fisik atau ketik SKU</p>
            <p className="text-[11px] text-slate-500 mt-1">Mendukung input otomatis barcode scanner USB/Bluetooth</p>
          </div>

          {/* Status Message */}
          {scanStatus && (
            <div
              className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                scanStatus.startsWith('Berhasil')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {scanStatus.startsWith('Berhasil') ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="font-medium">{scanStatus}</span>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Input Manual Barcode / SKU:</label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Contoh: MKN-0001"
                value={manualSku}
                onChange={(e) => setManualSku(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Click-to-Scan Simulator */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">Simulasi Cepat (Klik untuk Scan):</p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {products.slice(0, 6).map((prod) => {
                const inCart = cart.find((c) => c.product.id === prod.id);
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleScanSku(prod.sku)}
                    disabled={prod.stock <= 0}
                    className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                      prod.stock <= 0
                        ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-slate-400">{prod.sku}</div>
                    <div className="font-medium text-slate-800 truncate">{prod.name}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                      <span className="tabular-nums">Stok: {prod.stock}</span>
                      {inCart && <span className="text-emerald-700 font-semibold font-mono">+{inCart.quantity}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
