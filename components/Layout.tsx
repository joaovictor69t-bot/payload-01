import React from 'react';
import { ViewState } from '../types';
import { Home, History, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, view, setView, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        {children}
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-40 max-w-md mx-auto">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setView('DASHBOARD')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${view === 'DASHBOARD' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Home size={24} strokeWidth={view === 'DASHBOARD' ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">Início</span>
            </button>
            
            <button 
              onClick={() => setView('HISTORY')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${view === 'HISTORY' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <History size={24} strokeWidth={view === 'HISTORY' ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">Histórico</span>
            </button>

            <button 
              onClick={onLogout}
              className="flex flex-col items-center p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={24} />
              <span className="text-[10px] font-medium mt-1">Sair</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
