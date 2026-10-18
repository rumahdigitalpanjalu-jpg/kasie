import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { CartPanel } from './CartPanel';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { formatRupiah } from '../../utils/formatters';
import { Product } from '../../types/pos';
import {
  Search,
  ScanBarcode,
  Plus,
  AlertTriangle,
  PackageX,
  Filter,
} from 'lucide-react';

export const POSView: React.FC = () => {
  const { products, cart, addToCart } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['Semua', ...Array.from(set)];
  }, [products]);

  // Filter products by category, search query, and low stock
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat = selectedCategory === 'Semua' || prod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q);
      const matchLowStock = !showLowStockOnly || prod.stock <= prod.minStock;

      return matchCat && matchSearch && matchLowStock;
    });
  }, [products, selectedCategory, searchQuery, showLowStockOnly]);

  const handleProductClick = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* Left Column: Catalog & Controls */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Search & Category Filter Header */}
        <div className="p-4 bg-white border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama barang atau ketik SKU / Barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Barcode Scanner Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shrink-0"
              title="Buka Scanner Barcode"
            >
              <ScanBarcode className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          {/* Category Chips & Filter toggles */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Low stock filter toggle */}
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg whitespace-nowrap border shrink-0 transition-colors ${
                showLowStockOnly
                  ? 'bg-amber-500 text-white border-amber-600 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Stok Menipis</span>
            </button>
          </div>
        </div>

        {/* Product Grid Viewport */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <PackageX className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada produk ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau kategori.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                const inCartItem = cart.find((c) => c.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleProductClick(product)}
                    className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left select-none ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200/90 hover:border-slate-400 hover:shadow-xs cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Top Row: Category & In-Cart Badge */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-mono">
                        <span className="truncate">{product.category}</span>
                        {inCartItem && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] tabular-nums">
                            {inCartItem.quantity} di keranjang
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-xs md:text-sm text-slate-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      {/* SKU */}
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{product.sku}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      {/* Price */}
                      <div>
                        <span className="text-xs md:text-sm font-bold text-slate-900 font-mono tabular-nums">
                          {formatRupiah(product.sellPrice)}
                        </span>
                      </div>

                      {/* Stock Indicator */}
                      <div className="flex items-center gap-1">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 tabular-nums">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {product.stock} {product.unit}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                            {product.stock} {product.unit}
                          </span>
                        )}

                        {!isOutOfStock && (
                          <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors ml-1">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart Panel */}
      <div className="w-full lg:w-96 xl:w-[420px] h-full shrink-0 shadow-lg lg:shadow-none">
        <CartPanel />
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};
