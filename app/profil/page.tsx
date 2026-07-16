'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface ProfilData {
  username: string;
  nama: string;
  kelas: string;
  program: string;
  jadwal_les: string;
  bergabung: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        // 1. Ambil role user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserRole(meData.user?.role || 'Murid');

        // 2. Ambil data profil
        const response = await fetch('/api/profil');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Gagal mengambil data profil');
        }

        const data = await response.json();
        setProfil(data.profil);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error('Error fetching profil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [router]);

  // ✅ Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (nama: string) => {
    if (!nama) return '?';
    const words = nama.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // ✅ Fungsi untuk mendapatkan warna background berdasarkan username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-mid border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              Data profil tidak ditemukan
            </div>
          </main>
        </div>
      </div>
    );
  }

  const initials = getInitials(profil.nama || profil.username);
  const avatarColor = getAvatarColor(profil.username);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex flex-col overflow-hidden">
          <div className="flex flex-col h-full gap-5">
            <div className="rounded-2xl p-6 shadow-md text-center bg-white flex flex-col items-center">
              {/* ✅ Avatar Inisial */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md ${avatarColor}`}>
                {initials}
              </div>

              <h2 className="text-xl font-bold text-[#1a4731] mt-4">{profil.nama}</h2>

              {/* ✅ Tampilkan role di bawah nama */}
              <p className="text-sm text-[#74a892] mt-1">
                {userRole === 'Guru' ? '👨‍🏫 Guru' : profil.kelas}
              </p>

              <div className="mt-6 text-left space-y-3 max-w-xs mx-auto w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Username</span>
                  <span className="font-medium">{profil.username}</span>
                </div>

                {/* ✅ Tampilkan role di profil */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${userRole === 'Guru'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                    {userRole || 'Murid'}
                  </span>
                </div>

                {/* ✅ Hanya tampilkan kelas, program, jadwal les untuk murid */}
                {userRole !== 'Guru' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Kelas</span>
                      <span className="font-medium">{profil.kelas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Program</span>
                      <span className="font-medium">{profil.program}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Jadwal Les</span>
                      <span className="font-medium">{profil.jadwal_les}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bergabung</span>
                      <span className="font-medium">{profil.bergabung}</span>
                    </div>
                  </>
                )}

                {/* ✅ Untuk guru, tampilkan informasi tambahan */}
                {userRole === 'Guru' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-green-600">Aktif</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Terdaftar Sejak</span>
                      <span className="font-medium">{profil.bergabung || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}