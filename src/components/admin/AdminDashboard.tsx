import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { AdminSection, Product, CashierUser, BankAccount } from '../../types/pos';
import { formatRupiah, formatDateTime, generateSKU } from '../../utils/formatters';
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  CreditCard,
  Store,
  Database,
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  TrendingUp,
  Percent,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw,
  Building2,
  ShieldCheck,
  Save,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    updateProduct,
    deleteProduct,
    batchUpdatePrices,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    settings,
    updateSettings,
    adminSection,
    setAdminSection,
    isAdminUnlocked,
    setIsAdminUnlocked,
    verifyAdminPin,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaultData,
    transactions,
  } = usePOS();

  // Pin verification state
  const [pinInput, setPinInput] = useState('');

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Batch price modal state
  const [batchCategory, setBatchCategory] = useState<string>('ALL');
  const [batchType, setBatchType] = useState<'PERCENT' | 'NOMINAL'>('PERCENT');
  const [batchAmount, setBatchAmount] = useState<number>(5);
  const [batchTarget, setBatchTarget] = useState<'SELL' | 'BUY'>('SELL');
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

  // Staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'ADMIN' | 'KASIR'>('KASIR');
  const [newStaffPin, setNewStaffPin] = useState('1234');
  const [newStaffCanDiscount, setNewStaffCanDiscount] = useState(true);
  const [newStaffCanRefund, setNewStaffCanRefund] = useState(false);
  const [newStaffCanViewProfit, setNewStaffCanViewProfit] = useState(false);

  // Bank account state
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNum, setNewAccountNum] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');

  // Store profile form state
  const [storeForm, setStoreForm] = useState(settings);

  // Backup restore file state
  const [backupFileInput, setBackupFileInput] = useState<string>('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAdminPin(pinInput);
  };

  // If PIN check required and not yet unlocked
  if (settings.requirePinForAdmin && !isAdminUnlocked) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Pusat Kontrol Admin</h2>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan PIN Admin untuk mengakses pengaturan dan perubahan data sistem.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3">
            <input
              type="password"
              maxLength={6}
              placeholder="Masukkan PIN (Default: 1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-lg font-mono tracking-widest px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Masuk Dashboard Admin
            </button>
          </form>
          <p className="text-[11px] text-slate-400">PIN bawaan toko: 1234</p>
        </div>
      </div>
    );
  }

  const navSections: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Ringkasan & Aksi Cepat', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Produk & Penyesuaian Harga', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: 'Kelola Kategori', icon: <Tags className="w-4 h-4" /> },
    { id: 'staff', label: 'Kasir & Hak Akses', icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: 'Metode Pembayaran & Rekening', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'store', label: 'Profil Toko & Struk', icon: <Store className="w-4 h-4" /> },
    { id: 'backup', label: 'Cadangan & Pemulihan Data', icon: <Database className="w-4 h-4" /> },
  ];

  // Overview metrics
  const totalAssetValue = products.reduce((acc, p) => acc + p.stock * p.buyPrice, 0);
  const completedTrx = transactions.filter((t) => t.status === 'SELESAI');
  const totalRevenue = completedTrx.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Dashboard Admin</span>
              <span className="text-[10px] text-slate-400 font-mono">Pusat Perubahan Data</span>
            </div>
          </div>
          {settings.requirePinForAdmin && (
            <button
              onClick={() => setIsAdminUnlocked(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Kunci Akses Admin"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navSections.map((sec) => {
            const isActive = adminSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setAdminSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Cashier Quick Switcher in Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-[11px] font-semibold text-slate-700 block mb-1">Kasir Aktif:</span>
          <select
            value={settings.activeCashier}
            onChange={(e) => updateSettings({ activeCashier: e.target.value })}
            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            {staff.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
        {/* SECTION 1: OVERVIEW */}
        {adminSection === 'overview' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ringkasan Sistem & Perubahan Cepat</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat kendali toko untuk memantau performa, memperbarui harga, dan mengelola hak akses kasir.
              </p>
            </div>

            {/* Metric Strips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block">Total Produk Terdaftar</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{products.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">{categories.length} Kategori</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block">Nilai Inventaris (Modal)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{formatRupiah(totalAssetValue)}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Harga Beli Pokok</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block">Staf / Kasir Terdaftar</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{staff.length} orang</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{settings.activeCashier}</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 block">Total Omzet Penjualan</span>
                <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">{formatRupiah(totalRevenue)}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{completedTrx.length} Nota Selesai</span>
              </div>
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                onClick={() => setAdminSection('products')}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Ubah Harga & Produk</h3>
                <p className="text-xs text-slate-500">
                  Ubah harga jual, modal, stok minimum, atau lakukan penyesuaian harga masal sekaligus.
                </p>
              </div>

              <div
                onClick={() => setAdminSection('staff')}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Kelola Kasir & Hak Akses</h3>
                <p className="text-xs text-slate-500">
                  Atur staf kasir, batasi hak diskon, retur transaksi, dan akses melihat laporan profit.
                </p>
              </div>

              <div
                onClick={() => setAdminSection('payments')}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Metode Pembayaran & Rekening</h3>
                <p className="text-xs text-slate-500">
                  Aktifkan/nonaktifkan QRIS, Transfer Bank, atau EDC Debit, serta rekening tujuan transfer.
                </p>
              </div>

              <div
                onClick={() => setAdminSection('categories')}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Tags className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Kategori Barang</h3>
                <p className="text-xs text-slate-500">
                  Tambah kategori baru, ganti nama kategori, dan atur struktur katalog barang toko.
                </p>
              </div>

              <div
                onClick={() => setAdminSection('store')}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Identitas Toko & Struk</h3>
                <p className="text-xs text-slate-500">
                  Ganti nama toko, alamat, telepon, pesan ucapan di struk, dan persentase PPN.
                </p>
              </div>

              <div
                onClick={() => setAdminSection('backup')}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Cadangkan / Pulihkan Data</h3>
                <p className="text-xs text-slate-500">
                  Unduh cadangan data lengkap (JSON) untuk keamanan atau pulihkan data dari file cadangan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCTS & PRICING */}
        {adminSection === 'products' && (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Produk & Perubahan Harga</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah data barang, harga beli modal, harga jual, margin, dan lakukan penyesuaian harga masal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Penyesuaian Harga Masal</span>
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 font-mono">SKU</th>
                      <th className="py-2.5 px-3">Nama Produk</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Harga Modal</th>
                      <th className="py-2.5 px-3 text-right">Harga Jual</th>
                      <th className="py-2.5 px-3 text-right">Margin (Laba)</th>
                      <th className="py-2.5 px-3 text-center">Stok</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const margin = p.sellPrice - p.buyPrice;
                      const marginPercent = p.buyPrice > 0 ? ((margin / p.buyPrice) * 100).toFixed(1) : '0';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-600">{p.sku}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                            {formatRupiah(p.buyPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                            {formatRupiah(p.sellPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                            +{formatRupiah(margin)} ({marginPercent}%)
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                            {p.stock} {p.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Ubah Rincian Produk"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus produk "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: CATEGORIES */}
        {adminSection === 'categories' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kelola Kategori Barang</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur kategori untuk mempermudah pencarian dan pengelompokan barang saat transaksi kasir.
              </p>
            </div>

            {/* Add Category Form */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-800 block mb-2">Tambah Kategori Baru:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Kosmetik / Obat-obatan"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  onClick={() => {
                    if (addCategory(newCategoryName)) setNewCategoryName('');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kategori</span>
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 font-semibold text-xs text-slate-700">
                Daftar Kategori Aktif ({categories.length})
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  const isEditing = editingCategory?.oldName === cat;

                  return (
                    <div key={cat} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCategory.newName}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, newName: e.target.value })
                            }
                            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              updateCategory(editingCategory.oldName, editingCategory.newName);
                              setEditingCategory(null);
                            }}
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{cat}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({count} produk)</span>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Ganti Nama Kategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            disabled={count > 0}
                            className={`p-1.5 rounded transition-colors ${
                              count > 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-rose-500 hover:bg-rose-50'
                            }`}
                            title={count > 0 ? 'Pindahkan produk terlebih dahulu' : 'Hapus Kategori'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: STAFF & ACCESS */}
        {adminSection === 'staff' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kelola Kasir & Hak Akses</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftarkan akun kasir, atur PIN keamanan, dan sesuaikan izin operasional kasir.
                </p>
              </div>

              <button
                onClick={() => setShowAddStaffModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kasir Baru</span>
              </button>
            </div>

            {/* Staff list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map((s) => {
                const isActive = settings.activeCashier === s.name;

                return (
                  <div
                    key={s.id}
                    className={`p-4 bg-white border rounded-xl space-y-3 transition-all ${
                      isActive ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{s.name}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              s.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          PIN: ****{s.pin.slice(-2)}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Sedang Bertugas
                        </span>
                      ) : (
                        <button
                          onClick={() => updateSettings({ activeCashier: s.name })}
                          className="text-xs text-slate-600 hover:text-slate-900 hover:underline font-medium"
                        >
                          Pilih Kasir Ini
                        </button>
                      )}
                    </div>

                    {/* Permissions list */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      <label className="flex items-center justify-between text-slate-600">
                        <span>Izin Berikan Diskon Kasir</span>
                        <input
                          type="checkbox"
                          checked={s.canDiscount}
                          onChange={(e) => updateStaff(s.id, { canDiscount: e.target.checked })}
                          className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                        />
                      </label>
                      <label className="flex items-center justify-between text-slate-600">
                        <span>Izin Batalkan / Retur Transaksi</span>
                        <input
                          type="checkbox"
                          checked={s.canRefund}
                          onChange={(e) => updateStaff(s.id, { canRefund: e.target.checked })}
                          className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                        />
                      </label>
                      <label className="flex items-center justify-between text-slate-600">
                        <span>Izin Lihat Laba Bersih & HPP</span>
                        <input
                          type="checkbox"
                          checked={s.canViewProfit}
                          onChange={(e) => updateStaff(s.id, { canViewProfit: e.target.checked })}
                          className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                        />
                      </label>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      {staff.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus staf "${s.name}"?`)) {
                              deleteStaff(s.id);
                            }
                          }}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Hapus Staf
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 5: PAYMENTS & BANKS */}
        {adminSection === 'payments' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Metode Pembayaran & Rekening Toko</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasikan kanal pembayaran yang tersedia di kasir dan rekening bank toko.
              </p>
            </div>

            {/* Active Payment Channels */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Kanal Pembayaran yang Diaktifkan di Kasir:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(
                  [
                    { key: 'TUNAI', label: 'Uang Tunai (Cash)' },
                    { key: 'QRIS', label: 'QRIS (Semua E-Wallet / M-Banking)' },
                    { key: 'TRANSFER', label: 'Transfer Bank Manual' },
                    { key: 'DEBIT', label: 'Mesin EDC / Kartu Debit' },
                  ] as const
                ).map((m) => (
                  <label
                    key={m.key}
                    className="p-3 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-800">{m.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.enabledPaymentMethods?.[m.key] ?? true}
                      onChange={(e) =>
                        updateSettings({
                          enabledPaymentMethods: {
                            ...settings.enabledPaymentMethods,
                            [m.key]: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-slate-900 focus:ring-0 w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* QRIS Configuration */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Pengaturan QRIS Toko</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Merchant QRIS</label>
                  <input
                    type="text"
                    value={settings.qrisMerchantName || settings.storeName}
                    onChange={(e) => updateSettings({ qrisMerchantName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NMID (National Merchant ID)</label>
                  <input
                    type="text"
                    value={settings.qrisNmid || ''}
                    onChange={(e) => updateSettings({ qrisNmid: e.target.value })}
                    placeholder="ID1020034567890"
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Rekening Bank Toko</h3>
              </div>

              {/* Add Bank Form */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">Tambah Rekening Baru:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Bank (misal: BCA)"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={newAccountNum}
                    onChange={(e) => setNewAccountNum(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Atas Nama (Pemilik)"
                    value={newAccountHolder}
                    onChange={(e) => setNewAccountHolder(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!newBankName.trim() || !newAccountNum.trim()) return;
                      const newAccount: BankAccount = {
                        id: `bank-${Date.now()}`,
                        bankName: newBankName.trim(),
                        accountNumber: newAccountNum.trim(),
                        accountHolder: newAccountHolder.trim() || settings.storeName,
                        isActive: true,
                      };
                      updateSettings({
                        bankAccounts: [...(settings.bankAccounts || []), newAccount],
                      });
                      setNewBankName('');
                      setNewAccountNum('');
                      setNewAccountHolder('');
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                  >
                    Simpan Rekening
                  </button>
                </div>
              </div>

              {/* Existing Bank Accounts list */}
              <div className="space-y-2">
                {(settings.bankAccounts || []).map((b) => (
                  <div
                    key={b.id}
                    className="p-3 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{b.bankName}</div>
                      <div className="font-mono text-slate-600">
                        {b.accountNumber} · a.n {b.accountHolder}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = (settings.bankAccounts || []).filter((item) => item.id !== b.id);
                        updateSettings({ bankAccounts: updated });
                      }}
                      className="text-rose-600 hover:underline text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: STORE PROFILE */}
        {adminSection === 'store' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profil Toko & Format Struk</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbarui identitas usaha, kontak, pesan penutup nota belanja, dan pengaturan pajak.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSettings(storeForm);
              }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Toko / Usaha *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Slogan Toko</label>
                  <input
                    type="text"
                    value={storeForm.storeTagline}
                    onChange={(e) => setStoreForm({ ...storeForm, storeTagline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={storeForm.storeAddress}
                    onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={storeForm.storePhone}
                    onChange={(e) => setStoreForm({ ...storeForm, storePhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Kaki Struk (Receipt Footer)</label>
                <textarea
                  rows={2}
                  value={storeForm.receiptFooter}
                  onChange={(e) => setStoreForm({ ...storeForm, receiptFooter: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Tax & Security Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-2">
                  <span className="font-semibold text-slate-800 block">Pajak Pertambahan Nilai (PPN):</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeForm.taxEnabled}
                      onChange={(e) => setStoreForm({ ...storeForm, taxEnabled: e.target.checked })}
                      className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Otomatis kenakan PPN saat checkout</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Tarif PPN:</span>
                    <input
                      type="number"
                      value={storeForm.taxPercentage}
                      onChange={(e) =>
                        setStoreForm({ ...storeForm, taxPercentage: parseFloat(e.target.value) || 0 })
                      }
                      className="w-16 px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-800 block">Proteksi PIN Admin:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeForm.requirePinForAdmin}
                      onChange={(e) =>
                        setStoreForm({ ...storeForm, requirePinForAdmin: e.target.checked })
                      }
                      className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Wajibkan PIN sebelum membuka Dashboard Admin</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Ganti PIN Admin:</span>
                    <input
                      type="password"
                      maxLength={6}
                      value={storeForm.adminPin}
                      onChange={(e) => setStoreForm({ ...storeForm, adminPin: e.target.value })}
                      className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-center tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Toko</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 7: BACKUP & RESTORE */}
        {adminSection === 'backup' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cadangan & Pemulihan Data</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan seluruh data transaksi, inventaris barang, dan pengaturan toko ke file cadangan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backup Card */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Unduh Cadangan Lengkap</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ekspor seluruh katalog produk, riwayat transaksi kasir, log mutasi stok, data kasir, dan
                  pengaturan toko dalam satu file JSON terenkripsi data.
                </p>
                <button
                  onClick={() => {
                    const json = exportBackupJSON();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup-kasirpintar-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan (.JSON)</span>
                </button>
              </div>

              {/* Restore Card */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Pulihkan dari Cadangan</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih file JSON cadangan yang telah diunduh sebelumnya untuk memulihkan seluruh data toko Anda.
                </p>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string;
                        setBackupFileInput(content);
                      };
                      reader.readAsText(file);
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                  />

                  {backupFileInput && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'PERINGATAN: Memulihkan cadangan akan menimpa data toko saat ini dengan data dari file cadangan. Lanjutkan?'
                          )
                        ) {
                          importBackupJSON(backupFileInput);
                          setBackupFileInput('');
                        }
                      }}
                      className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Konfirmasi Pemulihan Data
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Factory Reset */}
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm">Reset ke Kondisi Awal (Factory Reset)</h3>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Menghapus semua perubahan dan mengembalikan sistem ke data sampel bawaan toko kelontong.
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Apakah Anda yakin ingin mereset seluruh data kembali ke setelan pabrik?'
                    )
                  ) {
                    resetToDefaultData();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Seluruh Data Toko</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Edit Data Produk</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProduct(editingProduct.id, editingProduct);
                setEditingProduct(null);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU / Barcode</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Modal / Beli (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.buyPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, buyPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.sellPrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sellPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stok Minimum Peringatan</label>
                  <input
                    type="number"
                    value={editingProduct.minStock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH PRICE MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Penyesuaian Harga Masal</h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                batchUpdatePrices(batchCategory, batchType, batchAmount, batchTarget);
                setShowBatchModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Kategori</label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Semua Produk ({products.length} barang)</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      Kategori: {c} ({products.filter((p) => p.category === c).length} barang)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Harga yang Disesuaikan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchTarget('SELL')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      batchTarget === 'SELL' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Harga Jual
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchTarget('BUY')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      batchTarget === 'BUY' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Harga Modal / Beli
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bentuk Perubahan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchType('PERCENT')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      batchType === 'PERCENT' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Persentase (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchType('NOMINAL')}
                    className={`py-2 rounded-lg border text-center font-medium ${
                      batchType === 'NOMINAL' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Nominal Tetap (Rp)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nilai Penyesuaian (Gunakan nilai negatif untuk diskon/penurunan harga)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={batchType === 'PERCENT' ? '0.5' : '500'}
                    value={batchAmount}
                    onChange={(e) => setBatchAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 font-mono border border-slate-300 rounded-lg text-sm font-bold"
                  />
                  <span className="font-bold text-slate-700">{batchType === 'PERCENT' ? '%' : 'Rupiah'}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Contoh: Ketik <strong>5</strong> untuk menaikkan 5%, atau <strong>-5</strong> untuk menurunkan 5%.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Terapkan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Tambah Kasir / Staf Baru</h3>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStaffName.trim()) return;
                addStaff({
                  name: newStaffName.trim(),
                  role: newStaffRole,
                  pin: newStaffPin || '1234',
                  canDiscount: newStaffCanDiscount,
                  canRefund: newStaffCanRefund,
                  canViewProfit: newStaffCanViewProfit,
                  active: true,
                });
                setShowAddStaffModal(false);
                setNewStaffName('');
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kasir / Staf *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama (Kasir 3)"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Peran / Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as 'ADMIN' | 'KASIR')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="KASIR">Kasir</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PIN Kasir (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value)}
                    className="w-full px-3 py-2 font-mono text-center tracking-widest border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-800 block">Hak Akses:</span>
                <label className="flex items-center justify-between text-slate-600">
                  <span>Boleh Berikan Diskon</span>
                  <input
                    type="checkbox"
                    checked={newStaffCanDiscount}
                    onChange={(e) => setNewStaffCanDiscount(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-600">
                  <span>Boleh Batalkan Transaksi / Retur</span>
                  <input
                    type="checkbox"
                    checked={newStaffCanRefund}
                    onChange={(e) => setNewStaffCanRefund(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-600">
                  <span>Boleh Lihat Laporan Profit & HPP</span>
                  <input
                    type="checkbox"
                    checked={newStaffCanViewProfit}
                    onChange={(e) => setNewStaffCanViewProfit(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Daftarkan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
