'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import GuruAbsensiView from './components/GuruAbsensiView';
import MuridAbsensiView from './components/MuridAbsensiView';

export default function AbsensiPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<'Murid' | 'Guru'>('Murid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil data user dari API auth
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          // Jika tidak terautentikasi, redirect ke login
          router.push('/login');
          return;
        }

        const data = await response.json();
        
        // Set role dari data user
        if (data.user && data.user.role) {
          setUserRole(data.user.role as 'Murid' | 'Guru');
        } else {
          // Fallback ke Murid jika role tidak ada
          setUserRole('Murid');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Jika error, redirect ke login
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

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