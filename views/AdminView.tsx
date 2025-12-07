import React, { useState, useMemo } from 'react';
import { DeliveryRecord } from '../types';
import { formatCurrency } from '../utils';
import { Button } from '../components/Button';
import { LogOut, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { HistoryView } from './HistoryView';

interface AdminViewProps {
  onLogout: () => void;
  allRecords: DeliveryRecord[]; // In a real app, this would be fetched from backend
}

export const AdminView: React.FC<AdminViewProps> = ({ onLogout, allRecords }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Group records by user
  const usersSummary = useMemo(() => {
    const map = new Map<string, { count: number; total: number; lastActive: number }>();
    
    allRecords.forEach(r => {
      const current = map.get(r.userId) || { count: 0, total: 0, lastActive: 0 };
      map.set(r.userId, {
        count: current.count + 1,
        total: current.total + r.calculatedValue,
        lastActive: Math.max(current.lastActive, new Date(r.date).getTime())
      });
    });

    return Array.from(map.entries()).map(([userId, data]) => ({
      userId,
      ...data
    })).sort((a, b) => b.lastActive - a.lastActive);
  }, [allRecords]);

  // If a user is selected, show their history using the existing HistoryView component
  if (selectedUser) {
    const userRecords = allRecords.filter(r => r.userId === selectedUser);
    
    return (
      <div className="min-h-screen bg-slate-100">
         <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setSelectedUser(null)} className="text-white hover:text-brand-400 p-1">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-bold text-lg leading-tight">{selectedUser}</h1>
              <p className="text-xs text-slate-400">Visualizando histórico</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:text-red-400">
            <LogOut size={20} />
          </Button>
        </nav>
        
        {/* Reuse HistoryView but contained */}
        <div className="max-w-md mx-auto">
          <HistoryView records={userRecords} />
        </div>
      </div>
    );
  }

  // Dashboard / User List View
  // FILTER: Only current month for the Total Payout display
  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthRecords = allRecords.filter(r => r.date.startsWith(currentMonthKey));
  const totalPayoutCurrentMonth = currentMonthRecords.reduce((acc, curr) => acc + curr.calculatedValue, 0);

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <h1 className="font-bold text-xl">Payload <span className="text-brand-400">Admin</span></h1>
        <Button variant="ghost" onClick={onLogout} className="text-white hover:text-red-400">
          <LogOut size={20} />
        </Button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-brand-500">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pagamentos ({currentMonthName})</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(totalPayoutCurrentMonth)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total de Entregadores</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{usersSummary.length}</p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-lg text-slate-800">Entregadores ({usersSummary.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {usersSummary.map(user => (
              <button 
                key={user.userId}
                onClick={() => setSelectedUser(user.userId)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{user.userId}</h3>
                    <p className="text-xs text-slate-500">
                      Última atividade: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-brand-600">{formatCurrency(user.total)}</p>
                    <p className="text-xs text-slate-400">{user.count} registros</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-500" />
                </div>
              </button>
            ))}

            {usersSummary.length === 0 && (
               <div className="p-8 text-center text-slate-400">
                 Nenhum usuário registrado no sistema local.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};