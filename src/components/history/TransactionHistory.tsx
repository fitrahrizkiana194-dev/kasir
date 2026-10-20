import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime, formatNumber } from '../../utils/formatters';
import {
  Search,
  Receipt,
  Printer,
  Ban,
  Eye,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
  CreditCard,
} from 'lucide-react';
import { ReceiptModal } from '../pos/ReceiptModal';

export const TransactionHistory: React.FC = () => {
  const { transactions, cancelTransaction } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SELESAI' | 'BATAL'>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reprintTransaction, setReprintTransaction] = useState<Transaction | null>(null);
  const [cancelModalTrx, setCancelModalTrx] = useState<Transaction | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Permintaan Pelanggan');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.cashierName.toLowerCase().includes(q) ||
        (t.customerName && t.customerName.toLowerCase().includes(q));

      const matchMethod = methodFilter === 'Semua' || t.paymentMethod === methodFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;

      return matchQuery && matchMethod && matchStatus;
    });
  }, [transactions, searchQuery, methodFilter, statusFilter]);

  // Statistics
  const completedTrx = transactions.filter((t) => t.status === 'SELESAI');
  const totalRevenue = completedTrx.reduce((sum, t) => sum + t.grandTotal, 0);
  const totalProfit = completedTrx.reduce((sum, t) => sum + t.profit, 0);
  const totalVoid = transactions.filter((t) => t.status === 'BATAL').length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-100 p-4 sm:p-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Riwayat Transaksi Penjualan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap seluruh transaksi kasir, cetak ulang struk, dan pembatalan pesanan
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Transaksi Selesai</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
            {formatNumber(completedTrx.length)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Omset Penjualan</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5 tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Estimasi Laba Kotor</span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5 tabular-nums">
            {formatRupiah(totalProfit)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-rose-700 font-medium">Transaksi Dibatalkan</span>
          <div className="text-xl font-bold font-mono text-rose-600 mt-0.5 tabular-nums">
            {formatNumber(totalVoid)}
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
            placeholder="Cari No. Faktur, Kasir, atau Pelanggan..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Semua">Metode: Semua</option>
            <option value="TUNAI">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="DEBIT">Debit</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          {/* Status Segmented */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('SELESAI')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'SELESAI' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setStatusFilter('BATAL')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === 'BATAL' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Dibatalkan
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Faktur</th>
                <th className="py-3 px-4">Waktu Transaksi</th>
                <th className="py-3 px-4">Kasir</th>
                <th className="py-3 px-4">Pelanggan / Tipe</th>
                <th className="py-3 px-4 text-center">Item</th>
                <th className="py-3 px-4 text-right">Total Transaksi</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada riwayat transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itemCount = trx.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {trx.id}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateTime(trx.timestamp)}
                      </td>

                      <td className="py-3 px-4 text-slate-700">{trx.cashierName}</td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">
                          {trx.customerName || '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{trx.orderType}</span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {itemCount} item
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(trx.grandTotal)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {trx.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                            trx.status === 'SELESAI'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {trx.status === 'SELESAI' ? 'Selesai' : 'Dibatalkan'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTransaction(trx)}
                            title="Lihat Detail Pesanan"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setReprintTransaction(trx)}
                            title="Cetak Ulang Struk"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {trx.status === 'SELESAI' && (
                            <button
                              onClick={() => setCancelModalTrx(trx)}
                              title="Batalkan Transaksi / Retur"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Rincian Faktur Penjualan</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedTransaction.id}</p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Waktu Transaksi</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateTime(selectedTransaction.timestamp)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kasir Bertugas</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTransaction.cashierName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pelanggan / Meja</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTransaction.customerName || '-'} ({selectedTransaction.orderType})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTransaction.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3 text-left">Produk</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Harga</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedTransaction.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-900">
                          <div>{it.name}</div>
                          {it.note && (
                            <span className="text-[10px] text-amber-700 italic">
                              *{it.note}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatRupiah(it.price)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatRupiah(selectedTransaction.subtotal)}</span>
                </div>
                {selectedTransaction.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon</span>
                    <span className="font-mono">
                      -{formatRupiah(selectedTransaction.discountTotal)}
                    </span>
                  </div>
                )}
                {selectedTransaction.taxTotal > 0 && (
                  <div className="flex justify-between">
                    <span>PPN ({selectedTransaction.taxPercent}%)</span>
                    <span className="font-mono">{formatRupiah(selectedTransaction.taxTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="font-mono font-extrabold text-emerald-700">
                    {formatRupiah(selectedTransaction.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Laba Kotor Transaksi</span>
                  <span className="font-mono font-semibold text-emerald-800">
                    {formatRupiah(selectedTransaction.profit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setReprintTransaction(selectedTransaction);
                  setSelectedTransaction(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel / Void Modal */}
      {cancelModalTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Batalkan / Retur Transaksi</h3>
            <p className="text-xs text-slate-500 mb-3 font-mono">{cancelModalTrx.id}</p>

            <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mb-4">
              Pembatalan transaksi akan mengembalikan seluruh stok barang dan memperbarui buku kas.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Pembatalan
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Contoh: Salah input pesanan / retur barang"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setCancelModalTrx(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  cancelTransaction(cancelModalTrx.id, cancelReason);
                  setCancelModalTrx(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reprint Thermal Receipt Modal */}
      {reprintTransaction && (
        <ReceiptModal
          transaction={reprintTransaction}
          onClose={() => setReprintTransaction(null)}
        />
      )}
    </div>
  );
};
