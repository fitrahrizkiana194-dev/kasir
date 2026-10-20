import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/Header';
import { POSTerminal } from './components/pos/POSTerminal';
import { ProductManagement } from './components/inventory/ProductManagement';
import { TransactionHistory } from './components/history/TransactionHistory';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { ShiftManagement } from './components/shift/ShiftManagement';

const MainLayout: React.FC = () => {
  const { activeTab } = usePOS();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pos' && <POSTerminal />}
        {activeTab === 'inventory' && <ProductManagement />}
        {activeTab === 'history' && <TransactionHistory />}
        {activeTab === 'reports' && <ReportsDashboard />}
        {activeTab === 'shift' && <ShiftManagement />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
