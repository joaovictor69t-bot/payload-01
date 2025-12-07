import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'USER' | 'ADMIN'>('USER');
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (username === 'admin' && password === 'evri01') {
      const adminUser: User = {
        username: 'admin',
        role: UserRole.ADMIN,
        createdAt: Date.now()
      };
      // Store current user in session
      localStorage.setItem('payload_session', JSON.stringify(adminUser));
      onLogin(adminUser);
    } else {
      setError('Credenciais de administrador inválidas.');
    }
  };

  const handleUserAuth = () => {
    if (!username || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('payload_users') || '{}');

    if (mode === 'REGISTER') {
      if (storedUsers[username]) {
        setError('Usuário já existe.');
        return;
      }
      const newUser: User = { username, role: UserRole.USER, createdAt: Date.now() };
      // Save user credential "mock"
      storedUsers[username] = { ...newUser, password }; // simple insecure storage for demo
      localStorage.setItem('payload_users', JSON.stringify(storedUsers));
      
      // Auto login after register
      localStorage.setItem('payload_session', JSON.stringify(newUser));
      onLogin(newUser);
    } else {
      // Login
      const user = storedUsers[username];
      if (user && user.password === password) {
        const sessionUser: User = { username: user.username, role: UserRole.USER, createdAt: user.createdAt };
        localStorage.setItem('payload_session', JSON.stringify(sessionUser));
        onLogin(sessionUser);
      } else {
        setError('Usuário ou senha incorretos.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (activeTab === 'ADMIN') {
      handleAdminLogin();
    } else {
      handleUserAuth();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header / Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setActiveTab('USER'); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'USER' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <UserIcon size={18} /> Usuário
          </button>
          <button
            onClick={() => { setActiveTab('ADMIN'); setError(''); }}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'ADMIN' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={18} /> Administrador
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/40">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Payload</h1>
            <p className="text-slate-500 text-sm mt-1">Gestão inteligente de entregas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Usuário" 
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input 
              label="Senha" 
              type="password" 
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <Lock size={16} /> {error}
              </div>
            )}

            <Button fullWidth type="submit">
              {activeTab === 'ADMIN' ? 'Entrar como Admin' : (mode === 'LOGIN' ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          {activeTab === 'USER' && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }}
                className="text-sm text-brand-600 font-medium hover:underline"
              >
                {mode === 'LOGIN' ? 'Não tem conta? Crie agora' : 'Já tem conta? Fazer Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};