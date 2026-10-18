import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { formatRupiah, downloadCSV } from '../../utils/formatters';
import { AddProductModal } from './AddProductModal';
import { RestockModal } from './RestockModal';
import { StockOpnameModal } from './StockOpnameModal';
import { StockMovementsModal } from './StockMovementsModal';
import {
  Package,
  Plus,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Download,
  AlertTriangle,
  Trash2,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, deleteProduct } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'SAFE' | 'LOW' | 'OUT'>('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [selectedProductForOpname, setSelectedProductForOpname] = useState<Product | null>(null);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [filterProductIdForMovements, setFilterProductIdForMovements] = useState<string | undefined>(undefined);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      const q = searchQuery.toLowerCase().trim();
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;

      if (stockStatusFilter === 'SAFE' && p.stock <= p.minStock) return false;
      if (stockStatusFilter === 'LOW' && (p.stock > p.minStock || p.stock === 0)) return false;
      if (stockStatusFilter === 'OUT' && p.stock > 0) return false;

      return true;
    });
  }, [products, categoryFilter, searchQuery, stockStatusFilter]);

  // Aggregate Metrics
  const totalItemsCount = products.length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalAssetValue = products.reduce((acc, p) => acc + p.stock * p.buyPrice, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Nama Barang',
      'Kategori',
      'Harga Beli (Modal)',
      'Harga Jual',
      'Margin (Rp)',
      'Stok Saat Ini',
      'Stok Minimum',
      'Satuan',
      'Status',
    ];
    const rows = products.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.buyPrice,
      p.sellPrice,
      p.sellPrice - p.buyPrice,
      p.stock,
      p.minStock,
      p.unit,
      p.stock === 0 ? 'Habis' : p.stock <= p.minStock ? 'Menipis' : 'Aman',
    ]);
    downloadCSV(`Laporan-Stok-Barang-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const handleDeleteWithConfirm = (product: Product) => {
    if (window.confirm(`Hapus produk "${product.name}" (${product.sku}) dari sistem?`)) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Jenis Produk</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{totalItemsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{totalUnitsInStock} unit fisik tercatat</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Nilai Aset Stok</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{formatRupiah(totalAssetValue)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Berdasarkan harga modal</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Stok Menipis</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono tabular-nums">{lowStockCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Perlu segera di-restock</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Stok Habis (0)</span>
            <PackageCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 font-mono tabular-nums">{outOfStockCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tidak bisa dijual di kasir</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search & Category */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari SKU atau nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-slate-700"
            >
              <option value="ALL">Semua Kategori</option>
              {categories
                .filter((c) => c !== 'ALL')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as 'ALL' | 'SAFE' | 'LOW' | 'OUT')}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-slate-700"
            >
              <option value="ALL">Semua Status Stok</option>
              <option value="SAFE">Stok Aman</option>
              <option value="LOW">Stok Menipis (≤ Min)</option>
              <option value="OUT">Habis (0)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setFilterProductIdForMovements(undefined);
                setIsMovementsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Log Mutasi</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono">SKU</th>
                <th className="py-2.5 px-4">Nama Produk</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4 text-right">Harga Beli</th>
                <th className="py-2.5 px-4 text-right">Harga Jual</th>
                <th className="py-2.5 px-4 text-right">Margin / Unit</th>
                <th className="py-2.5 px-4 text-center">Stok Saat Ini</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const margin = product.sellPrice - product.buyPrice;
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {product.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {product.category}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                        {formatRupiah(product.buyPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {formatRupiah(product.sellPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700">
                        +{formatRupiah(margin)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`font-mono font-bold tabular-nums text-sm ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {product.stock}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">{product.unit}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Menipis (min {product.minStock})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProductForRestock(product)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Restock / Tambah Stok"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedProductForOpname(product)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Sesuaikan Stok (Stock Opname)"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setFilterProductIdForMovements(product.id);
                              setIsMovementsOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Lihat Log Mutasi Produk"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWithConfirm(product)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modals */}
      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <RestockModal
        product={selectedProductForRestock}
        isOpen={Boolean(selectedProductForRestock)}
        onClose={() => setSelectedProductForRestock(null)}
      />

      <StockOpnameModal
        product={selectedProductForOpname}
        isOpen={Boolean(selectedProductForOpname)}
        onClose={() => setSelectedProductForOpname(null)}
      />

      <StockMovementsModal
        isOpen={isMovementsOpen}
        onClose={() => setIsMovementsOpen(false)}
        filterProductId={filterProductIdForMovements}
      />
    </div>
  );
};
