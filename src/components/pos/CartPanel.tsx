import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah } from '../../utils/formatters';
import { PaymentMethod } from '../../types/pos';
import {
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle,
  ShoppingBag,
  Percent,
} from 'lucide-react';

export const CartPanel: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    customerName,
    setCustomerName,
    cartDiscount,
    setCartDiscount,
    settings,
    updateSettings,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    processCheckout,
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const total = getCartTotal();

  // Kembalian calculation
  const effectivePaid = paymentMethod === 'TUNAI' ? tenderedAmount : total;
  const change = Math.max(0, effectivePaid - total);
  const isPaidEnough = effectivePaid >= total && total > 0;

  const handleApplyDiscount = () => {
    const val = parseFloat(discountValue) || 0;
    setCartDiscount(Math.max(0, Math.min(val, subtotal)));
    setShowDiscountInput(false);
  };

  const handleQuickTender = (amt: number) => {
    setTenderedAmount(amt);
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !isPaidEnough) return;
    setIsProcessing(true);
    setTimeout(() => {
      processCheckout(paymentMethod, effectivePaid);
      setIsProcessing(false);
      setTenderedAmount(0);
      setDiscountValue('0');
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-slate-900 text-sm">Pesanan Aktif</h2>
            <span className="text-xs text-slate-500 font-mono">({cart.reduce((a, b) => a + b.quantity, 0)} item)</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Customer Name Input */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-medium text-slate-500 shrink-0">Pelanggan:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Pelanggan Umum"
            className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[160px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700">Keranjang Masih Kosong</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              Pilih produk di katalog atau scan barcode untuk menambahkan barang.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const product = products.find((p) => p.id === item.product.id) || item.product;
            const remainingInStock = product.stock;

            return (
              <div
                key={item.product.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-col gap-2 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 font-mono">
                      <span>{item.product.sku}</span>
                      <span>·</span>
                      <span className="tabular-nums">{formatRupiah(item.product.sellPrice)}</span>
                      <span>·</span>
                      <span className={remainingInStock <= 3 ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                        Sisa {remainingInStock} {item.product.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200/60 transition-colors"
                    title="Hapus barang"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                  {/* Quantity adjustment buttons */}
                  <div className="flex items-center border border-slate-200 bg-white rounded-md overflow-hidden">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      title="Kurang satu"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-0.5 text-xs font-mono font-semibold tabular-nums text-slate-800 min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      disabled={item.quantity >= remainingInStock}
                      className={`px-2 py-1 transition-colors ${
                        item.quantity >= remainingInStock
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title="Tambah satu"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {formatRupiah(item.product.sellPrice * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout */}
      {cart.length > 0 && (
        <div className="border-t border-slate-200 p-4 bg-slate-50/70 space-y-3 shrink-0">
          {/* Subtotal & Adjustments */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums font-medium text-slate-800">{formatRupiah(subtotal)}</span>
            </div>

            {/* Discount Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span>Diskon</span>
                <button
                  onClick={() => setShowDiscountInput(!showDiscountInput)}
                  className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <Percent className="w-3 h-3" />
                  <span>{cartDiscount > 0 ? 'Ubah' : '+ Diskon'}</span>
                </button>
              </div>
              <span className="font-mono tabular-nums text-rose-600">
                {cartDiscount > 0 ? `- ${formatRupiah(cartDiscount)}` : 'Rp 0'}
              </span>
            </div>

            {showDiscountInput && (
              <div className="p-2 bg-white rounded-md border border-slate-200 flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-1.5 py-0.5 text-xs font-mono border-0 focus:outline-none"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="px-2 py-1 bg-slate-900 text-white text-[11px] rounded hover:bg-slate-800 shrink-0"
                >
                  Terapkan
                </button>
              </div>
            )}

            {/* Tax / PPN Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taxEnabled}
                  onChange={(e) => updateSettings({ taxEnabled: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <span>PPN ({settings.taxPercentage}%)</span>
              </label>
              <span className="font-mono tabular-nums text-slate-800">{formatRupiah(tax)}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm">
              <span className="font-bold text-slate-900">Total Tagihan</span>
              <span className="font-bold text-emerald-700 text-base font-mono tabular-nums">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-700 block">Metode Pembayaran:</span>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'TUNAI', label: 'Tunai', icon: <Banknote className="w-3.5 h-3.5" /> },
                  { id: 'QRIS', label: 'QRIS', icon: <QrCode className="w-3.5 h-3.5" /> },
                  { id: 'TRANSFER', label: 'Transfer', icon: <Building2 className="w-3.5 h-3.5" /> },
                  { id: 'DEBIT', label: 'Debit', icon: <CreditCard className="w-3.5 h-3.5" /> },
                ] as const
              )
                .filter((m) => settings.enabledPaymentMethods?.[m.id] ?? true)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id !== 'TUNAI') {
                        setTenderedAmount(total);
                      }
                    }}
                    className={`py-1.5 px-1 rounded-md text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-colors ${
                      paymentMethod === m.id
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Payment Method Specific Interface */}
          {paymentMethod === 'TUNAI' && (
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Uang Diterima:</span>
                <div className="flex items-center gap-1 w-36">
                  <span className="text-slate-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    step="1000"
                    value={tenderedAmount || ''}
                    onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 text-xs font-mono font-bold text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleQuickTender(total)}
                  className="px-2 py-1 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  Uang Pas
                </button>
                {[10000, 20000, 50000, 100000, 200000].map((amt) => {
                  if (amt < total && amt * 2 < total) return null;
                  return (
                    <button
                      key={amt}
                      onClick={() => handleQuickTender(amt)}
                      className="px-2 py-1 text-[10px] font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      {formatRupiah(amt).replace(',00', '')}
                    </button>
                  );
                })}
              </div>

              {/* Kembalian */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Kembalian:</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    effectivePaid < total ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {effectivePaid < total
                    ? `Kurang ${formatRupiah(total - effectivePaid)}`
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-900">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Scan QRIS Pembayaran</span>
              </div>
              {/* QR Code Graphic simulation */}
              <div className="mx-auto w-32 h-32 bg-slate-900 p-2 rounded-lg flex items-center justify-center shadow-xs">
                <div className="w-full h-full bg-white p-1 rounded flex flex-col items-center justify-center">
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 || i % 5 === 0 || i === 12) ? 'bg-slate-900' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold font-mono">
                {settings.qrisMerchantName || settings.storeName}
              </p>
              {settings.qrisNmid && (
                <p className="text-[10px] text-slate-400 font-mono">NMID: {settings.qrisNmid}</p>
              )}
              <p className="text-[11px] text-emerald-700 font-bold font-mono">
                Total: {formatRupiah(total)}
              </p>
            </div>
          )}

          {paymentMethod === 'TRANSFER' && (
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-800">Transfer Rekening Toko:</div>
              <div className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2 rounded space-y-1">
                {(settings.bankAccounts && settings.bankAccounts.length > 0
                  ? settings.bankAccounts
                  : [
                      { bankName: 'BCA', accountNumber: '8830-1234-5678', accountHolder: settings.storeName },
                    ]
                ).map((b, i) => (
                  <div key={i}>
                    {b.bankName}: <span className="font-bold">{b.accountNumber}</span> (a.n {b.accountHolder})
                  </div>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === 'DEBIT' && (
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-800">Mesin EDC Kartu Debit</div>
              <p className="text-[11px] text-slate-500">
                Gesek / Masukkan kartu pelanggan ke mesin EDC untuk memproses pembayaran Rp {formatRupiah(total)}.
              </p>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={!isPaidEnough || isProcessing}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
              isPaidEnough && !isProcessing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Menyimpan Transaksi...'
                : !isPaidEnough && paymentMethod === 'TUNAI'
                ? 'Nominal Belum Cukup'
                : `Bayar ${formatRupiah(total)}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
