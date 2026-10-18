import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatDateTime } from '../../utils/formatters';
import { MovementType } from '../../types/pos';
import { X, History, ArrowDownRight, ArrowUpRight, RefreshCw, PlusCircle, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filterProductId?: string;
}

export const StockMovementsModal: React.FC<Props> = ({ isOpen, onClose, filterProductId }) => {
  const { movements, products } = usePOS();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredMovements = movements.filter((m) => {
    if (filterProductId && m.productId !== filterProductId) return false;
    if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
    return true;
  });

  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case 'PENJUALAN':
        return <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />;
      case 'RESTOCK':
        return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />;
      case 'BATAL_TRANSAKSI':
        return <RotateCcw className="w-3.5 h-3.5 text-blue-600" />;
      case 'TAMBAH_BARU':
        return <PlusCircle className="w-3.5 h-3.5 text-purple-600" />;
      case 'PENYESUAIAN':
      default:
        return <RefreshCw className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'PENJUALAN':
        return <span className="text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Penjualan</span>;
      case 'RESTOCK':
        return <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Restock</span>;
      case 'BATAL_TRANSAKSI':
        return <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Retur Transaksi</span>;
      case 'TAMBAH_BARU':
        return <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Barang Baru</span>;
      case 'PENYESUAIAN':
      default:
        return <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Opname</span>;
    }
  };

  const filteredProductName = filterProductId
    ? products.find((p) => p.id === filterProductId)?.name
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Log Mutasi & Riwayat Keluar Masuk Stok
              </h3>
              {filteredProductName && (
                <p className="text-[11px] text-slate-500 font-medium">Produk: {filteredProductName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Mutasi
            </button>
            <button
              onClick={() => setTypeFilter('PENJUALAN')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === 'PENJUALAN'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Penjualan
            </button>
            <button
              onClick={() => setTypeFilter('RESTOCK')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === 'RESTOCK'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Restock
            </button>
            <button
              onClick={() => setTypeFilter('PENYESUAIAN')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === 'PENYESUAIAN'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Opname
            </button>
            <button
              onClick={() => setTypeFilter('BATAL_TRANSAKSI')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                typeFilter === 'BATAL_TRANSAKSI'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Retur
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums shrink-0">
            {filteredMovements.length} log
          </span>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {filteredMovements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada catatan mutasi stok untuk filter ini.
            </div>
          ) : (
            filteredMovements.map((mov) => {
              const isPositive = mov.quantityChange > 0;
              return (
                <div key={mov.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getMovementIcon(mov.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{mov.productName}</span>
                        {getMovementBadge(mov.type)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                        <span>{mov.sku}</span>
                        <span>·</span>
                        <span>Ref: {mov.reference}</span>
                        <span>·</span>
                        <span>{formatDateTime(mov.timestamp)}</span>
                      </div>
                      {mov.notes && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">{mov.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Quantity change & Stock result */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {mov.previousStock} → <span className="font-semibold text-slate-700">{mov.newStock}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
