import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { Printer, Check, Copy, ArrowRight, Share2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { settings } = usePOS();
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generateReceiptPlainText = () => {
    const lines = [
      '================================',
      `       ${settings.storeName.toUpperCase()}       `,
      `  ${settings.tagline}  `,
      `  ${settings.address}  `,
      `  Telp: ${settings.phone}  `,
      '================================',
      `No. Faktur: ${transaction.id}`,
      `Waktu     : ${formatDateTime(transaction.timestamp)}`,
      `Kasir     : ${transaction.cashierName}`,
      transaction.customerName ? `Pelanggan : ${transaction.customerName}` : '',
      `Tipe      : ${transaction.orderType}`,
      '--------------------------------',
      ...transaction.items.map(
        (it) =>
          `${it.name}\n  ${it.quantity} x ${formatRupiah(it.price)} = ${formatRupiah(it.subtotal)}${
            it.note ? `\n  *catatan: ${it.note}` : ''
          }`
      ),
      '--------------------------------',
      `Subtotal       : ${formatRupiah(transaction.subtotal)}`,
      transaction.discountTotal > 0 ? `Diskon         : -${formatRupiah(transaction.discountTotal)}` : '',
      settings.taxEnabled ? `PPN (${transaction.taxPercent}%)       : ${formatRupiah(transaction.taxTotal)}` : '',
      `TOTAL          : ${formatRupiah(transaction.grandTotal)}`,
      `Metode         : ${transaction.paymentMethod}`,
      `Bayar          : ${formatRupiah(transaction.amountPaid)}`,
      `Kembali        : ${formatRupiah(transaction.changeAmount)}`,
      '================================',
      `  ${settings.footerNote}  `,
      '================================',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopyText = async () => {
    const text = generateReceiptPlainText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header Notification */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Transaksi Berhasil!</h3>
              <p className="text-xs text-emerald-100 font-mono">{transaction.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-100 block">Kembalian</span>
            <span className="font-mono font-bold text-lg text-white">
              {formatRupiah(transaction.changeAmount)}
            </span>
          </div>
        </div>

        {/* Printable Thermal Receipt Surface */}
        <div className="p-6 bg-slate-50 flex justify-center">
          <div
            id="thermal-receipt"
            className="w-full max-w-[340px] bg-white p-5 shadow-xs border border-dashed border-slate-300 font-mono text-xs text-slate-800 leading-relaxed rounded-sm"
          >
            {/* Store Lockup */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-bold text-sm tracking-tight text-slate-900">{settings.storeName}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.tagline}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{settings.address}</p>
              <p className="text-[10px] text-slate-400">Telp: {settings.phone}</p>
            </div>

            {/* Meta Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Faktur:</span>
                <span className="font-semibold text-slate-900">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTime(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis:</span>
                <span>{transaction.orderType}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-medium text-slate-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-amber-700 italic pl-1">
                      Catatan: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discountTotal)}</span>
                </div>
              )}

              {settings.taxEnabled && (
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({transaction.taxPercent}%):</span>
                  <span>{formatRupiah(transaction.taxTotal)}</span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t border-slate-200 text-xs font-bold text-slate-900">
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-700 pt-1">
                <span>Metode ({transaction.paymentMethod}):</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>

              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-3 text-center text-[10px] text-slate-500 leading-tight">
              <p>{settings.footerNote}</p>
              <p className="mt-1 text-[9px] text-slate-400">Kasir Pintar POS • www.kasirpintar.id</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk (Print)</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks Struk'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold shadow-xs"
          >
            <span>Selesai & Buka Transaksi Baru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
