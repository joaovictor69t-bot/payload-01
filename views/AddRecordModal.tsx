import React, { useState, useEffect } from 'react';
import { RecordType, DeliveryRecord } from '../types';
import { calculateIndividualValue, calculateDailyValue, fileToBase64, formatCurrency, generateId } from '../utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface AddRecordModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DeliveryRecord) => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ userId, isOpen, onClose, onSave }) => {
  const [type, setType] = useState<RecordType>(RecordType.INDIVIDUAL);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Individual Fields
  const [indId, setIndId] = useState('');
  const [indParcels, setIndParcels] = useState<string>('');
  const [indCollections, setIndCollections] = useState<string>('');

  // Daily Fields
  const [dailyId1, setDailyId1] = useState('');
  const [dailyId2, setDailyId2] = useState('');
  const [dailyTotalParcels, setDailyTotalParcels] = useState<string>('');

  // Common
  const [photos, setPhotos] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(0);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setType(RecordType.INDIVIDUAL);
      setDate(new Date().toISOString().split('T')[0]);
      setIndId('');
      setIndParcels('');
      setIndCollections('');
      setDailyId1('');
      setDailyId2('');
      setDailyTotalParcels('');
      setPhotos([]);
    }
  }, [isOpen]);

  // Calculate value effect
  useEffect(() => {
    if (type === RecordType.INDIVIDUAL) {
      const p = parseInt(indParcels) || 0;
      const c = parseInt(indCollections) || 0;
      setEstimatedValue(calculateIndividualValue(p, c));
    } else {
      const p = parseInt(dailyTotalParcels) || 0;
      const idCount = (dailyId1 ? 1 : 0) + (dailyId2 ? 1 : 0);
      setEstimatedValue(calculateDailyValue(idCount || 1, p)); // Default to 1 ID for preview if none typed
    }
  }, [type, indParcels, indCollections, dailyId1, dailyId2, dailyTotalParcels]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsProcessingImages(true);
      const newPhotos: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        try {
          const base64 = await fileToBase64(e.target.files[i]);
          newPhotos.push(base64);
        } catch (err) {
          console.error("Failed to process image", err);
        }
      }
      setPhotos(prev => [...prev, ...newPhotos]);
      setIsProcessingImages(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const record: DeliveryRecord = {
      id: generateId(),
      userId,
      date,
      type,
      photos,
      calculatedValue: estimatedValue,
      createdAt: Date.now()
    };

    if (type === RecordType.INDIVIDUAL) {
      record.individualId = indId;
      record.parcels = parseInt(indParcels) || 0;
      record.collections = parseInt(indCollections) || 0;
    } else {
      const ids = [];
      if (dailyId1) ids.push(dailyId1);
      if (dailyId2) ids.push(dailyId2);
      record.dailyIds = ids;
      record.totalParcels = parseInt(dailyTotalParcels) || 0;
    }

    onSave(record);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-slide-up">
        
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold">Novo Registro</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType(RecordType.INDIVIDUAL)}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${type === RecordType.INDIVIDUAL ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setType(RecordType.DAILY)}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${type === RecordType.DAILY ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
            >
              Diária
            </button>
          </div>

          <Input type="date" label="Data" value={date} onChange={e => setDate(e.target.value)} required />

          {type === RecordType.INDIVIDUAL ? (
            <div className="space-y-4 animate-fade-in">
              <Input label="ID" placeholder="Ex: A123" value={indId} onChange={e => setIndId(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Parcelas (£1.00)" 
                  type="number" 
                  min="0"
                  value={indParcels} 
                  onChange={e => setIndParcels(e.target.value)} 
                  required 
                />
                <Input 
                  label="Coletas (£0.80)" 
                  type="number" 
                  min="0"
                  value={indCollections} 
                  onChange={e => setIndCollections(e.target.value)} 
                  required 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Input label="ID 1" placeholder="Ex: RT55" value={dailyId1} onChange={e => setDailyId1(e.target.value)} required />
                <Input label="ID 2 (Opcional)" placeholder="Ex: GT99" value={dailyId2} onChange={e => setDailyId2(e.target.value)} />
              </div>
              <Input 
                label="Total Parcelas" 
                type="number" 
                min="0"
                value={dailyTotalParcels} 
                onChange={e => setDailyTotalParcels(e.target.value)} 
                required 
              />
              <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
                <p className="font-semibold mb-1">Regras Diária:</p>
                <ul className="list-disc pl-4 space-y-1 opacity-80">
                  <li>1 ID: £180 fixo</li>
                  <li>2 IDs: &lt;150 (£260), 150-250 (£300), &gt;250 (£360)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Comprovantes / Fotos</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {photos.map((p, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={p} alt="proof" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-brand-500 hover:text-brand-500 transition-colors">
                <Upload size={20} />
                <span className="text-[10px] mt-1">Add</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {isProcessingImages && <p className="text-xs text-brand-600 animate-pulse">Processando imagens...</p>}
          </div>

          {/* Footer Logic */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Valor Estimado</p>
              <p className="text-2xl font-bold text-brand-600">{formatCurrency(estimatedValue)}</p>
            </div>
            <Button type="submit" disabled={isProcessingImages} className="px-8">
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
