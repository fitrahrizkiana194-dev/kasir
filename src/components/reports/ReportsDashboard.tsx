import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Download,
  Calendar,
  Award,
  PieChart,
} from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const { transactions, products } = usePOS();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');

  // Filter transactions by range
  const filteredTrx = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      if (t.status !== 'SELESAI') return false;
      const trxDate = new Date(t.timestamp);
      if (timeRange === 'today') {
        return (
          trxDate.getDate() === now.getDate() &&
          trxDate.getMonth() === now.getMonth() &&
          trxDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeRange === '7days') {
        return now.getTime() - trxDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      }
      if (timeRange === '30days') {
        return now.getTime() - trxDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [transactions, timeRange]);

  // Financial Metrics
  const totalRevenue = filteredTrx.reduce((sum, t) => sum + t.grandTotal, 0);
  const totalCost = filteredTrx.reduce((sum, t) => sum + t.totalCost, 0);
  const totalProfit = filteredTrx.reduce((sum, t) => sum + t.profit, 0);
  const totalTax = filteredTrx.reduce((sum, t) => sum + t.taxTotal, 0);
  const totalOrders = filteredTrx.length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const profitMarginPct = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const methods: Record<string, { count: number; total: number }> = {
      TUNAI: { count: 0, total: 0 },
      QRIS: { count: 0, total: 0 },
      DEBIT: { count: 0, total: 0 },
      TRANSFER: { count: 0, total: 0 },
    };

    filteredTrx.forEach((t) => {
      if (methods[t.paymentMethod]) {
        methods[t.paymentMethod].count += 1;
        methods[t.paymentMethod].total += t.grandTotal;
      }
    });

    return Object.entries(methods).map(([key, val]) => ({
      method: key,
      count: val.count,
      total: val.total,
      percent: totalRevenue > 0 ? Math.round((val.total / totalRevenue) * 100) : 0,
    }));
  }, [filteredTrx, totalRevenue]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};

    filteredTrx.forEach((trx) => {
      trx.items.forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            name: item.name,
            category: item.category,
            qty: 0,
            revenue: 0,
          };
        }
        productStats[item.productId].qty += item.quantity;
        productStats[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTrx]);

  // Hourly / Daily Data for Bar Chart
  const chartData = useMemo(() => {
    // Generate last 7 days buckets
    const days: { label: string; dateStr: string; amount: number }[] = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
      days.push({ label: dayLabel, dateStr, amount: 0 });
    }

    filteredTrx.forEach((t) => {
      const tDateStr = t.timestamp.split('T')[0];
      const match = days.find((d) => d.dateStr === tDateStr);
      if (match) {
        match.amount += t.grandTotal;
      }
    });

    return days;
  }, [filteredTrx]);

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 100000);

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'No Faktur',
      'Waktu',
      'Kasir',
      'Pelanggan',
      'Tipe',
      'Subtotal',
      'Diskon',
      'PPN',
      'Grand Total',
      'HPP Total',
      'Laba Kotor',
      'Metode Bayar',
      'Status',
    ];

    const rows = filteredTrx.map((t) => [
      t.id,
      t.timestamp,
      `"${t.cashierName}"`,
      `"${t.customerName || '-'}"`,
      t.orderType,
      t.subtotal,
      t.discountTotal,
      t.taxTotal,
      t.grandTotal,
      t.totalCost,
      t.profit,
      t.paymentMethod,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_Kasir_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-y-auto bg-slate-100 p-4 sm:p-6 space-y-5">
      {/* Header with Time Selector & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan Analisis Penjualan & Laba
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis performa omset, margin keuntungan, metode pembayaran, dan tren produk terlaris
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {(
              [
                { id: 'today', label: 'Hari Ini' },
                { id: '7days', label: '7 Hari' },
                { id: '30days', label: '30 Hari' },
                { id: 'all', label: 'Semua' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  timeRange === t.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Omset Penjualan</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2 tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Dari {formatNumber(totalOrders)} transaksi berhasil
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Laba Kotor Bersih</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-2 tabular-nums">
            {formatRupiah(totalProfit)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Margin: {profitMarginPct}% dari omset
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Nilai Transaksi Rata-Rata</span>
            <ShoppingBag className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2 tabular-nums">
            {formatRupiah(aov)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            AOV (Average Order Value)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total PPN Terkumpul</span>
            <CreditCard className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-800 mt-2 tabular-nums">
            {formatRupiah(totalTax)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pajak PPN keluaran tercatat
          </span>
        </div>
      </div>

      {/* Row 2: Sales Chart & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tren Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Omset harian berdasarkan waktu transaksi</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              Grafik Harian
            </span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 min-h-[220px]">
            {chartData.map((d, idx) => {
              const heightPct = Math.min(100, Math.max(8, Math.round((d.amount / maxChartAmount) * 100)));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatRupiah(d.amount)}
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden h-[160px]">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-emerald-600 rounded-t-lg group-hover:bg-emerald-500 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Komposisi Pembayaran</h3>
            <p className="text-xs text-slate-500 mb-4">Distribusi nominal transaksi per kanal</p>

            <div className="space-y-3.5">
              {paymentBreakdown.map((item) => (
                <div key={item.method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.method}</span>
                    <span className="font-mono text-slate-600 font-bold tabular-nums">
                      {formatRupiah(item.total)} ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className={`h-full rounded-full ${
                        item.method === 'TUNAI'
                          ? 'bg-amber-500'
                          : item.method === 'QRIS'
                          ? 'bg-emerald-600'
                          : item.method === 'DEBIT'
                          ? 'bg-blue-600'
                          : 'bg-indigo-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Membantu evaluasi biaya MDR dan rekonsiliasi kasir
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">5 Produk Terlaris (Top Sellers)</h3>
              <p className="text-xs text-slate-500">Produk dengan volume penjualan tertinggi di periode ini</p>
            </div>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada data produk terjual pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Peringkat</th>
                  <th className="py-2.5 px-3">Nama Produk</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Terjual</th>
                  <th className="py-2.5 px-3 text-right">Kontribusi Omset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 text-slate-600">{p.category}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {p.qty} terjual
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-700">
                      {formatRupiah(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
