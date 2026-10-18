import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockOpnameModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const { adjustStock } = usePOS();
  const [newStock, setNewStock] = useState<number>(product ? product.stock : 0);
  const [reason, setReason] = useState<string>('Koreksi Hitung Fisik');
  const [notes, setNotes] = useState('');

  if (!isOpen || !product) return null;

  const diff = newStock - product.stock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStock < 0) return;

    const fullReason = `${reason}${notes ? ` - ${notes}` : ''}`;
    adjustStock(product.id, newStock, fullReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Sesuaikan Stok (Stock Opname)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-xs text-slate-500 font-mono">{product.sku} · {product.category}</div>
            <div className="font-semibold text-slate-900 text-sm">{product.name}</div>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
              <span>Stok Tercatat di Sistem:</span>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {product.stock} {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Jumlah Stok Fisik Sebenarnya ({product.unit}) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Difference Indicator */}
          <div
            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
              diff === 0
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : diff > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>Selisih Stok:</span>
            <span className="font-mono font-bold tabular-nums">
              {diff > 0 ? `+${diff}` : diff} {product.unit}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Alasan Penyesuaian</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="Koreksi Hitung Fisik">Koreksi Hitung Fisik (Selisih Hitung)</option>
              <option value="Barang Rusak / Pecah">Barang Rusak / Pecah / Cacat</option>
              <option value="Kadaluarsa / Expired">Barang Kadaluarsa / Expired</option>
              <option value="Barang Hilang">Barang Hilang / Selisih Display</option>
              <option value="Retur ke Distributor">Retur ke Distributor</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Keterangan Tambahan</label>
            <input
              type="text"
              placeholder="Contoh: Ditemukan kemasan sobek di rak belakang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Simpan Penyesuaian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
