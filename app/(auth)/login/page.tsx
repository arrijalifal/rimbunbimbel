'use client';

import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'Murid' | 'Guru'>('Murid');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch {
      // Tetap di halaman login
    }
  };
  checkAuth();
}, [router]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
          role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('login not okay');
        throw new Error(data.error || 'Login gagal');
      }

      router.push('/dashboard');
      router.refresh();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-login-gradient">
      <div className="glass-card w-full max-w-[500px] p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-mid/20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-green-dark">RB</span>
            </div>
          </div>
          <p className="text-green-dark font-semibold text-lg">Belajar Tumbuh Bersama</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-[15px] text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm font-semibold text-green-dark mb-3">
          Masuk sebagai
        </label>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['Murid', 'Guru'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-4 py-2.5 rounded-[15px] text-sm font-medium transition-all duration-200
                ${role === r 
                  ? 'active bg-gradient-to-br from-green-dark to-green-mid text-white border-2 border-green-mid' 
                  : 'role-btn-custom'}`}
            >
              {r}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-green-dark mb-2" htmlFor="username-input">
          Username
        </label>
        <div className="flex items-center mb-4 px-4 py-3 rounded-[15px] input-modern">
          <User className="w-[18px] h-[18px] text-green-sage mr-2.5 flex-shrink-0" />
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-green-dark placeholder-gray-400"
            placeholder="Masukkan username"
            disabled={loading}
          />
        </div>

        <label className="block text-sm font-medium text-green-dark mb-2" htmlFor="password-input">
          Password
        </label>
        <div className="flex items-center mb-2 px-4 py-3 rounded-[15px] input-modern">
          <Lock className="w-[18px] h-[18px] text-green-sage mr-2.5 flex-shrink-0" />
          <input
            id="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-green-dark placeholder-gray-400"
            placeholder="Masukkan password"
            disabled={loading}
          />
        </div>

        <div className="text-right mb-6">
          <button 
            type="button"
            className="text-xs text-green-mid hover:text-green-dark font-medium cursor-pointer transition"
          >
            Lupa Password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`login-gradient-btn w-full py-3.5 rounded-[15px] font-semibold text-white text-base
            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
          ) : (
            'Masuk'
          )}
        </button>
      </div>
    </div>
  );
}