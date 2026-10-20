import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Banknote,
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const { cartGrandTotal, processPayment, settings } = usePOS();
  const [method, setMethod] = useState<PaymentMethod>('TUNAI');
  const [cashAmount, setCashAmount] = useState<number>(cartGrandTotal);
  const [debitRef, setDebitRef] = useState<string>('');
  const [transferBank, setTransferBank] = useState<string>('BCA');

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'TUNAI', label: 'Tunai (Cash)', icon: <Banknote className="w-4 h-4" /> },
    { id: 'QRIS', label: 'QRIS Digital', icon: <QrCode className="w-4 h-4" /> },
    { id: 'DEBIT', label: 'Kartu Debit / EDC', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'TRANSFER', label: 'Transfer Bank', icon: <Building className="w-4 h-4" /> },
  ];

  // Quick denomination suggestions for cash
  const quickCashButtons = [
    { label: 'Uang Pas', value: cartGrandTotal },
    { label: '50.000', value: 50000 },
    { label: '100.000', value: 100000 },
    { label: '150.000', value: 150000 },
    { label: '200.000', value: 200000 },
  ];

  const change = Math.max(0, cashAmount - cartGrandTotal);
  const isCashInsufficient = method === 'TUNAI' && cashAmount < cartGrandTotal;

  const handlePay = () => {
    let finalPaid = cartGrandTotal;
    if (method === 'TUNAI') {
      if (cashAmount < cartGrandTotal) return;
      finalPaid = cashAmount;
    }
    const result = processPayment(method, finalPaid);
    if (result) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pembayaran Kasir</h2>
            <p className="text-xs text-slate-500">Pilih metode pembayaran dan konfirmasi transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grand Total Display */}
        <div className="p-6 bg-slate-900 text-white text-center">
          <span className="text-xs font-medium tracking-wide uppercase text-slate-400 block mb-1">
            Total Tagihan Belanja
          </span>
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
            {formatRupiah(cartGrandTotal)}
          </span>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  if (m.id === 'TUNAI') setCashAmount(cartGrandTotal);
                }}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  method === m.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {m.icon}
                <span className="whitespace-nowrap">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Method: TUNAI */}
          {method === 'TUNAI' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nominal Uang Tunai Diterima (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-mono text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickCashButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashAmount(btn.value)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                      cashAmount === btn.value
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Kembalian / Change calculation box */}
              <div
                className={`p-4 rounded-xl border ${
                  isCashInsufficient
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    {isCashInsufficient ? 'Kurang Bayar' : 'Uang Kembalian'}
                  </span>
                  <span className="text-xl font-bold font-mono tabular-nums">
                    {formatRupiah(isCashInsufficient ? cartGrandTotal - cashAmount : change)}
                  </span>
                </div>
                {isCashInsufficient && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Uang tunai kurang dari total tagihan</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Method: QRIS */}
          {method === 'QRIS' && (
            <div className="text-center p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="inline-block p-3 bg-white border-2 border-slate-800 rounded-xl shadow-xs">
                {/* Simulated dynamic QR code pattern with SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-36 h-36 mx-auto text-slate-900"
                  fill="currentColor"
                >
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" />
                  
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" />

                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" />

                  <rect x="36" y="12" width="8" height="8" />
                  <rect x="48" y="20" width="8" height="8" />
                  <rect x="36" y="36" width="28" height="28" />
                  <rect x="42" y="42" width="16" height="16" fill="white" />
                  <rect x="46" y="46" width="8" height="8" />
                  <rect x="12" y="42" width="10" height="10" />
                  <rect x="72" y="40" width="12" height="12" />
                  <rect x="68" y="72" width="14" height="14" />
                  <rect x="40" y="76" width="10" height="10" />
                  <rect x="86" y="72" width="8" height="8" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 uppercase">
                  {settings.qrisMerchantName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  NMID: {settings.qrisNmid}
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Tagihan: {formatRupiah(cartGrandTotal)}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                Mendukung GoPay, OVO, DANA, ShopeePay, BCA, Livin, BRImo, LinkAja.
              </div>
            </div>
          )}

          {/* Method: DEBIT */}
          {method === 'DEBIT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor Referensi / Approval Code Mesin EDC
                </label>
                <input
                  type="text"
                  value={debitRef}
                  onChange={(e) => setDebitRef(e.target.value)}
                  placeholder="Contoh: REF-889021 (Opsional)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Gesek atau tap kartu nasabah pada mesin EDC, lalu konfirmasi pembayaran setelah struk EDC keluar.
              </div>
            </div>
          )}

          {/* Method: TRANSFER */}
          {method === 'TRANSFER' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bank Tujuan Rekening Toko
                </label>
                <select
                  value={transferBank}
                  onChange={(e) => setTransferBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BCA">BCA - 8420-192-881 (a/n Kasir Pintar)</option>
                  <option value="MANDIRI">Mandiri - 137-00-1928-111 (a/n Kasir Pintar)</option>
                  <option value="BRI">BRI - 0122-01-098273-50 (a/n Kasir Pintar)</option>
                </select>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                Pastikan mutasi dana atau bukti transfer telah diverifikasi sebelum menyelesaikan pesanan.
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handlePay}
            disabled={isCashInsufficient}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-xs ${
              isCashInsufficient
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
