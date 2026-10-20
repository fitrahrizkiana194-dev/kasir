import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { ActiveTab } from '../types';
import {
  ShoppingBag,
  Package,
  Receipt,
  BarChart3,
  Clock,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { StoreSettingsModal } from './settings/StoreSettingsModal';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, settings, currentShift } = usePOS();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pos', label: 'Kasir', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'inventory', label: 'Stok & Produk', icon: <Package className="w-4 h-4" /> },
    { id: 'history', label: 'Riwayat Transaksi', icon: <Receipt className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan Penjualan', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'shift', label: 'Kas & Shift', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            KP
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {settings.storeName}
          </span>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action / system status */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            title="Panduan Pintasan Tombol"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Pengaturan Toko"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <button
            onClick={() => setActiveTab('shift')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                currentShift && currentShift.status === 'BUKA' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 block truncate max-w-[120px]">
                {settings.activeCashier}
              </span>
              <span className="text-slate-500 block text-[11px]">
                {currentShift && currentShift.status === 'BUKA' ? 'Shift Buka' : 'Shift Tutup'}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Navigation bar for smaller screens */}
      <div className="lg:hidden flex items-center justify-around border-b border-slate-200 bg-white px-2 py-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === item.id ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && <StoreSettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {/* Keyboard Shortcuts Guide Modal */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pintasan Tombol Cepat (Keyboard)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Gunakan pintasan keyboard untuk mempercepat transaksi kasir harian.
            </p>

            <div className="space-y-2.5 text-sm text-slate-700 mb-6">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Fokus Pencarian / Scan Barcode</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-100 border border-slate-300 rounded text-slate-800">
                  / atau F2
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Buka Pembayaran / Bayar Cepat</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-100 border border-slate-300 rounded text-slate-800">
                  F4 atau Space
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Simpan Pesanan (Hold Order)</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-100 border border-slate-300 rounded text-slate-800">
                  F7
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Batalkan / Kosongkan Keranjang</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-100 border border-slate-300 rounded text-slate-800">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Cetak Struk Terakhir</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-slate-100 border border-slate-300 rounded text-slate-800">
                  Ctrl + P
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setIsShortcutsOpen(false)}
              className="w-full py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
