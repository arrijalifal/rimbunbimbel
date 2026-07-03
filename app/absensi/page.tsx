'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import GuruAbsensiView from './components/GuruAbsensiView';
import MuridAbsensiView from './components/MuridAbsensiView';

// Dummy data untuk role (nanti diganti dengan data dari authentication)
// Untuk testing: ganti 'Guru' menjadi 'Murid' untuk melihat tampilan murid
const USER_ROLE = 'Murid';

export default function AbsensiPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<'Murid' | 'Guru'>('Murid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi get user role dari auth context / localStorage
    const getUserRole = () => {
      // Dalam implementasi nyata, ambil dari:
      // 1. Context API (useContext)
      // 2. Zustand/Redux store
      // 3. localStorage/sessionStorage
      // 4. NextAuth.js session
      const role = localStorage.getItem('userRole') || USER_ROLE;
      return role as 'Murid' | 'Guru';
    };

    setUserRole(getUserRole());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 lg:ml-0 min-h-screen">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="p-4 lg:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-green-mid border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-500">Memuat data...</p>
              </div>
            </div>
          </main>
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
          {userRole === 'Guru' ? (
            <GuruAbsensiView />
          ) : (
            <MuridAbsensiView />
          )}
        </main>
      </div>
    </div>
  );
}