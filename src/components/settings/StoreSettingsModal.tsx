import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  X,
  Store,
  Receipt,
  QrCode,
  Database,
  RotateCcw,
  Download,
  Upload,
  Check,
} from 'lucide-react';

interface StoreSettingsModalProps {
  onClose: () => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({ onClose }) => {
  const {
    settings,
    updateSettings,
    resetToDefaults,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = usePOS();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [footerNote, setFooterNote] = useState(settings.footerNote);
  const [taxEnabled, setTaxEnabled] = useState(settings.taxEnabled);
  const [taxPercent, setTaxPercent] = useState(settings.taxPercent);
  const [activeCashier, setActiveCashier] = useState(settings.activeCashier);
  const [qrisMerchantName, setQrisMerchantName] = useState(settings.qrisMerchantName);
  const [qrisNmid, setQrisNmid] = useState(settings.qrisNmid);

  const [jsonInput, setJsonInput] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      footerNote: footerNote.trim(),
      taxEnabled,
      taxPercent: Number(taxPercent) || 0,
      activeCashier: activeCashier.trim(),
      qrisMerchantName: qrisMerchantName.trim(),
      qrisNmid: qrisNmid.trim(),
    });
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Kasir_Pintar_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!jsonInput.trim()) return;
    const ok = importDatabaseJSON(jsonInput.trim());
    if (ok) {
      setImportStatus('Data berhasil dipulihkan!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setImportStatus('Gagal membaca format JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Pengaturan Toko & Kasir</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Bagian 1: Identitas Toko */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Identitas Toko & Struk
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Toko / Usaha *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slogan / Subtitle Struk
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Toko
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kasir Utama
                </label>
                <input
                  type="text"
                  value={activeCashier}
                  onChange={(e) => setActiveCashier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Kaki Struk (Footer)
                </label>
                <textarea
                  rows={2}
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Bagian 2: Pajak & QRIS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pajak PPN & QRIS
            </h3>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="col-span-2 sm:col-span-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Aktifkan PPN</span>
                  <span className="text-[11px] text-slate-500">Kenakan pajak pada transaksi</span>
                </div>
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tarif PPN (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!taxEnabled}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 disabled:bg-slate-100"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Merchant QRIS
                </label>
                <input
                  type="text"
                  value={qrisMerchantName}
                  onChange={(e) => setQrisMerchantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NMID QRIS
                </label>
                <input
                  type="text"
                  value={qrisNmid}
                  onChange={(e) => setQrisNmid(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Bagian 3: Cadangan Data */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cadangan & Pemulihan Data
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Cadangan (Backup JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowJsonImport(!showJsonImport)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan dari File JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Kembalikan semua produk dan riwayat ke data bawaan demo?')) {
                    resetToDefaults();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Demo</span>
              </button>
            </div>

            {showJsonImport && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Tempelkan (Paste) Teks JSON Cadangan:
                </label>
                <textarea
                  rows={3}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste isi file json di sini..."
                  className="w-full p-2 font-mono text-[10px] bg-white border border-slate-300 rounded-lg"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-emerald-700">{importStatus}</span>
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800"
                  >
                    Terapkan Pemulihan
                  </button>
                </div>
              </div>
            )}
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
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
