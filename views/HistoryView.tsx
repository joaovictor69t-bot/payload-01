import React, { useState, useMemo } from 'react';
import { DeliveryRecord } from '../types';
import { formatCurrency } from '../utils';
import { ChevronDown, ChevronRight, Package, Calendar, Search, ImageIcon, X } from 'lucide-react';

interface HistoryViewProps {
  records: DeliveryRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ records }) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Group records by YYYY-MM
  const groupedRecords = useMemo(() => {
    const groups: Record<string, DeliveryRecord[]> = {};
    records.forEach(r => {
      const monthKey = r.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(r);
    });
    // Sort months descending
    return Object.keys(groups).sort().reverse().map(key => ({
      key,
      label: new Date(`${key}-01`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      items: groups[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
  }, [records]);

  // Set initial open month
  React.useEffect(() => {
    if (groupedRecords.length > 0 && !selectedMonth) {
      setSelectedMonth(groupedRecords[0].key);
    }
  }, [groupedRecords, selectedMonth]);

  return (
    <div className="p-4 pb-24 min-h-screen bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Histórico</h2>

      <div className="space-y-4">
        {groupedRecords.map(group => (
          <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setSelectedMonth(selectedMonth === group.key ? null : group.key)}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                  {group.key.split('-')[1]}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-800 capitalize">{group.label}</h3>
                  <p className="text-xs text-slate-500">{group.items.length} registros</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="font-bold text-slate-700">
                    {formatCurrency(group.items.reduce((acc, i) => acc + i.calculatedValue, 0))}
                 </span>
                 {selectedMonth === group.key ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
              </div>
            </button>

            {selectedMonth === group.key && (
              <div className="border-t border-slate-100 bg-slate-50/50">
                {group.items.map((record) => (
                  <div key={record.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${record.type === 'INDIVIDUAL' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                           {record.type === 'INDIVIDUAL' ? 'Individual' : 'Diária'}
                         </span>
                         <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span className="font-bold text-brand-600">{formatCurrency(record.calculatedValue)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                       {record.type === 'INDIVIDUAL' ? (
                         <>
                           <div>ID: <span className="font-medium text-slate-900">{record.individualId}</span></div>
                           <div className="text-right">{record.parcels} parcelas</div>
                         </>
                       ) : (
                         <>
                           <div>IDs: <span className="font-medium text-slate-900">{record.dailyIds?.join(', ')}</span></div>
                           <div className="text-right">{record.totalParcels} total</div>
                         </>
                       )}
                    </div>

                    {record.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {record.photos.map((photo, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setViewingImage(photo)}
                            className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity"
                          >
                            <img src={photo} alt="Record" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {groupedRecords.length === 0 && (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                    <Search size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Sem histórico</h3>
                <p className="text-slate-500">Adicione registros para ver seu histórico aqui.</p>
            </div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      {viewingImage && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full hover:bg-white/40">
            <X size={24} />
          </button>
          <img src={viewingImage} alt="Fullscreen" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};
