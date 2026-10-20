import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Transaction,
  HeldOrder,
  CashShift,
  StoreSettings,
  PaymentMethod,
  ActiveTab,
  CashMovement,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_SHIFT,
} from '../data/initialData';
import { generateInvoiceNumber, playAudioFeedback } from '../utils/formatters';

interface POSContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number, reason?: string) => void;

  // Cart
  cart: CartItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  orderType: 'Reguler' | 'Dine In' | 'Take Away';
  setOrderType: (type: 'Reguler' | 'Dine In' | 'Take Away') => void;
  orderDiscount: number;
  setOrderDiscount: (discount: number) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNote: (productId: string, note: string) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Cart calculations
  cartSubtotal: number;
  cartDiscountTotal: number;
  cartTaxTotal: number;
  cartGrandTotal: number;
  cartTotalItems: number;

  // Held Orders
  heldOrders: HeldOrder[];
  holdCurrentOrder: (customName?: string) => void;
  recallHeldOrder: (heldId: string) => void;
  deleteHeldOrder: (heldId: string) => void;

  // Transactions
  transactions: Transaction[];
  processPayment: (method: PaymentMethod, amountPaid: number) => Transaction | null;
  cancelTransaction: (id: string, reason: string) => void;
  activeReceiptTransaction: Transaction | null;
  setActiveReceiptTransaction: (trx: Transaction | null) => void;

  // Shift & Cash
  currentShift: CashShift | null;
  shiftHistory: CashShift[];
  openShift: (startingCash: number, cashierName: string) => void;
  addCashMovement: (type: 'MASUK' | 'KELUAR', amount: number, reason: string) => void;
  closeShift: (actualCash: number, notes?: string) => void;

  // Backup & Restore
  resetToDefaults: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'kasir_pos_settings_v1',
  PRODUCTS: 'kasir_pos_products_v1',
  TRANSACTIONS: 'kasir_pos_transactions_v1',
  CURRENT_SHIFT: 'kasir_pos_current_shift_v1',
  SHIFT_HISTORY: 'kasir_pos_shift_history_v1',
  HELD_ORDERS: 'kasir_pos_held_orders_v1',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  // Load Initial State from LocalStorage or Fallback
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [currentShift, setCurrentShift] = useState<CashShift | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    return saved ? JSON.parse(saved) : INITIAL_SHIFT;
  });

  const [shiftHistory, setShiftHistory] = useState<CashShift[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIFT_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  // Cart Local States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [orderType, setOrderType] = useState<'Reguler' | 'Dine In' | 'Take Away'>('Reguler');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(currentShift));
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFT_HISTORY, JSON.stringify(shiftHistory));
  }, [shiftHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Product Actions
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `PRD-${Date.now().toString().slice(-4)}`;
    const created: Product = { ...newProd, id };
    setProducts((prev) => [created, ...prev]);
    playAudioFeedback('success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    playAudioFeedback('beep');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    playAudioFeedback('delete');
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemDiscountsTotal = cart.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  const cartDiscountTotal = itemDiscountsTotal + orderDiscount;
  const taxableBase = Math.max(0, cartSubtotal - cartDiscountTotal);
  const cartTaxTotal = settings.taxEnabled ? Math.round((taxableBase * settings.taxPercent) / 100) : 0;
  const cartGrandTotal = taxableBase + cartTaxTotal;
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Actions
  const addToCart = (product: Product, quantity: number = 1) => {
    // Check stock
    const existingIndex = cart.findIndex((i) => i.product.id === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + quantity > product.stock) {
      playAudioFeedback('warning');
      alert(`Stok produk "${product.name}" tersisa ${product.stock} ${product.unit}. Tidak dapat menambah lebih.`);
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, discount: 0, note: '' }];
    });
    playAudioFeedback('beep');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > targetProduct.stock) {
      playAudioFeedback('warning');
      alert(`Stok tidak mencukupi. Tersedia hanya ${targetProduct.stock} ${targetProduct.unit}`);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const updateItemNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, note } : item))
    );
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    playAudioFeedback('delete');
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setOrderDiscount(0);
    setOrderType('Reguler');
  };

  // Held Orders Actions
  const holdCurrentOrder = (customName?: string) => {
    if (cart.length === 0) return;
    const newHold: HeldOrder = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      name: customName || customerName || `Pesanan #${heldOrders.length + 1}`,
      timestamp: new Date().toISOString(),
      items: [...cart],
      customerName,
      note: `Disimpan ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    playAudioFeedback('success');
  };

  const recallHeldOrder = (heldId: string) => {
    const target = heldOrders.find((h) => h.id === heldId);
    if (!target) return;
    setCart(target.items);
    setCustomerName(target.customerName || '');
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
    playAudioFeedback('beep');
  };

  const deleteHeldOrder = (heldId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
    playAudioFeedback('delete');
  };

  // Checkout Payment
  const processPayment = (paymentMethod: PaymentMethod, amountPaid: number): Transaction | null => {
    if (cart.length === 0) return null;
    if (amountPaid < cartGrandTotal) {
      playAudioFeedback('warning');
      alert('Jumlah pembayaran kurang dari total tagihan.');
      return null;
    }

    // Deduct stock for all items
    const updatedProducts = products.map((prod) => {
      const cartMatch = cart.find((c) => c.product.id === prod.id);
      if (cartMatch) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartMatch.quantity),
        };
      }
      return prod;
    });
    setProducts(updatedProducts);

    // Compute cost & profit
    const transactionItems = cart.map((c) => {
      const lineSubtotal = (c.product.price - (c.discount || 0)) * c.quantity;
      return {
        productId: c.product.id,
        barcode: c.product.barcode,
        name: c.product.name,
        category: c.product.category,
        quantity: c.quantity,
        unit: c.product.unit,
        costPrice: c.product.costPrice,
        price: c.product.price,
        discount: c.discount || 0,
        subtotal: lineSubtotal,
        note: c.note,
      };
    });

    const totalCost = cart.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
    const profit = Math.max(0, cartGrandTotal - cartTaxTotal - totalCost);
    const changeAmount = amountPaid - cartGrandTotal;

    const newTransaction: Transaction = {
      id: generateInvoiceNumber(),
      timestamp: new Date().toISOString(),
      cashierName: settings.activeCashier,
      customerName: customerName.trim() || undefined,
      orderType,
      items: transactionItems,
      subtotal: cartSubtotal,
      discountTotal: cartDiscountTotal,
      taxPercent: settings.taxEnabled ? settings.taxPercent : 0,
      taxTotal: cartTaxTotal,
      grandTotal: cartGrandTotal,
      totalCost,
      profit,
      paymentMethod,
      amountPaid,
      changeAmount,
      status: 'SELESAI',
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    // Update active cash shift
    if (currentShift && currentShift.status === 'BUKA') {
      const isCash = paymentMethod === 'TUNAI';
      setCurrentShift((prevShift) => {
        if (!prevShift) return null;
        const addCashSales = isCash ? cartGrandTotal : 0;
        const addOtherSales = !isCash ? cartGrandTotal : 0;
        const newCashSalesTotal = prevShift.cashSalesTotal + addCashSales;
        const newOtherSalesTotal = prevShift.otherSalesTotal + addOtherSales;
        const movementsNet = prevShift.movements.reduce(
          (sum, m) => sum + (m.type === 'MASUK' ? m.amount : -m.amount),
          0
        );
        const newExpected = prevShift.startingCash + newCashSalesTotal + movementsNet;
        return {
          ...prevShift,
          cashSalesTotal: newCashSalesTotal,
          otherSalesTotal: newOtherSalesTotal,
          expectedCash: newExpected,
        };
      });
    }

    playAudioFeedback('success');
    setActiveReceiptTransaction(newTransaction);
    clearCart();
    return newTransaction;
  };

  const cancelTransaction = (id: string, reason: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target || target.status === 'BATAL') return;

    // Restore stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = target.items.find((i) => i.productId === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      })
    );

    // Update transaction status
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'BATAL', cancelReason: reason } : t))
    );

    // If it was Tunai and shift is open, update shift
    if (target.paymentMethod === 'TUNAI' && currentShift && currentShift.status === 'BUKA') {
      setCurrentShift((prev) => {
        if (!prev) return null;
        const updatedCashSales = Math.max(0, prev.cashSalesTotal - target.grandTotal);
        return {
          ...prev,
          cashSalesTotal: updatedCashSales,
          expectedCash: prev.expectedCash - target.grandTotal,
        };
      });
    }

    playAudioFeedback('warning');
  };

  // Shift & Cash Movements
  const openShift = (startingCash: number, cashierName: string) => {
    const newShift: CashShift = {
      id: `SHIFT-${Date.now().toString().slice(-6)}`,
      cashierName,
      openedAt: new Date().toISOString(),
      startingCash,
      cashSalesTotal: 0,
      otherSalesTotal: 0,
      movements: [],
      expectedCash: startingCash,
      status: 'BUKA',
    };
    setCurrentShift(newShift);
    playAudioFeedback('success');
  };

  const addCashMovement = (type: 'MASUK' | 'KELUAR', amount: number, reason: string) => {
    if (!currentShift || currentShift.status !== 'BUKA') return;
    const movement: CashMovement = {
      id: `MOV-${Date.now().toString().slice(-5)}`,
      type,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      cashierName: settings.activeCashier,
    };

    setCurrentShift((prev) => {
      if (!prev) return null;
      const updatedMovements = [...prev.movements, movement];
      const delta = type === 'MASUK' ? amount : -amount;
      return {
        ...prev,
        movements: updatedMovements,
        expectedCash: prev.expectedCash + delta,
      };
    });
    playAudioFeedback('beep');
  };

  const closeShift = (actualCash: number, notes?: string) => {
    if (!currentShift) return;
    const difference = actualCash - currentShift.expectedCash;
    const finalizedShift: CashShift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      actualCash,
      difference,
      notes,
      status: 'TUTUP',
    };

    setShiftHistory((prev) => [finalizedShift, ...prev]);
    setCurrentShift(null);
    playAudioFeedback('success');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    playAudioFeedback('beep');
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentShift(INITIAL_SHIFT);
    setShiftHistory([]);
    setHeldOrders([]);
    clearCart();
    playAudioFeedback('beep');
  };

  // Export / Import
  const exportDatabaseJSON = (): string => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      products,
      transactions,
      currentShift,
      shiftHistory,
      heldOrders,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings && data.products) {
        setSettings(data.settings);
        setProducts(data.products);
        if (data.transactions) setTransactions(data.transactions);
        if (data.currentShift) setCurrentShift(data.currentShift);
        if (data.shiftHistory) setShiftHistory(data.shiftHistory);
        if (data.heldOrders) setHeldOrders(data.heldOrders);
        clearCart();
        playAudioFeedback('success');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        customerName,
        setCustomerName,
        orderType,
        setOrderType,
        orderDiscount,
        setOrderDiscount,
        addToCart,
        updateQuantity,
        updateItemNote,
        updateItemDiscount,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscountTotal,
        cartTaxTotal,
        cartGrandTotal,
        cartTotalItems,
        heldOrders,
        holdCurrentOrder,
        recallHeldOrder,
        deleteHeldOrder,
        transactions,
        processPayment,
        cancelTransaction,
        activeReceiptTransaction,
        setActiveReceiptTransaction,
        currentShift,
        shiftHistory,
        openShift,
        addCashMovement,
        closeShift,
        resetToDefaults,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
