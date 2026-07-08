'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface JadwalMurid {
  hari: string;
  jam: string;
}

interface JadwalMapel {
  minggu_ke: number;
  hari: string;
  program: string;
  mapel_1: string;
  mapel_2: string;
}

interface MuridProfil {
  username: string;
  nama: string;
  kelas: string;
  program: string;
  jadwal_les: string;
  bergabung: string;
}

interface JadwalHarian {
  hari: string;
  jam: string;
  mapel_1: string;
  mapel_2: string;
}

const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const hariSingkat = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function JadwalPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [jadwalMingguan, setJadwalMingguan] = useState<JadwalHarian[]>([]);
  const [profil, setProfil] = useState<MuridProfil | null>(null);
  const [mingguKe, setMingguKe] = useState(1);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Ambil profil murid (untuk tahu program)
      const profilRes = await fetch('/api/profil');
      if (!profilRes.ok) {
        if (profilRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Gagal ambil profil');
      }
      const profilData = await profilRes.json();
      setProfil(profilData.profil);

      // 2. Hitung minggu ke berapa
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      const minggu = Math.ceil((now.getDate()) / 7);
      setMingguKe(minggu);

      // 3. Ambil jadwal murid (hari dan jam)
      const jadwalRes = await fetch('/api/absensi?type=jadwal');
      if (!jadwalRes.ok) throw new Error('Gagal ambil jadwal');
      const jadwalData = await jadwalRes.json();

      // 4. Ambil jadwal mapel berdasarkan minggu dan program
      const mapelRes = await fetch(
        `/api/absensi?type=jadwal-mapel&minggu=${minggu}&program=${encodeURIComponent(profilData.profil.program)}`
      );
      if (!mapelRes.ok) throw new Error('Gagal ambil jadwal mapel');
      const mapelData = await mapelRes.json();

      // 5. Gabungkan jadwal murid dengan mapel
      const jadwalGabungan: JadwalHarian[] = [];
      
      jadwalData.jadwal.forEach((j: JadwalMurid) => {
        // Cari mapel untuk hari dan program yang sama
        const mapel = mapelData.jadwal.find(
          (m: JadwalMapel) => m.hari === j.hari && m.program === profilData.profil.program
        );

        if (mapel) {
          jadwalGabungan.push({
            hari: j.hari,
            jam: j.jam,
            mapel_1: mapel.mapel_1 || '-',
            mapel_2: mapel.mapel_2 || '-',
          });
        } else {
          // Jika tidak ada mapel, tampilkan placeholder
          jadwalGabungan.push({
            hari: j.hari,
            jam: j.jam,
            mapel_1: 'Mata Pelajaran',
            mapel_2: '',
          });
        }
      });

      // Urutkan berdasarkan hari (Senin = 1, Selasa = 2, dst)
      const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      jadwalGabungan.sort((a, b) => {
        return urutanHari.indexOf(a.hari) - urutanHari.indexOf(b.hari);
      });

      setJadwalMingguan(jadwalGabungan);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error fetching jadwal:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
                <p className="mt-4 text-gray-500">Memuat jadwal...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 lg:ml-0 min-h-screen">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="p-4 lg:p-8 max-w-6xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
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
          <div className="rounded-2xl p-5 shadow-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a4731] text-[19px]">
                📚 Jadwal Les {profil?.nama || ''}
              </h3>
              <div className="text-right">
                <p className="text-xs text-gray-500">{currentDate}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Minggu ke-{mingguKe} • {profil?.program || '-'}
                </p>
              </div>
            </div>

            {jadwalMingguan.length > 0 ? (
              <div className="space-y-2">
                {/* Header tabel */}
                <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-[#edf7f0] rounded-lg text-xs font-semibold text-[#1a4731]">
                  <div>Hari</div>
                  <div>Jam</div>
                  <div className="col-span-2">Mata Pelajaran</div>
                </div>

                {/* Data jadwal */}
                {jadwalMingguan.map((item, index) => {
                  const isToday = item.hari === hariIndo[new Date().getDay()];
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-4 gap-2 px-3 py-3 rounded-lg transition-all
                        ${isToday 
                          ? 'bg-green-50 border-l-4 border-green-600' 
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center">
                        <span className={`font-medium text-sm ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
                          {item.hari}
                          {isToday && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Hari Ini
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {item.jam}
                      </div>
                      <div className="col-span-2 flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#1a4731]">
                          {item.mapel_1}
                        </span>
                        {item.mapel_2 && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              {item.mapel_2}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 border-l-4 border-gray-300">
                <p className="font-medium text-gray-500 text-sm">
                  Tidak ada jadwal untuk minggu ini
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}