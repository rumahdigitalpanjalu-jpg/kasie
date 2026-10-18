import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { formatRupiah } from '../../utils/formatters';
import { X, ArrowUpRight } from 'lucide-react';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RestockModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const { restockProduct } = usePOS();
  const [quantity, setQuantity] = useState<number>(10);
  const [supplierNote, setSupplierNote] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    restockProduct(product.id, quantity, supplierNote.trim() || 'Restock barang masuk');
    onClose();
  };

  const newProjectedStock = product.stock + quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Restock Barang Masuk</h3>
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
              <span>Stok Saat Ini:</span>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {product.stock} {product.unit}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
              <span>Harga Beli Modal:</span>
              <span className="font-mono tabular-nums text-slate-700">
                {formatRupiah(product.buyPrice)} / {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Jumlah Tambahan Stok Masuk ({product.unit}) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Projection */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">Stok Setelah Restock:</span>
            <span className="font-mono font-bold text-emerald-800 tabular-nums">
              {newProjectedStock} {product.unit}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Catatan / Nama Supplier (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pengiriman dari PT Sumber Makmur"
              value={supplierNote}
              onChange={(e) => setSupplierNote(e.target.value)}
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Konfirmasi Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
