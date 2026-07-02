'use client';

import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'Murid' | 'Guru'>('Murid');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.push('/dashboard');
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
          className="login-gradient-btn w-full py-3.5 rounded-[15px] font-semibold text-white text-base"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}