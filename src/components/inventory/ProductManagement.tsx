import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Barcode,
  Layers,
  X,
  Check,
  TrendingUp,
} from 'lucide-react';

export const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'tambah' | 'kurang'>('tambah');

  // Categories list
  const categories = useMemo(() => {
    return ['Semua', ...new Set(products.map((p) => p.category))];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.stock > 0 && p.stock <= p.minStockAlert;
      if (stockFilter === 'out') matchStock = p.stock <= 0;

      return matchCat && matchQuery && matchStock;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  // Statistics
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const totalAssetValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-100 p-4 sm:p-6">
      {/* Top Bar with KPI Metrics & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Produk & Inventaris
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola katalog barang, pantau ketersediaan stok, dan atur HPP serta harga jual
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Produk</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
            {formatNumber(totalProducts)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-amber-700 font-medium">Stok Menipis</span>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5 tabular-nums">
            {formatNumber(lowStockCount)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-rose-700 font-medium">Stok Habis</span>
          <div className="text-xl font-bold font-mono text-rose-600 mt-0.5 tabular-nums">
            {formatNumber(outOfStockCount)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Nilai Aset Modal (HPP)</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5 tabular-nums">
            {formatRupiah(totalAssetValue)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau barcode..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Kategori: {c}
              </option>
            ))}
          </select>

          {/* Stock Filter segmented */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                stockFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                stockFilter === 'low' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Menipis ({lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                stockFilter === 'out' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Habis ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Barcode / SKU</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Modal (HPP)</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Margin Laba</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada produk yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const marginRp = p.price - p.costPrice;
                  const marginPct = p.costPrice > 0 ? Math.round((marginRp / p.costPrice) * 100) : 0;
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {p.barcode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border border-slate-200 shrink-0">
                              IMG
                            </div>
                          )}
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{p.category}</td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                        {formatRupiah(p.costPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(p.price)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span className="text-emerald-700 font-semibold">
                          +{marginPct}% ({formatRupiah(marginRp)})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }
                        >
                          {p.stock} {p.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : isLowStock ? 'Menipis' : 'Aman'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustAmount(10);
                            }}
                            title="Sesuaikan Stok"
                            className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                          >
                            Stok
                          </button>
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Edit Produk"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Hapus Produk"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <ProductFormModal
          initialProduct={editingProduct || undefined}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={(prodData) => {
            if (editingProduct) {
              updateProduct({ ...prodData, id: editingProduct.id });
            } else {
              addProduct(prodData);
            }
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Quick Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Penyesuaian Stok Cepat</h3>
            <p className="text-xs text-slate-500 mb-3">{adjustingProduct.name}</p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 flex justify-between text-xs">
              <span className="text-slate-600">Stok Saat Ini:</span>
              <span className="font-bold font-mono text-slate-900">
                {adjustingProduct.stock} {adjustingProduct.unit}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Penyesuaian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('tambah')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      adjustType === 'tambah'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + Tambah Stok Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('kurang')}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      adjustType === 'kurang'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - Kurangi / Rusak
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah ({adjustingProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {[5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setAdjustAmount(qty)}
                    className="flex-1 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const delta = adjustType === 'tambah' ? adjustAmount : -adjustAmount;
                  adjustStock(adjustingProduct.id, delta);
                  setAdjustingProduct(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Simpan Stok Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductFormModalProps {
  initialProduct?: Product;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [barcode, setBarcode] = useState(
    initialProduct?.barcode || `899${Math.floor(1000000 + Math.random() * 9000000)}`
  );
  const [category, setCategory] = useState(initialProduct?.category || 'Makanan');
  const [unit, setUnit] = useState(initialProduct?.unit || 'Pcs');
  const [costPrice, setCostPrice] = useState(initialProduct?.costPrice || 10000);
  const [price, setPrice] = useState(initialProduct?.price || 15000);
  const [stock, setStock] = useState(initialProduct?.stock || 20);
  const [minStockAlert, setMinStockAlert] = useState(initialProduct?.minStockAlert || 5);
  const [image, setImage] = useState(initialProduct?.image || '');

  const marginRp = price - costPrice;
  const marginPct = costPrice > 0 ? Math.round((marginRp / costPrice) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk tidak boleh kosong');
      return;
    }

    onSave({
      name: name.trim(),
      barcode: barcode.trim(),
      category,
      unit,
      costPrice: Number(costPrice) || 0,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 0,
      image: image.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            {initialProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kopi Susu Aren 250ml"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Barcode / SKU
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Snack">Snack</option>
                <option value="Sembako">Sembako</option>
                <option value="Kebutuhan Rumah">Kebutuhan Rumah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan Barang
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Pcs / Porsi / Botol"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peringatan Stok Min.
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Pokok (HPP) Rp
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Jual Rp
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Profit Margin Preview Card */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span className="text-emerald-900 font-semibold">Estimasi Margin Laba:</span>
            </div>
            <span className="font-mono font-bold text-emerald-800">
              +{marginPct}% ({formatRupiah(marginRp)})
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
