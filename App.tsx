import React, { useState, useEffect } from 'react';
import { User, UserRole, DeliveryRecord, ViewState } from './types';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { HistoryView } from './views/HistoryView';
import { AdminView } from './views/AdminView';
import { AddRecordModal } from './views/AddRecordModal';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LOGIN');
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize: Check session
  useEffect(() => {
    const session = localStorage.getItem('payload_session');
    if (session) {
      const parsedUser = JSON.parse(session);
      handleLogin(parsedUser);
    }
  }, []);

  // Load Records on login
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('payload_records');
      if (stored) {
        let allRecords = JSON.parse(stored) as DeliveryRecord[];
        if (user.role === UserRole.USER) {
          // Filter for current user only
          setRecords(allRecords.filter(r => r.userId === user.username));
        } else {
          // Admin sees all
          setRecords(allRecords);
        }
      }
    }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === UserRole.ADMIN) {
      setView('ADMIN');
    } else {
      setView('DASHBOARD');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('payload_session');
    setUser(null);
    setView('LOGIN');
    setRecords([]);
  };

  const handleSaveRecord = (newRecord: DeliveryRecord) => {
    const stored = localStorage.getItem('payload_records');
    const currentRecords = stored ? JSON.parse(stored) : [];
    const updatedRecords = [newRecord, ...currentRecords];
    
    // Save to global storage
    localStorage.setItem('payload_records', JSON.stringify(updatedRecords));
    
    // Update local state (User view only sees their own)
    setRecords(prev => [newRecord, ...prev]);
  };

  if (!user || view === 'LOGIN') {
    return <AuthView onLogin={handleLogin} />;
  }

  if (view === 'ADMIN') {
    return <AdminView onLogout={handleLogout} allRecords={records} />;
  }

  return (
    <Layout view={view} setView={setView} onLogout={handleLogout}>
      {view === 'DASHBOARD' && (
        <DashboardView 
          records={records} 
          onAddRecord={() => setIsModalOpen(true)} 
        />
      )}
      
      {view === 'HISTORY' && (
        <HistoryView records={records} />
      )}

      <AddRecordModal 
        userId={user.username}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
      />
    </Layout>
  );
};

export default App;
