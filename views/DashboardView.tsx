import React, { useMemo } from 'react';
import { DeliveryRecord } from '../types';
import { formatCurrency } from '../utils';
import { Plus, TrendingUp, Package, Calendar } from 'lucide-react';
import { Button } from '../components/Button';

interface DashboardViewProps {
  records: DeliveryRecord[];
  onAddRecord: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ records, onAddRecord }) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const monthlyStats = useMemo(() => {
    const monthRecords = records.filter(r => r.date.startsWith(currentMonth));
    const totalEarnings = monthRecords.reduce((acc, curr) => acc + curr.calculatedValue, 0);
    const totalDeliveries = monthRecords.length;
    return { totalEarnings, totalDeliveries };
  }, [records, currentMonth]);

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-900 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <TrendingUp size={20} />
          <span className="text-sm font-medium">Ganho do Mês</span>
        </div>
        <div className="text-4xl font-bold tracking-tight mb-6">
          {formatCurrency(monthlyStats.totalEarnings)}
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm">
            <div className="text-xs opacity-70 mb-1">Registros</div>
            <div className="font-semibold text-lg">{monthlyStats.totalDeliveries}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex-1 backdrop-blur-sm">
             <div className="text-xs opacity-70 mb-1">Média/Dia</div>
             <div className="font-semibold text-lg">
               {monthlyStats.totalDeliveries > 0 
                 ? formatCurrency(monthlyStats.totalEarnings / monthlyStats.totalDeliveries) 
                 : '£0.00'}
             </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Ações</h3>
        <Button onClick={onAddRecord} fullWidth className="h-16 text-lg">
          <Plus className="mr-2" /> Novo Registro
        </Button>
      </div>

      {/* Recent Activity Preview */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Recentes</h3>
        <div className="space-y-3">
          {records.slice(0, 3).map(record => (
            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.type === 'INDIVIDUAL' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                  {record.type === 'INDIVIDUAL' ? <Package size={20} /> : <Calendar size={20} />}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{record.type === 'INDIVIDUAL' ? 'Individual' : 'Diária'}</p>
                  <p className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <span className="font-bold text-slate-700">{formatCurrency(record.calculatedValue)}</span>
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              Nenhum registro ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
