'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Award, TrendingUp, Users, BookOpen } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { announcementsData, attendanceData } from '@/lib/data';

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [statistics, setStatistics] = useState({
    attendancePercentage: 0,
    averageScore: 0,
    totalClasses: 0,
    attendedClasses: 0,
    upcomingClasses: 0,
  });

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );

    // Hitung statistik absensi
    const totalClasses = attendanceData.length;
    const attendedClasses = attendanceData.filter(a => a.status === 'Hadir').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    // Nilai rata-rata (dummy data untuk demo)
    const averageScore = 85.5;

    // Hitung kelas yang akan datang (berdasarkan jadwal hari ini dan seterusnya)
    const today = new Date().getDay();
    let upcomingCount = 0;
    for (let i = 0; i < 7; i++) {
      const day = (today + i) % 7;
      // Asumsikan ada jadwal di hari Senin, Rabu, Jumat
      if ([1, 3, 5].includes(day)) {
        upcomingCount++;
      }
    }

    setStatistics({
      attendancePercentage,
      averageScore,
      totalClasses,
      attendedClasses,
      upcomingClasses: upcomingCount,
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col min-h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-mid/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-dark">RB</span>
                </div>
              </div>
              <h1 className="text-center text-3xl font-bold text-[#1a4731] mb-2">Halo, Rina Permata 👋</h1>
              <p className="text-center text-lg text-[#74a892] font-medium mb-2">Belajar Tumbuh Bersama</p>
              <p className="text-center text-sm text-gray-500">{currentDate}</p>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card Absensi */}
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CalendarCheck className="w-5 h-5 text-green-mid" />
                  </div>
                  <span className="text-2xl font-bold text-green-dark">{statistics.attendancePercentage}%</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Tingkat Kehadiran</p>
                <p className="text-xs text-gray-400 mt-1">
                  {statistics.attendedClasses} dari {statistics.totalClasses} pertemuan
                </p>
              </div>

              {/* Card Nilai Rata-rata */}
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-dark">{statistics.averageScore}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Nilai Rata-rata</p>
                <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
              </div>

              {/* Card Total Pertemuan */}
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-dark">{statistics.totalClasses}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Pertemuan</p>
                <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
              </div>

              {/* Card Jadwal Mendatang */}
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-2xl font-bold text-green-dark">{statistics.upcomingClasses}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Jadwal Mendatang</p>
                <p className="text-xs text-gray-400 mt-1">7 hari ke depan</p>
              </div>
            </div>

            {/* Pengumuman Terbaru */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1a4731] text-[19px]">📢 Pengumuman Terbaru</h3>
                <button
                  type="button"
                  onClick={() => router.push('/pengumuman')}
                  className="text-xs text-[#2d6a4f] hover:text-[#1a4731] font-medium transition"
                >
                  Lihat Semua →
                </button>
              </div>
              <div className="rounded-xl p-4 shadow-sm space-y-2 bg-white">
                {announcementsData.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="flex gap-3 items-start pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 
                      ${announcement.priority === 'high' ? 'bg-[#2d6a4f]' : 'bg-[#74a892]'}`} 
                    />
                    <div>
                      <p className="text-sm font-medium text-[#1a4731]">{announcement.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{announcement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}