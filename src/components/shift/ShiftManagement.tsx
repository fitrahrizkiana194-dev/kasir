import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import {
  Clock,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  History,
  X,
  FileText,
} from 'lucide-react';

export const ShiftManagement: React.FC = () => {
  const {
    currentShift,
    shiftHistory,
    openShift,
    addCashMovement,
    closeShift,
    settings,
  } = usePOS();

  // Open Shift Form State
  const [newCashierName, setNewCashierName] = useState(settings.activeCashier);
  const [startingCash, setStartingCash] = useState<number>(200000);

  // Cash Movement Modal State
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'MASUK' | 'KELUAR'>('KELUAR');
  const [movementAmount, setMovementAmount] = useState<number>(20000);
  const [movementReason, setMovementReason] = useState<string>('');

  // Close Shift Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [actualCash, setActualCash] = useState<number>(currentShift ? currentShift.expectedCash : 0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Handle Open Shift
  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openShift(startingCash, newCashierName);
  };

  // Handle Movement
  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementReason.trim()) {
      alert('Alasan kas wajib diisi');
      return;
    }
    addCashMovement(movementType, movementAmount, movementReason.trim());
    setIsMovementModalOpen(false);
    setMovementReason('');
  };

  // Handle Close Shift
  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(actualCash, closeNotes);
    setIsCloseModalOpen(false);
  };

  const selisih = currentShift ? actualCash - currentShift.expectedCash : 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-5">
      {/* Top Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Manajemen Kas & Shift Kasir
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kontrol modal awal laci uang, mutasi kas keluar/masuk, dan rekonsiliasi tutup shift harian
        </p>
      </div>

      {/* If Shift is Closed, show Open Shift Card */}
      {!currentShift || currentShift.status === 'TUTUP' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto w-full text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Shift Kasir Belum Dibuka</h2>
            <p className="text-xs text-slate-500 mt-1">
              Buka shift kasir terlebih dahulu untuk mencatat modal kas kecil dan memulai transaksi kasir.
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="text-left space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kasir Bertugas
              </label>
              <input
                type="text"
                required
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modal Awal Kasir / Kas Kecil (Rp)
              </label>
              <input
                type="number"
                min="0"
                required
                value={startingCash}
                onChange={(e) => setStartingCash(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              {[100000, 200000, 300000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStartingCash(val)}
                  className="flex-1 py-1.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Shift Kasir Sekarang</span>
            </button>
          </form>
        </div>
      ) : (
        /* Active Shift Panel */
        <div className="space-y-4">
          {/* Active Shift Header Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{currentShift.id}</h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Shift Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dibuka oleh <strong className="text-slate-700">{currentShift.cashierName}</strong> ·{' '}
                  {formatDateTime(currentShift.openedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                + Catat Kas Masuk / Keluar
              </button>

              <button
                onClick={() => {
                  setActualCash(currentShift.expectedCash);
                  setIsCloseModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
              >
                Tutup Shift (Rekonsiliasi)
              </button>
            </div>
          </div>

          {/* Cash Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Modal Awal Laci</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {formatRupiah(currentShift.startingCash)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Kas kecil awal shift</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-emerald-700 font-medium">+ Penjualan Tunai</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                {formatRupiah(currentShift.cashSalesTotal)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Uang fisik masuk dari pelanggan
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Penjualan Non-Tunai</span>
              <div className="text-xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
                {formatRupiah(currentShift.otherSalesTotal)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                QRIS, EDC Debit, & Transfer
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Target Kas di Laci</span>
              <div className="text-xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
                {formatRupiah(currentShift.expectedCash)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Modal + Penjualan Tunai ± Mutasi
              </span>
            </div>
          </div>

          {/* Mutasi Kas Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Buku Mutasi Kas Operasional (Petty Cash)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {currentShift.movements.length} transaksi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Waktu</th>
                    <th className="py-2.5 px-4">Jenis</th>
                    <th className="py-2.5 px-4">Keterangan / Keperluan</th>
                    <th className="py-2.5 px-4">Dicatat Oleh</th>
                    <th className="py-2.5 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentShift.movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada mutasi kas masuk/keluar pada shift ini.
                      </td>
                    </tr>
                  ) : (
                    currentShift.movements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 text-slate-600 font-mono">
                          {formatDateTime(mov.timestamp)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              mov.type === 'MASUK'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {mov.type === 'MASUK' ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {mov.type === 'MASUK' ? 'Kas Masuk' : 'Kas Keluar'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-900 font-semibold">{mov.reason}</td>
                        <td className="py-2.5 px-4 text-slate-600">{mov.cashierName}</td>
                        <td
                          className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                            mov.type === 'MASUK' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {mov.type === 'MASUK' ? '+' : '-'} {formatRupiah(mov.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Previous Shifts History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
              Riwayat Shift Kasir Sebelumnya
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">ID Shift</th>
                <th className="py-2.5 px-4">Kasir</th>
                <th className="py-2.5 px-4">Buka / Tutup</th>
                <th className="py-2.5 px-4 text-right">Modal Awal</th>
                <th className="py-2.5 px-4 text-right">Penjualan Tunai</th>
                <th className="py-2.5 px-4 text-right">Target Laci</th>
                <th className="py-2.5 px-4 text-right">Fisik Kasir</th>
                <th className="py-2.5 px-4 text-right">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {shiftHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada riwayat shift yang ditutup.
                  </td>
                </tr>
              ) : (
                shiftHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.id}</td>
                    <td className="py-2.5 px-4 text-slate-700">{s.cashierName}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      <div>Buka: {formatDateTime(s.openedAt)}</div>
                      {s.closedAt && <div>Tutup: {formatDateTime(s.closedAt)}</div>}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {formatRupiah(s.startingCash)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatRupiah(s.cashSalesTotal)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                      {formatRupiah(s.expectedCash)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {s.actualCash !== undefined ? formatRupiah(s.actualCash) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      {s.difference === undefined ? (
                        '-'
                      ) : s.difference === 0 ? (
                        <span className="text-emerald-700">Pas (Rp 0)</span>
                      ) : s.difference > 0 ? (
                        <span className="text-blue-700">+{formatRupiah(s.difference)}</span>
                      ) : (
                        <span className="text-rose-700">{formatRupiah(s.difference)}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal (Kas Masuk / Keluar) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Catat Mutasi Kas Operasional</h3>
            <p className="text-xs text-slate-500 mb-4">Pengeluaran kecil atau penambahan uang kasir</p>

            <form onSubmit={handleAddMovement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Mutasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('KELUAR')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      movementType === 'KELUAR'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - Kas Keluar (Beban)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('MASUK')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      movementType === 'MASUK'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + Kas Masuk (Lainnya)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="500"
                  required
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keperluan / Alasan
                </label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Contoh: Beli es batu / plastik kantong / isi ulang galon"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift / Reconciliation Modal */}
      {isCloseModalOpen && currentShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Rekonsiliasi & Tutup Shift Kasir
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hitung uang fisik di laci kasir dan bandingkan dengan target sistem.
            </p>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Modal Awal:</span>
                  <span className="font-mono text-slate-800">{formatRupiah(currentShift.startingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penjualan Tunai:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    +{formatRupiah(currentShift.cashSalesTotal)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
                  <span className="text-slate-900">Target Kas Akhir di Laci:</span>
                  <span className="font-mono text-slate-900 text-sm">
                    {formatRupiah(currentShift.expectedCash)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Uang Fisik Hasil Perhitungan Nyata (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-base font-mono font-bold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Live Difference Box */}
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                  selisih === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : selisih > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span>
                  {selisih === 0
                    ? 'Kas Sempurna (Pas)'
                    : selisih > 0
                    ? 'Kas Lebih (Surplus)'
                    : 'Kas Kurang (Defisit)'}
                </span>
                <span className="font-mono font-bold text-sm">
                  {selisih > 0 ? `+${formatRupiah(selisih)}` : formatRupiah(selisih)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tutup Shift (Opsional)
                </label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Misal: Uang kembalian 2.000 tersisa banyak"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Konfirmasi & Tutup Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
