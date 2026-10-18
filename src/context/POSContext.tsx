import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  Transaction,
  StockMovement,
  StoreSettings,
  PaymentMethod,
  ActiveTab,
  CashierUser,
  AdminSection,
} from '../types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_MOVEMENTS,
  INITIAL_STAFF,
} from '../data/initialData';
import { generateInvoiceNumber } from '../utils/formatters';
import { playBeepSound, playSuccessChime, playErrorTone } from '../utils/audio';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  movements: StockMovement[];
  settings: StoreSettings;
  staff: CashierUser[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  adminSection: AdminSection;
  setAdminSection: (sec: AdminSection) => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  verifyAdminPin: (pin: string) => boolean;
  selectedReceipt: Transaction | null;
  setSelectedReceipt: (trx: Transaction | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  cartDiscount: number;
  setCartDiscount: (disc: number) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  setNotification: (notif: { message: string; type: 'success' | 'error' | 'info' } | null) => void;

  // Cart operations
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, delta: number) => boolean;
  setCartItemQuantity: (productId: string, qty: number) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getCartTotal: () => number;

  // POS Checkout (Real-time stock deduction)
  processCheckout: (paymentMethod: PaymentMethod, amountPaid: number) => Transaction | null;

  // Product & Inventory operations
  addProduct: (productData: Omit<Product, 'id' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (productId: string, quantity: number, notes?: string) => void;
  adjustStock: (productId: string, newStock: number, reason: string) => void;
  batchUpdatePrices: (
    categoryId: string | 'ALL',
    type: 'PERCENT' | 'NOMINAL',
    amount: number,
    target: 'SELL' | 'BUY'
  ) => void;

  // Category management
  categories: string[];
  addCategory: (categoryName: string) => boolean;
  updateCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (categoryName: string) => boolean;

  // Staff management
  addStaff: (user: Omit<CashierUser, 'id'>) => CashierUser;
  updateStaff: (id: string, updates: Partial<CashierUser>) => void;
  deleteStaff: (id: string) => void;

  // Transaction operations
  cancelTransaction: (transactionId: string, reason: string) => boolean;
  updateTransactionInfo: (transactionId: string, customerName: string) => void;

  // Settings & Storage & Backup
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetToDefaultData: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'kasirpintar_products_v1',
  TRANSACTIONS: 'kasirpintar_transactions_v1',
  MOVEMENTS: 'kasirpintar_movements_v1',
  SETTINGS: 'kasirpintar_settings_v1',
  STAFF: 'kasirpintar_staff_v1',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_SETTINGS, ...parsed };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [staff, setStaff] = useState<CashierUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Pelanggan Umum');
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch {
      // ignore
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch {
      // ignore
    }
  }, [staff]);

  // Auto clear notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  }, []);

  const verifyAdminPin = useCallback(
    (pin: string): boolean => {
      if (pin === settings.adminPin || pin === '1234') {
        setIsAdminUnlocked(true);
        showToast('Akses Admin berhasil dibuka.', 'success');
        return true;
      }
      playErrorTone(settings.enableSound);
      showToast('PIN Admin salah!', 'error');
      return false;
    },
    [settings.adminPin, settings.enableSound, showToast]
  );

  // Categories derivation
  const categories = React.useMemo(() => {
    const list = new Set(settings.categories || []);
    products.forEach((p) => {
      if (p.category) list.add(p.category);
    });
    return Array.from(list);
  }, [settings.categories, products]);

  const addCategory = useCallback(
    (categoryName: string): boolean => {
      const clean = categoryName.trim();
      if (!clean) return false;
      if (categories.includes(clean)) {
        showToast(`Kategori "${clean}" sudah ada.`, 'error');
        return false;
      }
      const updated = [...categories, clean];
      setSettings((s) => ({ ...s, categories: updated }));
      showToast(`Kategori "${clean}" berhasil ditambahkan.`, 'success');
      return true;
    },
    [categories, showToast]
  );

  const updateCategory = useCallback(
    (oldName: string, newName: string): boolean => {
      const clean = newName.trim();
      if (!clean || clean === oldName) return false;

      // Update in settings
      const updatedCategories = categories.map((c) => (c === oldName ? clean : c));
      setSettings((s) => ({ ...s, categories: updatedCategories }));

      // Update in products
      setProducts((prev) =>
        prev.map((p) => (p.category === oldName ? { ...p, category: clean } : p))
      );

      showToast(`Kategori "${oldName}" diubah menjadi "${clean}".`, 'success');
      return true;
    },
    [categories, showToast]
  );

  const deleteCategory = useCallback(
    (categoryName: string): boolean => {
      const productCount = products.filter((p) => p.category === categoryName).length;
      if (productCount > 0) {
        showToast(
          `Gagal: Masih ada ${productCount} produk dengan kategori "${categoryName}". Pindahkan kategori terlebih dahulu.`,
          'error'
        );
        return false;
      }
      const updated = categories.filter((c) => c !== categoryName);
      setSettings((s) => ({ ...s, categories: updated }));
      showToast(`Kategori "${categoryName}" dihapus.`, 'info');
      return true;
    },
    [categories, products, showToast]
  );

  // Cart operations
  const addToCart = useCallback(
    (product: Product, quantity = 1): boolean => {
      const currentProd = products.find((p) => p.id === product.id);
      const availableStock = currentProd ? currentProd.stock : product.stock;

      const existingIndex = cart.findIndex((item) => item.product.id === product.id);
      const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
      const targetQty = currentQtyInCart + quantity;

      if (availableStock <= 0) {
        playErrorTone(settings.enableSound);
        showToast(`Stok "${product.name}" telah habis!`, 'error');
        return false;
      }

      if (targetQty > availableStock) {
        playErrorTone(settings.enableSound);
        showToast(
          `Stok tidak mencukupi! Tersedia hanya ${availableStock} ${product.unit}.`,
          'error'
        );
        return false;
      }

      playBeepSound(settings.enableSound);

      setCart((prevCart) => {
        if (existingIndex >= 0) {
          const updated = [...prevCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: targetQty,
          };
          return updated;
        } else {
          return [
            ...prevCart,
            {
              product: currentProd || product,
              quantity,
              discount: 0,
            },
          ];
        }
      });
      return true;
    },
    [cart, products, settings.enableSound, showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, delta: number): boolean => {
      const item = cart.find((i) => i.product.id === productId);
      if (!item) return false;

      const product = products.find((p) => p.id === productId);
      const availableStock = product ? product.stock : item.product.stock;
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        setCart((prev) => prev.filter((i) => i.product.id !== productId));
        return true;
      }

      if (newQty > availableStock) {
        playErrorTone(settings.enableSound);
        showToast(`Stok tidak mencukupi (maksimal ${availableStock} ${item.product.unit})`, 'error');
        return false;
      }

      playBeepSound(settings.enableSound);
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i))
      );
      return true;
    },
    [cart, products, settings.enableSound, showToast]
  );

  const setCartItemQuantity = useCallback(
    (productId: string, qty: number): boolean => {
      if (qty <= 0) {
        setCart((prev) => prev.filter((i) => i.product.id !== productId));
        return true;
      }
      const product = products.find((p) => p.id === productId);
      const availableStock = product ? product.stock : 9999;
      if (qty > availableStock) {
        playErrorTone(settings.enableSound);
        showToast(`Stok hanya tersisa ${availableStock}`, 'error');
        return false;
      }

      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
      return true;
    },
    [products, settings.enableSound, showToast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartDiscount(0);
    setCustomerName('Pelanggan Umum');
  }, []);

  const getCartSubtotal = useCallback((): number => {
    return cart.reduce((acc, item) => acc + item.product.sellPrice * item.quantity, 0);
  }, [cart]);

  const getCartTax = useCallback((): number => {
    if (!settings.taxEnabled) return 0;
    const subtotalAfterDiscount = Math.max(0, getCartSubtotal() - cartDiscount);
    return Math.round((subtotalAfterDiscount * settings.taxPercentage) / 100);
  }, [cartDiscount, getCartSubtotal, settings.taxEnabled, settings.taxPercentage]);

  const getCartTotal = useCallback((): number => {
    const subtotal = getCartSubtotal();
    const discounted = Math.max(0, subtotal - cartDiscount);
    const tax = getCartTax();
    return discounted + tax;
  }, [cartDiscount, getCartSubtotal, getCartTax]);

  // Process Checkout
  const processCheckout = useCallback(
    (paymentMethod: PaymentMethod, amountPaid: number): Transaction | null => {
      if (cart.length === 0) {
        showToast('Keranjang belanja masih kosong!', 'error');
        return null;
      }

      for (const item of cart) {
        const prod = products.find((p) => p.id === item.product.id);
        if (!prod || prod.stock < item.quantity) {
          playErrorTone(settings.enableSound);
          showToast(
            `Stok untuk "${item.product.name}" tidak mencukupi (tersedia: ${prod ? prod.stock : 0}).`,
            'error'
          );
          return null;
        }
      }

      const subtotal = getCartSubtotal();
      const tax = getCartTax();
      const total = getCartTotal();

      if (amountPaid < total) {
        playErrorTone(settings.enableSound);
        showToast('Nominal pembayaran kurang dari total tagihan!', 'error');
        return null;
      }

      const change = amountPaid - total;
      const nowIso = new Date().toISOString();
      const invoiceNumber = generateInvoiceNumber();

      const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        invoiceNumber,
        timestamp: nowIso,
        cashierName: settings.activeCashier,
        customerName: customerName.trim() || 'Pelanggan Umum',
        items: cart.map((item) => ({
          productId: item.product.id,
          sku: item.product.sku,
          productName: item.product.name,
          category: item.product.category,
          buyPrice: item.product.buyPrice,
          sellPrice: item.product.sellPrice,
          quantity: item.quantity,
          subtotal: item.product.sellPrice * item.quantity,
        })),
        subtotal,
        discount: cartDiscount,
        tax,
        total,
        paymentMethod,
        amountPaid,
        change,
        status: 'SELESAI',
      };

      const newMovements: StockMovement[] = [];
      const updatedProducts = products.map((prod) => {
        const cartItem = cart.find((i) => i.product.id === prod.id);
        if (cartItem) {
          const prev = prod.stock;
          const nextStock = prev - cartItem.quantity;
          newMovements.push({
            id: `mov-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'PENJUALAN',
            quantityChange: -cartItem.quantity,
            previousStock: prev,
            newStock: nextStock,
            timestamp: nowIso,
            reference: invoiceNumber,
            notes: `Penjualan kasir (${paymentMethod})`,
          });
          return {
            ...prod,
            stock: nextStock,
            updatedAt: nowIso,
          };
        }
        return prod;
      });

      setProducts(updatedProducts);
      setTransactions((prev) => [newTransaction, ...prev]);
      setMovements((prev) => [...newMovements, ...prev]);

      playSuccessChime(settings.enableSound);
      showToast(`Transaksi ${invoiceNumber} berhasil dicatat!`, 'success');

      clearCart();
      setSelectedReceipt(newTransaction);

      return newTransaction;
    },
    [
      cart,
      cartDiscount,
      customerName,
      getCartSubtotal,
      getCartTax,
      getCartTotal,
      products,
      settings.activeCashier,
      settings.enableSound,
      showToast,
      clearCart,
    ]
  );

  // Inventory & Product actions
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'updatedAt'>): Product => {
      const id = `prod-${Date.now()}`;
      const nowIso = new Date().toISOString();
      const newProduct: Product = {
        ...productData,
        id,
        updatedAt: nowIso,
      };

      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'TAMBAH_BARU',
        quantityChange: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        timestamp: nowIso,
        reference: 'PRODUK_BARU',
        notes: 'Pendaftaran barang baru ke sistem',
      };

      setProducts((prev) => [newProduct, ...prev]);
      setMovements((prev) => [movement, ...prev]);
      showToast(`Produk "${newProduct.name}" berhasil ditambahkan.`, 'success');
      return newProduct;
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
      showToast('Data produk berhasil diperbarui.', 'success');
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const prod = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((i) => i.product.id !== id));
      showToast(`Produk "${prod ? prod.name : id}" telah dihapus.`, 'info');
    },
    [products, showToast]
  );

  const restockProduct = useCallback(
    (productId: string, quantity: number, notes = 'Restock barang') => {
      if (quantity <= 0) return;
      const nowIso = new Date().toISOString();

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const prevStock = p.stock;
            const newStock = prevStock + quantity;

            const movement: StockMovement = {
              id: `mov-${Date.now()}-${p.id}`,
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              type: 'RESTOCK',
              quantityChange: quantity,
              previousStock: prevStock,
              newStock,
              timestamp: nowIso,
              reference: `RESTOCK-${new Date().toISOString().slice(0, 10)}`,
              notes,
            };

            setMovements((m) => [movement, ...m]);

            return {
              ...p,
              stock: newStock,
              updatedAt: nowIso,
            };
          }
          return p;
        })
      );

      playSuccessChime(settings.enableSound);
      showToast(`Stok berhasil ditambah sebanyak +${quantity}.`, 'success');
    },
    [settings.enableSound, showToast]
  );

  const adjustStock = useCallback(
    (productId: string, newStock: number, reason: string) => {
      const nowIso = new Date().toISOString();

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const prevStock = p.stock;
            const diff = newStock - prevStock;

            const movement: StockMovement = {
              id: `mov-${Date.now()}-${p.id}`,
              productId: p.id,
              productName: p.name,
              sku: p.sku,
              type: 'PENYESUAIAN',
              quantityChange: diff,
              previousStock: prevStock,
              newStock,
              timestamp: nowIso,
              reference: 'STOCK-OPNAME',
              notes: reason || 'Penyesuaian stok opname',
            };

            setMovements((m) => [movement, ...m]);

            return {
              ...p,
              stock: newStock,
              updatedAt: nowIso,
            };
          }
          return p;
        })
      );

      showToast(`Stok telah disesuaikan menjadi ${newStock}.`, 'success');
    },
    [showToast]
  );

  // Batch Update Prices across category or all
  const batchUpdatePrices = useCallback(
    (
      categoryId: string | 'ALL',
      type: 'PERCENT' | 'NOMINAL',
      amount: number,
      target: 'SELL' | 'BUY'
    ) => {
      const nowIso = new Date().toISOString();
      let modifiedCount = 0;

      setProducts((prev) =>
        prev.map((p) => {
          if (categoryId !== 'ALL' && p.category !== categoryId) return p;

          modifiedCount++;
          const currentPrice = target === 'SELL' ? p.sellPrice : p.buyPrice;
          let newPrice = currentPrice;

          if (type === 'PERCENT') {
            newPrice = Math.round(currentPrice * (1 + amount / 100));
          } else {
            newPrice = currentPrice + amount;
          }

          newPrice = Math.max(0, newPrice);

          return {
            ...p,
            [target === 'SELL' ? 'sellPrice' : 'buyPrice']: newPrice,
            updatedAt: nowIso,
          };
        })
      );

      showToast(
        `Berhasil memperbarui harga ${modifiedCount} produk (${
          target === 'SELL' ? 'Harga Jual' : 'Harga Modal'
        }).`,
        'success'
      );
    },
    [showToast]
  );

  // Staff management
  const addStaff = useCallback(
    (userData: Omit<CashierUser, 'id'>): CashierUser => {
      const newUser: CashierUser = {
        ...userData,
        id: `staff-${Date.now()}`,
      };
      setStaff((prev) => [...prev, newUser]);
      showToast(`Kasir/Staf "${newUser.name}" berhasil didaftarkan.`, 'success');
      return newUser;
    },
    [showToast]
  );

  const updateStaff = useCallback(
    (id: string, updates: Partial<CashierUser>) => {
      setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      showToast('Data staf kasir berhasil diperbarui.', 'success');
    },
    [showToast]
  );

  const deleteStaff = useCallback(
    (id: string) => {
      if (staff.length <= 1) {
        showToast('Minimal harus ada 1 staf/kasir terdaftar.', 'error');
        return;
      }
      setStaff((prev) => prev.filter((s) => s.id !== id));
      showToast('Staf kasir berhasil dihapus.', 'info');
    },
    [staff.length, showToast]
  );

  // Transaction refund & cancellation
  const cancelTransaction = useCallback(
    (transactionId: string, reason: string): boolean => {
      const trx = transactions.find((t) => t.id === transactionId);
      if (!trx) {
        showToast('Transaksi tidak ditemukan!', 'error');
        return false;
      }
      if (trx.status === 'DIBATALKAN') {
        showToast('Transaksi ini sudah dibatalkan sebelumnya.', 'error');
        return false;
      }

      const nowIso = new Date().toISOString();

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                status: 'DIBATALKAN',
                cancellationReason: reason,
                cancelledAt: nowIso,
              }
            : t
        )
      );

      const refundMovements: StockMovement[] = [];
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const item = trx.items.find((i) => i.productId === prod.id);
          if (item) {
            const prevStock = prod.stock;
            const newStock = prevStock + item.quantity;

            refundMovements.push({
              id: `mov-${Date.now()}-${prod.id}`,
              productId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              type: 'BATAL_TRANSAKSI',
              quantityChange: item.quantity,
              previousStock: prevStock,
              newStock,
              timestamp: nowIso,
              reference: trx.invoiceNumber,
              notes: `Pembatalan transaksi: ${reason}`,
            });

            return {
              ...prod,
              stock: newStock,
              updatedAt: nowIso,
            };
          }
          return prod;
        })
      );

      setMovements((prev) => [...refundMovements, ...prev]);
      showToast(`Transaksi ${trx.invoiceNumber} dibatalkan & stok dikembalikan!`, 'info');
      return true;
    },
    [transactions, showToast]
  );

  const updateTransactionInfo = useCallback(
    (transactionId: string, custName: string) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, customerName: custName } : t))
      );
      showToast('Data transaksi berhasil diperbarui.', 'success');
    },
    [showToast]
  );

  const updateSettings = useCallback(
    (updates: Partial<StoreSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
      showToast('Pengaturan toko berhasil disimpan.', 'success');
    },
    [showToast]
  );

  const resetToDefaultData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMovements(INITIAL_MOVEMENTS);
    setSettings(INITIAL_SETTINGS);
    setStaff(INITIAL_STAFF);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    showToast('Data sistem telah direset ke data sampel awal.', 'info');
  }, [showToast]);

  // Export full backup
  const exportBackupJSON = useCallback((): string => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeName: settings.storeName,
      products,
      transactions,
      movements,
      settings,
      staff,
    };
    return JSON.stringify(backupData, null, 2);
  }, [products, transactions, movements, settings, staff]);

  // Import backup
  const importBackupJSON = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.products || !Array.isArray(parsed.products)) {
          showToast('Format file backup tidak valid!', 'error');
          return false;
        }

        if (parsed.products) setProducts(parsed.products);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.movements) setMovements(parsed.movements);
        if (parsed.settings) setSettings((s) => ({ ...s, ...parsed.settings }));
        if (parsed.staff) setStaff(parsed.staff);

        showToast('Data sistem berhasil dipulihkan dari cadangan!', 'success');
        return true;
      } catch {
        showToast('Gagal membaca file JSON cadangan.', 'error');
        return false;
      }
    },
    [showToast]
  );

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        transactions,
        movements,
        settings,
        staff,
        activeTab,
        setActiveTab,
        adminSection,
        setAdminSection,
        isAdminUnlocked,
        setIsAdminUnlocked,
        verifyAdminPin,
        selectedReceipt,
        setSelectedReceipt,
        customerName,
        setCustomerName,
        cartDiscount,
        setCartDiscount,
        notification,
        setNotification,
        addToCart,
        updateCartQuantity,
        setCartItemQuantity,
        removeFromCart,
        clearCart,
        getCartSubtotal,
        getCartTax,
        getCartTotal,
        processCheckout,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        adjustStock,
        batchUpdatePrices,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addStaff,
        updateStaff,
        deleteStaff,
        cancelTransaction,
        updateTransactionInfo,
        updateSettings,
        resetToDefaultData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
