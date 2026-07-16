'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarCheck, 
  Award, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  FileText,
  UserCheck,
  UserPlus,
  Star,
  BarChart3
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { announcementsData } from '@/lib/data';

interface DashboardStats {
  // Untuk Murid
  totalPertemuan?: number;
  rataRataNilai?: number;
  jadwalMendatang?: number;
  nilaiTerbaik?: string;
  // Untuk Guru
  totalMurid?: number;
  totalPertemuanGuru?: number;
  pendingAbsensi?: number;
  totalNilaiDiisi?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // 2. Ambil data absensi
        const absensiRes = await fetch('/api/absensi?type=semua');
        const absensiData = absensiRes.ok ? await absensiRes.json() : { absensi: [] };
        const allAbsensi = absensiData.absensi || [];

        // 3. Ambil data nilai
        const nilaiRes = await fetch('/api/nilai');
        const nilaiData = nilaiRes.ok ? await nilaiRes.json() : { nilai: [] };
        const allNilai = nilaiData.nilai || [];

        // 4. Ambil data murid (untuk guru)
        let allMurid: any[] = [];
        if (meData.user?.role === 'Guru') {
          const muridRes = await fetch('/api/murid');
          if (muridRes.ok) {
            const muridData = await muridRes.json();
            allMurid = muridData.murid || [];
          }
        }

        // 5. Ambil jadwal murid (untuk murid)
        let jadwalMurid: any[] = [];
        if (meData.user?.role === 'Murid') {
          const jadwalRes = await fetch('/api/absensi?type=jadwal');
          if (jadwalRes.ok) {
            const jadwalData = await jadwalRes.json();
            jadwalMurid = jadwalData.jadwal || [];
          }
        }

        // ==================== HITUNG STATISTIK ====================
        
        if (meData.user?.role === 'Guru') {
          // === DASHBOARD GURU ===
          
          // Total murid
          const totalMurid = allMurid.length;

          // Total pertemuan yang diverifikasi oleh guru ini
          const totalPertemuanGuru = allAbsensi.filter(
            (a: any) => a.verifikasi_oleh === meData.user.username
          ).length;

          // Pending absensi (semua pending, bukan hanya milik guru)
          const pendingAbsensi = allAbsensi.filter(
            (a: any) => a.status === 'Pending'
          ).length;

          // Total nilai yang sudah diisi oleh guru ini
          const totalNilaiDiisi = allNilai.filter(
            (n: any) => n.pengajar === meData.user.username && n.nilai && n.nilai !== '-'
          ).length;

          setStats({
            totalMurid,
            totalPertemuanGuru,
            pendingAbsensi,
            totalNilaiDiisi,
          });

        } else {
          // === DASHBOARD MURID ===
          
          // Total pertemuan murid (dari absensi)
          const absensiMurid = allAbsensi.filter(
            (a: any) => a.username === meData.user.username
          );
          const totalPertemuan = absensiMurid.length;

          // Rata-rata nilai
          const nilaiMurid = allNilai.filter(
            (n: any) => n.username === meData.user.username && n.nilai && n.nilai !== '-'
          );
          const rataRataNilai = nilaiMurid.length > 0
            ? Math.round(nilaiMurid.reduce((acc: number, n: any) => acc + parseInt(n.nilai), 0) / nilaiMurid.length)
            : 0;

          // Jadwal mendatang (dari jadwal murid)
          const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const today = new Date().getDay();
          let upcomingCount = 0;
          for (let i = 1; i <= 7; i++) {
            const dayIndex = (today + i) % 7;
            const dayName = hariIndo[dayIndex];
            const hasJadwal = jadwalMurid.some((j: any) => j.hari === dayName);
            if (hasJadwal) {
              upcomingCount++;
              break;
            }
          }

          // Nilai terbaik (mapel dengan nilai tertinggi)
          let nilaiTerbaik = '-';
          if (nilaiMurid.length > 0) {
            const terbaik = nilaiMurid.reduce((a: any, b: any) => 
              parseInt(a.nilai) > parseInt(b.nilai) ? a : b
            );
            nilaiTerbaik = `${terbaik.mapel} (${terbaik.nilai})`;
          }

          setStats({
            totalPertemuan,
            rataRataNilai,
            jadwalMendatang: upcomingCount,
            nilaiTerbaik,
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set tanggal
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );

    fetchData();
  }, [router]);

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

