'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Check, Calendar, Users, Megaphone } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface Pengumuman {
  timestamp: string;
  program: string;
  pengumuman: string;
  rowIndex: number;
}

export default function PengumumanPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProgram, setUserProgram] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk modal tambah pengumuman (guru)
  const [showModal, setShowModal] = useState(false);
  const [newProgram, setNewProgram] = useState('');
  const [newPengumuman, setNewPengumuman] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Ambil role user
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      const role = meData.user?.role || 'Murid';
      setUserRole(role);

      // 2. Ambil program murid (jika murid) - ✅ TUNGGU SAMPAI SELESAI
      let program = '';
      if (role === 'Murid') {
        const profilRes = await fetch('/api/profil');
        if (profilRes.ok) {
          const profilData = await profilRes.json();
          program = profilData.profil?.program || '';
          setUserProgram(program); // ✅ SET STATE
        }
      }

      // 3. Ambil semua pengumuman
      const pengumumanRes = await fetch('/api/pengumuman');
      if (!pengumumanRes.ok) throw new Error('Gagal ambil pengumuman');
      const pengumumanData = await pengumumanRes.json();

      // 4. Filter pengumuman berdasarkan program - ✅ PAKAI VARIABLE program (bukan state)
      let filtered = pengumumanData.pengumuman || [];
      if (role === 'Murid' && program) {
        filtered = filtered.filter((p: Pengumuman) => p.program === program);
        // ✅ HANYA TAMPILKAN YANG SAMA PERSIS
      }

      setPengumuman(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tambah pengumuman (guru)
  const handleAddPengumuman = async () => {
    if (!newProgram || !newPengumuman) {
      setError('Program dan pengumuman wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program: newProgram,
          pengumuman: newPengumuman,
        }),
      });

      if (!response.ok) throw new Error('Gagal menambah pengumuman');

      setShowModal(false);
      setNewProgram('');
      setNewPengumuman('');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah');
    } finally {
      setIsSubmitting(false);
    }
    
  };

  // Handle hapus pengumuman (guru)
  const handleDeletePengumuman = async (rowIndex: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;

    try {
      const response = await fetch(`/api/pengumuman?rowIndex=${rowIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Gagal menghapus pengumuman');

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus');
    }
  };

  // Format tanggal
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-mid border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat pengumuman...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex flex-col overflow-hidden">
          <div className="flex flex-col h-full gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-[#1a4731] flex items-center gap-2">
                  <Megaphone className="w-7 h-7 text-green-mid" />
                  Pengumuman
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {userRole === 'Guru'
                    ? 'Kelola pengumuman untuk semua program'
                    : `Pengumuman untuk program ${userProgram || 'Anda'}`
                  }
                </p>
              </div>
              {userRole === 'Guru' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-mid text-white rounded-xl text-sm font-medium hover:bg-green-dark transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Pengumuman
                </button>
              )}
            </div>

            {/* Daftar Pengumuman */}
            <div className="bg-white rounded-2xl shadow-md flex flex-col flex-1 overflow-hidden">
              <div className="overflow-auto flex-1 p-5">
                {pengumuman.length > 0 ? (
                  <div className="space-y-4">
                    {pengumuman.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-[#edf7f0] border-l-4 border-[#2d6a4f] relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-8">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-medium text-[#2d6a4f] bg-white/60 px-2 py-0.5 rounded-full">
                                {item.program}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {item.pengumuman}
                            </p>
                          </div>
                          {userRole === 'Guru' && (
                            <button
                              onClick={() => handleDeletePengumuman(item.rowIndex)}
                              className="text-gray-400 hover:text-red-500 transition p-1"
                              title="Hapus pengumuman"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Megaphone className="w-16 h-16 mb-3 opacity-30" />
                    <p className="text-sm">Belum ada pengumuman</p>
                    <p className="text-xs mt-1">{userRole === 'Guru' ? 'Klik tombol Tambah Pengumuman' : 'Pantau terus untuk informasi terbaru'}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 bg-[#f8fbf9] border-t border-[#e8f3ec] text-xs text-gray-500 shrink-0">
                Menampilkan {pengumuman.length} pengumuman
                {userRole === 'Murid' && userProgram && ` • Program: ${userProgram}`}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah Pengumuman (Guru) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1a4731]">Tambah Pengumuman</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                >
                  <option value="">Pilih Program</option>
                  <option value="Semua">Semua Program</option>
                  <option value="Calistung">Calistung</option>
                  <option value="Akademik SD/SMP">Akademik SD/SMP</option>
                </select>
              </div>

              {/* Pengumuman */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newPengumuman}
                  onChange={(e) => setNewPengumuman(e.target.value)}
                  rows={4}
                  placeholder="Tulis pengumuman..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddPengumuman}
                  disabled={isSubmitting || !newProgram || !newPengumuman}
                  className="flex-1 px-4 py-2 rounded-xl bg-green-mid text-white hover:bg-green-dark transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}