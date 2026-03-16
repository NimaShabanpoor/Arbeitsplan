import { useState } from 'react';
import { LogIn, ShieldCheck, UserRound } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(username.trim(), password);
    if (!ok) {
      setError('Ungueltige Anmeldedaten.');
      return;
    }
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-5">
          <h1 className="text-lg font-bold">Dienstplan Login</h1>
          <p className="text-xs text-slate-300 mt-1">Bitte anmelden, um den Dienstplan zu sehen.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Benutzername</label>
            <div className="relative">
              <UserRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z. B. admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Passwort</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Passwort"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
          >
            <LogIn className="w-4 h-4" /> Anmelden
          </button>

        </form>
      </div>
    </div>
  );
}
