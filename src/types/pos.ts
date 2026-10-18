export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  buyPrice: number;   // Harga Beli / Modal
  sellPrice: number;  // Harga Jual
  stock: number;      // Stok saat ini (real-time)
  minStock: number;   // Ambang batas stok menipis
  unit: string;       // pcs, bks, botol, pack, kg, dll.
  color?: string;     // Color badge for visual differentiation
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;   // Diskon per item (nominal)
  notes?: string;
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'TRANSFER' | 'DEBIT';

export interface TransactionItem {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  cashierName: string;
  customerName: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: 'SELESAI' | 'DIBATALKAN';
  cancellationReason?: string;
  cancelledAt?: string;
}

export type MovementType = 'PENJUALAN' | 'RESTOCK' | 'PENYESUAIAN' | 'BATAL_TRANSAKSI' | 'TAMBAH_BARU';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantityChange: number; // e.g. -2 for sale, +10 for restock
  previousStock: number;
  newStock: number;
  timestamp: string;
  reference: string;      // e.g. Invoice #, Restock batch, Opname note
  notes?: string;
}

export interface CashierUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'KASIR';
  pin: string;
  canDiscount: boolean;
  canRefund: boolean;
  canViewProfit: boolean;
  active: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storePhone: string;
  receiptFooter: string;
  taxPercentage: number;  // e.g. 0 or 11
  taxEnabled: boolean;
  enableSound: boolean;
  activeCashier: string;
  adminPin: string;
  requirePinForAdmin: boolean;
  enabledPaymentMethods: {
    TUNAI: boolean;
    QRIS: boolean;
    TRANSFER: boolean;
    DEBIT: boolean;
  };
  qrisMerchantName: string;
  qrisNmid: string;
  bankAccounts: BankAccount[];
  categories: string[];
}

export type ActiveTab = 'pos' | 'inventory' | 'transactions' | 'reports' | 'admin' | 'settings';

export type AdminSection =
  | 'overview'
  | 'products'
  | 'categories'
  | 'staff'
  | 'payments'
  | 'store'
  | 'backup';
