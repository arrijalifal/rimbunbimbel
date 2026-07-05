'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfil = async () => {
      try {
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f4faf6] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f4faf6] items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="flex min-h-screen bg-[#f4faf6] items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Data profil tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="rounded-2xl p-6 shadow-md text-center bg-white">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image
                src="https://images.pexels.com/photos/31274806/pexels-photo-31274806.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Profile photo"
                fill
                className="rounded-full object-cover shadow-md"
              />
            </div>
            <h2 className="text-xl font-bold text-[#1a4731]">{profil.nama}</h2>
            <p className="text-sm text-[#74a892] mt-1">{profil.kelas}</p>

            <div className="mt-6 text-left space-y-3 max-w-xs mx-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Username</span>
                <span className="font-medium">{profil.username}</span>
              </div>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}