export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number; // HPP (Harga Pokok Penjualan)
  price: number; // Harga Jual
  stock: number;
  minStockAlert: number;
  unit: string; // Pcs, Porsi, Botol, Pack, Kg
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
  discount: number; // Diskon nominal per baris
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'DEBIT' | 'TRANSFER';

export interface TransactionItem {
  productId: string;
  barcode: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPrice: number;
  price: number;
  discount: number;
  subtotal: number;
  note?: string;
}

export interface Transaction {
  id: string; // e.g. INV-20261014-001
  timestamp: string; // ISO string
  cashierName: string;
  customerName?: string;
  orderType: 'Reguler' | 'Dine In' | 'Take Away';
  items: TransactionItem[];
  subtotal: number;
  discountTotal: number;
  taxPercent: number;
  taxTotal: number;
  grandTotal: number;
  totalCost: number; // Total HPP
  profit: number; // Laba kotor = grandTotal - taxTotal - totalCost
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  status: 'SELESAI' | 'BATAL';
  cancelReason?: string;
}

export interface HeldOrder {
  id: string;
  name: string;
  timestamp: string;
  items: CartItem[];
  customerName?: string;
  note?: string;
}

export interface CashMovement {
  id: string;
  type: 'MASUK' | 'KELUAR';
  amount: number;
  reason: string;
  timestamp: string;
  cashierName: string;
}

export interface CashShift {
  id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number; // Modal awal
  cashSalesTotal: number; // Total penjualan tunai
  otherSalesTotal: number; // QRIS/Debit/Transfer
  movements: CashMovement[]; // Kas masuk/keluar operasional
  expectedCash: number; // Modal awal + kasSales + masuk - keluar
  actualCash?: number;
  difference?: number;
  status: 'BUKA' | 'TUTUP';
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  footerNote: string;
  taxEnabled: boolean;
  taxPercent: number;
  activeCashier: string;
  qrisMerchantName: string;
  qrisNmid: string;
}

export type ActiveTab = 'pos' | 'inventory' | 'history' | 'reports' | 'shift';