  // ==================== TAMPILAN GURU ====================
  if (user?.role === 'Guru') {
    return (
      <div className="flex min-h-screen bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex flex-col overflow-y-auto">
            <div className="flex flex-col h-full gap-5">
              {/* Header */}
              <div className="mb-4 shrink-0">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-mid/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-dark">RB</span>
                  </div>
                </div>
                <h1 className="text-center text-3xl font-bold text-[#1a4731] mb-2">
                  Halo, {user?.username || 'Guru'} 👋
                </h1>
                <p className="text-center text-lg text-[#74a892] font-medium mb-2">
                  Selamat datang, Guru!
                </p>
                <p className="text-center text-sm text-gray-500">{currentDate}</p>
              </div>

              {/* Statistik Cards Guru */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalMurid || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Total Murid</p>
                  <p className="text-xs text-gray-400 mt-1">Murid yang terdaftar</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-mid" />
                    </div>
                    <span className="text-2xl font-bold text-green-mid">{stats.totalPertemuanGuru || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Total Pertemuan</p>
                  <p className="text-xs text-gray-400 mt-1">Yang telah diverifikasi</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">{stats.pendingAbsensi || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Pending Absensi</p>
                  <p className="text-xs text-gray-400 mt-1">Menunggu verifikasi</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{stats.totalNilaiDiisi || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Total Nilai Diisi</p>
                  <p className="text-xs text-gray-400 mt-1">Nilai yang sudah diberikan</p>
                </div>
              </div>

              {/* Tombol Cepat Guru */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <button
                  onClick={() => router.push('/absensi')}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-2 bg-green-mid rounded-lg text-white group-hover:scale-105 transition">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#1a4731] text-sm">Verifikasi Absensi</p>
                    <p className="text-xs text-gray-500">Konfirmasi kehadiran murid</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/laporan')}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-2 bg-blue-500 rounded-lg text-white group-hover:scale-105 transition">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#1a4731] text-sm">Kelola Nilai</p>
                    <p className="text-xs text-gray-500">Input dan edit nilai murid</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/pengumuman')}
                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-200 flex items-center gap-3 group"
                >
                  <div className="p-2 bg-purple-500 rounded-lg text-white group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#1a4731] text-sm">Pengumuman</p>
                    <p className="text-xs text-gray-500">Lihat pengumuman terbaru</p>
                  </div>
                </button>
              </div>

              {/* Pengumuman Terbaru */}
              <div className="mt-auto shrink-0">
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

  // ==================== TAMPILAN MURID ====================
  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-0">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex flex-col overflow-y-auto">
          <div className="flex flex-col h-full gap-5">
            {/* Header */}
            <div className="mb-4 shrink-0">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-mid/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-dark">RB</span>
                </div>
              </div>
              <h1 className="text-center text-3xl font-bold text-[#1a4731] mb-2">
                Halo, {user?.username || 'Pengguna'} 👋
              </h1>
              <p className="text-center text-lg text-[#74a892] font-medium mb-2">
                Belajar Tumbuh Bersama
              </p>
              <p className="text-center text-sm text-gray-500">{currentDate}</p>
            </div>

            {/* Statistik Cards Murid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-mid" />
                  </div>
                  <span className="text-2xl font-bold text-green-dark">{stats.totalPertemuan || 0}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Pertemuan</p>
                <p className="text-xs text-gray-400 mt-1">Pertemuan yang telah diikuti</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.rataRataNilai || 0}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Rata-rata Nilai</p>
                <p className="text-xs text-gray-400 mt-1">Dari semua mata pelajaran</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-2xl font-bold text-orange-500">{stats.jadwalMendatang || 0}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Jadwal Mendatang</p>
                <p className="text-xs text-gray-400 mt-1">Pertemuan berikutnya</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-sm font-bold text-yellow-600 truncate max-w-[200px]">
                    {stats.nilaiTerbaik || '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Nilai Terbaik</p>
                <p className="text-xs text-gray-400 mt-1">Mapel dengan nilai tertinggi</p>
              </div>
            </div>

            {/* Pengumuman Terbaru */}
            <div className="mt-auto shrink-0">
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