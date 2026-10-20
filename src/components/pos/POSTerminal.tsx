import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Clock,
  ArrowRight,
  RotateCcw,
  Tag,
  MessageSquare,
  AlertTriangle,
  FolderOpen,
  X,
  CreditCard,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

export const POSTerminal: React.FC = () => {
  const {
    products,
    cart,
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
    customerName,
    setCustomerName,
    orderType,
    setOrderType,
    orderDiscount,
    setOrderDiscount,
    heldOrders,
    holdCurrentOrder,
    recallHeldOrder,
    deleteHeldOrder,
    activeReceiptTransaction,
    setActiveReceiptTransaction,
    settings,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [activeDiscountItemId, setActiveDiscountItemId] = useState<string | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = ['Semua', ...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat = selectedCategory === 'Semua' || prod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.barcode.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Barcode enter key handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check exact barcode match first
    const exactBarcode = products.find((p) => p.barcode === q);
    if (exactBarcode) {
      addToCart(exactBarcode, 1);
      setSearchQuery('');
      return;
    }

    // Check if only 1 item matches query
    if (filteredProducts.length === 1) {
      addToCart(filteredProducts[0], 1);
      setSearchQuery('');
      return;
    }
  };

  // Global hotkeys (F2 for search focus, F4 or Space for pay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setIsPaymentOpen(true);
      } else if (e.key === 'F7' && cart.length > 0) {
        e.preventDefault();
        holdCurrentOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, holdCurrentOrder]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden bg-slate-100">
      {/* LEFT COLUMN: Catalog & Products Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-5">
        {/* Search & Barcode Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk atau scan barcode... (F2)"
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                ↵ Enter
              </span>
            </div>
          </form>

          {/* Quick Scanner Demo Simulator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Pick a random product to simulate laser scanner beep
                if (products.length > 0) {
                  const randomProd = products[Math.floor(Math.random() * products.length)];
                  addToCart(randomProd, 1);
                }
              }}
              title="Simulasikan pembacaan scanner barcode fisik"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Barcode className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Simulasi Scan</span>
            </button>

            {heldOrders.length > 0 && (
              <button
                onClick={() => setIsHeldModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Antrean ({heldOrders.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FolderOpen className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Produk tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Coba kata kunci lain atau ubah kategori pilihan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStockAlert;

                return (
                  <button
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod, 1)}
                    disabled={isOutOfStock}
                    className={`flex flex-col text-left bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-emerald-500 hover:shadow-md transition-all group ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    {/* Thumbnail Image Slot with Resilient Fallback */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 text-slate-400">
                          <Tag className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] font-medium text-slate-500">{prod.category}</span>
                        </div>
                      )}

                      {/* Stock Badge Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded backdrop-blur-xs text-[10px] ${
                            isOutOfStock
                              ? 'bg-rose-600/90 text-white'
                              : isLowStock
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-black/60 text-white'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `Stok: ${prod.stock} ${prod.unit}`}
                        </span>
                        <span className="bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                          {prod.barcode}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {prod.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-emerald-700 font-mono tabular-nums">
                          {formatRupiah(prod.price)}
                        </span>
                        <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart & Checkout Panel */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
        {/* Cart Top Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Pesanan Aktif</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {cartTotalItems} item
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Customer & Order Type Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nama Pembeli / Meja
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Pelanggan (Opsional)"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tipe Pesanan
              </label>
              <select
                value={orderType}
                onChange={(e) =>
                  setOrderType(e.target.value as 'Reguler' | 'Dine In' | 'Take Away')
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
              >
                <option value="Reguler">Reguler</option>
                <option value="Dine In">Dine In (Makan di Tempat)</option>
                <option value="Take Away">Take Away (Bungkus)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Keranjang Masih Kosong</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Klik produk di sebelah kiri atau scan barcode untuk menambahkan barang.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const lineTotal = (item.product.price - (item.discount || 0)) * item.quantity;
              const isNoteActive = activeNoteItemId === item.product.id;
              const isDiscountActive = activeDiscountItemId === item.product.id;

              return (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-mono text-emerald-700 font-semibold">
                          {formatRupiah(item.product.price)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-rose-600 font-mono text-[10px]">
                            (-{formatRupiah(item.discount)})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity & Subtotal Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                      {formatRupiah(lineTotal)}
                    </span>
                  </div>

                  {/* Quick Note & Discount Buttons */}
                  <div className="flex items-center gap-2 text-[11px] pt-1">
                    <button
                      onClick={() => setActiveNoteItemId(isNoteActive ? null : item.product.id)}
                      className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        item.note ? 'text-amber-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{item.note ? 'Edit Catatan' : '+ Catatan'}</span>
                    </button>

                    <span className="text-slate-300">·</span>

                    <button
                      onClick={() => setActiveDiscountItemId(isDiscountActive ? null : item.product.id)}
                      className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        item.discount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{item.discount > 0 ? 'Edit Potongan' : '+ Diskon'}</span>
                    </button>
                  </div>

                  {/* Note Input Row */}
                  {isNoteActive && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => updateItemNote(item.product.id, e.target.value)}
                        placeholder="Contoh: Pedas, sedikit gula, es terpisah"
                        className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-amber-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Discount Input Row */}
                  {isDiscountActive && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">Diskon (Rp):</span>
                      <input
                        type="number"
                        value={item.discount || ''}
                        onChange={(e) =>
                          updateItemDiscount(item.product.id, Number(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="flex-1 px-2.5 py-1 text-xs font-mono bg-slate-50 border border-rose-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Financial Breakdown & Pay Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5">
          <div className="space-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal Produk</span>
              <span className="font-mono text-slate-900">{formatRupiah(cartSubtotal)}</span>
            </div>

            {cartDiscountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Total Diskon</span>
                <span className="font-mono">-{formatRupiah(cartDiscountTotal)}</span>
              </div>
            )}

            {settings.taxEnabled && (
              <div className="flex justify-between">
                <span>PPN ({settings.taxPercent}%)</span>
                <span className="font-mono text-slate-900">{formatRupiah(cartTaxTotal)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900">Total Akhir</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                {formatRupiah(cartGrandTotal)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => holdCurrentOrder()}
              disabled={cart.length === 0}
              title="Simpan sementara tagihan ini (F7)"
              className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                cart.length === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Simpan (F7)</span>
            </button>

            <button
              onClick={() => setIsDiscountModalOpen(true)}
              disabled={cart.length === 0}
              className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                cart.length === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Diskon Global</span>
            </button>

            <button
              onClick={() => setIsPaymentOpen(true)}
              disabled={cart.length === 0}
              className={`col-span-1 py-2 px-3 rounded-lg font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                cart.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              <span>Bayar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Order Discount Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Diskon Global Pesanan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tambahkan potongan harga langsung untuk total transaksi ini.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Diskon (Rp)
                </label>
                <input
                  type="number"
                  value={orderDiscount || ''}
                  onChange={(e) => setOrderDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                {[5000, 10000, 20000].map((disc) => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setOrderDiscount(disc)}
                    className="flex-1 py-1.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    Rp {disc.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Orders Modal (Recall Saved Orders) */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Daftar Antrean Tersimpan</h3>
                <p className="text-xs text-slate-500">Pilih tagihan yang ingin dilanjutkan</p>
              </div>
              <button
                onClick={() => setIsHeldModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[360px] overflow-y-auto space-y-2.5">
              {heldOrders.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">Tidak ada pesanan tertahan.</p>
              ) : (
                heldOrders.map((h) => {
                  const itemsCount = h.items.reduce((s, i) => s + i.quantity, 0);
                  const total = h.items.reduce(
                    (s, i) => s + (i.product.price - (i.discount || 0)) * i.quantity,
                    0
                  );

                  return (
                    <div
                      key={h.id}
                      className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white hover:border-slate-300"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{h.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {itemsCount} item · {h.note}
                        </p>
                        <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
                          {formatRupiah(total)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => deleteHeldOrder(h.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            recallHeldOrder(h.id);
                            setIsHeldModalOpen(false);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                        >
                          Buka
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal */}
      {isPaymentOpen && <PaymentModal onClose={() => setIsPaymentOpen(false)} />}

      {/* Thermal Receipt Preview Modal */}
      {activeReceiptTransaction && (
        <ReceiptModal
          transaction={activeReceiptTransaction}
          onClose={() => setActiveReceiptTransaction(null)}
        />
      )}
    </div>
  );
};
