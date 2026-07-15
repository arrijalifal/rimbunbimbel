'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BookOpen,
  Star,
  FileText,
  Edit,
  Save,
  X,
  Users,
  Lock
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface NilaiMurid {
  username: string;
  tanggal: string;
  hari: string;
  mapel: string;
  pengajar: string;
  nilai: string;
  predikat: string; // ✅ Tambahkan ini
  catatan: string;
}

interface MuridData {
  username: string;
  nama: string;
  kelas: string;
}

export default function LaporanPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<'Murid' | 'Guru' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk data
  const [nilaiData, setNilaiData] = useState<NilaiMurid[]>([]);
  const [muridData, setMuridData] = useState<Record<string, MuridData>>({});
  const [filteredData, setFilteredData] = useState<NilaiMurid[]>([]);

  // State untuk filter & search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('Semua');
  const [selectedMurid, setSelectedMurid] = useState('Semua');

  // State untuk edit
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editNilai, setEditNilai] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk sorting
  const [sortField, setSortField] = useState<'tanggal' | 'nilai'>('tanggal');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

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
      setUserRole(meData.user?.role || 'Murid');
      setCurrentUser(meData.user);

      // 2. Ambil data nilai
      const nilaiRes = await fetch('/api/nilai');
      if (!nilaiRes.ok) throw new Error('Gagal ambil data nilai');
      const nilaiData = await nilaiRes.json();
      setNilaiData(nilaiData.nilai || []);
      setFilteredData(nilaiData.nilai || []);

      // 3. Ambil data murid (untuk guru)
      if (meData.user?.role === 'Guru') {
        const muridRes = await fetch('/api/murid');
        if (muridRes.ok) {
          const muridData = await muridRes.json();
          const muridMap: Record<string, MuridData> = {};
          muridData.murid.forEach((m: any) => {
            muridMap[m.username] = m;
          });
          setMuridData(muridMap);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data
  useEffect(() => {
    let result = [...nilaiData];

    // Filter berdasarkan role
    if (userRole === 'Murid') {
      // Murid hanya lihat nilainya sendiri
      // Filter sudah dilakukan di API
    }

    // Search
    if (searchTerm) {
      result = result.filter(item =>
        item.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pengajar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.catatan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter mapel
    if (selectedMapel !== 'Semua') {
      result = result.filter(item => item.mapel === selectedMapel);
    }

    // Filter murid (khusus guru)
    if (selectedMurid !== 'Semua' && userRole === 'Guru') {
      result = result.filter(item => item.username === selectedMurid);
    }

    // ✅ TAMBAHKAN INI - Sort default (terbaru di atas) sebelum sorting manual
    // Ini akan jalan setiap kali data berubah, termasuk pertama kali load
    result.sort((a, b) => {
      // Default: urutkan berdasarkan tanggal terbaru
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      return dateB - dateA; // DESC (terbaru di atas)
    });

    // ✅ TAMBAHKAN INI - Sorting manual berdasarkan tombol
    // Sorting ini akan menimpa sorting default jika user mengklik tombol sort
    if (sortField === 'tanggal') {
      result.sort((a, b) => {
        const comparison = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else if (sortField === 'nilai') {
      result.sort((a, b) => {
        const valA = parseInt(a.nilai) || 0;
        const valB = parseInt(b.nilai) || 0;
        const comparison = valA - valB;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(result);
  }, [nilaiData, searchTerm, selectedMapel, selectedMurid, sortField, sortDirection, userRole]);

  // Handle edit
  const handleEdit = (item: NilaiMurid) => {
    const key = getRowKey(item);
    setEditingRow(key);
    setEditNilai(item.nilai || '');
    setEditCatatan(item.catatan || '');
  };

  const handleSave = async (item: NilaiMurid) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/nilai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: item.username,
          tanggal: item.tanggal,
          mapel: item.mapel,
          nilai: editNilai,
          catatan: editCatatan,
        }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan nilai');

      // ✅ Hitung predikat dari nilai yang di-edit
      const nilaiNum = parseInt(editNilai);
      const predikatBaru = editNilai && !isNaN(nilaiNum) ? getPredikat(nilaiNum) : '-';

      // Update local data - cari berdasarkan username + tanggal + mapel
      const updatedData = nilaiData.map(data => {
        if (data.username === item.username &&
          data.tanggal === item.tanggal &&
          data.mapel === item.mapel) {
          return {
            ...data,
            nilai: editNilai,
            predikat: predikatBaru, // ✅ Tambahkan ini
            catatan: editCatatan,
          };
        }
        return data;
      });

      setNilaiData(updatedData);
      setEditingRow(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditNilai('');
    setEditCatatan('');
  };

  // Handle sort
  const handleSort = (field: 'tanggal' | 'nilai') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Hitung statistik
  const totalData = filteredData.length;
  const averageNilai = totalData > 0
    ? Math.round(filteredData.reduce((acc, item) => acc + (parseInt(item.nilai) || 0), 0) / totalData)
    : 0;
  const highestNilai = totalData > 0
    ? Math.max(...filteredData.map(item => parseInt(item.nilai) || 0))
    : 0;
  const lowestNilai = totalData > 0
    ? Math.min(...filteredData.map(item => parseInt(item.nilai) || 0))
    : 0;

  // Get predikat
  const getPredikat = (nilai: number) => {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    return 'D';
  };

  const getPredikatColor = (predikat: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-700',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-700',
    };
    return colors[predikat] || 'bg-gray-100 text-gray-600';
  };

  // Dapatkan daftar mapel unik untuk filter
  const mapelList = ['Semua', ...new Set(nilaiData.map(item => item.mapel))];

  // Dapatkan daftar murid unik untuk filter (guru)
  const muridList = ['Semua', ...new Set(nilaiData.map(item => item.username))];

  const getRowKey = (item: NilaiMurid) => {
    return `${item.username}-${item.tanggal}-${item.mapel}`;
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
              <p className="mt-4 text-gray-500">Memuat data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==================== TAMPILAN GURU ====================
  if (userRole === 'Guru') {
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
                    <BarChart3 className="w-7 h-7 text-green-mid" />
                    Penilaian Murid
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola nilai dan catatan perkembangan murid
                  </p>
                </div>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Total Data</p>
                      <p className="text-2xl font-bold text-gray-800">{totalData}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Rata-rata Nilai</p>
                      <p className="text-2xl font-bold text-green-600">{averageNilai}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Nilai Tertinggi</p>
                      <p className="text-2xl font-bold text-yellow-600">{highestNilai}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-500 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Nilai Terendah</p>
                      <p className="text-2xl font-bold text-red-600">{lowestNilai}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white rounded-2xl p-4 shadow-md shrink-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari mapel, pengajar, atau catatan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedMapel}
                      onChange={(e) => setSelectedMapel(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid bg-white"
                    >
                      {mapelList.map((mapel) => (
                        <option key={mapel} value={mapel}>{mapel}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedMurid}
                      onChange={(e) => setSelectedMurid(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid bg-white"
                    >
                      {muridList.map((username) => (
                        <option key={username} value={username}>
                          {username === 'Semua' ? 'Semua Murid' : (muridData[username]?.nama || username)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabel Penilaian Guru */}
              <div className="bg-white rounded-2xl shadow-md flex flex-col flex-1 overflow-hidden">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-[#f0f7f3]">
                      <tr className="border-b-2 border-[#e8f3ec]">
                        <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">No</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Murid</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Kelas</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">
                          <button onClick={() => handleSort('tanggal')} className="flex items-center gap-1 hover:text-green-mid">
                            Tanggal {sortField === 'tanggal' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Mapel</th>
                        <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">
                          <button onClick={() => handleSort('nilai')} className="flex items-center gap-1 hover:text-green-mid mx-auto">
                            Nilai {sortField === 'nilai' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">Predikat</th>
                        <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Catatan</th>
                        <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const murid = muridData[item.username];
                          const rowKey = getRowKey(item);
                          const isEditing = editingRow === rowKey;
                          const nilaiNum = parseInt(item.nilai) || 0;

                          const canEdit = userRole === 'Guru' && item.pengajar === currentUser?.username;

                          return (
                            <tr key={index} className="border-b border-[#f0f7f3] hover:bg-[#f8fbf9] transition-colors">
                              <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-700">
                                {murid?.nama || item.username}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{murid?.kelas || '-'}</td>
                              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{item.mapel}</td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editNilai}
                                    onChange={(e) => setEditNilai(e.target.value)}
                                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                                  />
                                ) : (
                                  <span className={`font-bold ${nilaiNum >= 80 ? 'text-green-600' : nilaiNum >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {item.nilai || '-'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  // Saat edit, predikat otomatis terhitung dari nilai
                                  <span className="text-sm text-gray-400">
                                    {editNilai ? getPredikat(parseInt(editNilai)) : '-'}
                                  </span>
                                ) : (
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPredikatColor(item.predikat)}`}>
                                    {item.predikat || '-'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCatatan}
                                    onChange={(e) => setEditCatatan(e.target.value)}
                                    placeholder="Catatan..."
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                                  />
                                ) : (
                                  <span className="text-gray-500 text-xs">{item.catatan || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleSave(item)}
                                      disabled={isSubmitting}
                                      className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition text-green-600 disabled:opacity-50"
                                      title="Simpan"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={handleCancel}
                                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition text-red-600"
                                      title="Batal"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : canEdit ? (
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-blue-600"
                                    title="Edit Nilai"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                                    <Lock className="w-3 h-3" />
                                    <span>Diajar oleh {item.pengajar}</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <BarChart3 className="w-12 h-12 text-gray-300" />
                              <p>Belum ada data nilai</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-[#f8fbf9] border-t border-[#e8f3ec] text-xs text-gray-500 shrink-0">
                  Menampilkan {filteredData.length} data
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
                  <BarChart3 className="w-7 h-7 text-green-mid" />
                  Laporan Belajar
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rekap nilai dan perkembangan belajar Anda
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-mid text-white rounded-xl text-sm font-medium hover:bg-green-dark transition">
                <Download className="w-4 h-4" />
                Download Laporan
              </button>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Data</p>
                    <p className="text-2xl font-bold text-gray-800">{totalData}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Nilai Rata-rata</p>
                    <p className="text-2xl font-bold text-green-600">{averageNilai}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500 opacity-50" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Predikat: {getPredikat(averageNilai)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Nilai Tertinggi</p>
                    <p className="text-2xl font-bold text-yellow-600">{highestNilai}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Nilai Terendah</p>
                    <p className="text-2xl font-bold text-red-600">{lowestNilai}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-md shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari mata pelajaran, pengajar, atau catatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedMapel}
                    onChange={(e) => setSelectedMapel(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid bg-white"
                  >
                    {mapelList.map((mapel) => (
                      <option key={mapel} value={mapel}>{mapel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabel Laporan Murid */}
            <div className="bg-white rounded-2xl shadow-md flex flex-col flex-1 overflow-hidden">
              <div className="overflow-auto flex-1">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#f0f7f3]">
                    <tr className="border-b-2 border-[#e8f3ec]">
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">
                        <button onClick={() => handleSort('tanggal')} className="flex items-center gap-1 hover:text-green-mid">
                          Tanggal {sortField === 'tanggal' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Pengajar</th>
                      <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">
                        <button onClick={() => handleSort('nilai')} className="flex items-center gap-1 hover:text-green-mid mx-auto">
                          Nilai {sortField === 'nilai' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">Predikat</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Catatan</th>
                      <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => {
                        const nilaiNum = parseInt(item.nilai) || 0;
                        const predikat = getPredikat(nilaiNum);
                        return (
                          <tr key={index} className="border-b border-[#f0f7f3] hover:bg-[#f8fbf9] transition-colors">
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-700">{item.mapel}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{item.pengajar || '-'}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-800">
                              {item.nilai || '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.nilai && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPredikatColor(predikat)}`}>
                                  {predikat}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{item.catatan || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              {item.nilai && (
                                <div className="flex items-center justify-center">
                                  {nilaiNum >= 90 ? <Star className="w-4 h-4 text-yellow-500" /> :
                                    nilaiNum >= 80 ? <TrendingUp className="w-4 h-4 text-green-500" /> :
                                      nilaiNum >= 70 ? <Minus className="w-4 h-4 text-yellow-500" /> :
                                        <TrendingDown className="w-4 h-4 text-red-500" />}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <BarChart3 className="w-12 h-12 text-gray-300" />
                            <p>Tidak ada data laporan yang ditemukan</p>
                            <p className="text-xs text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-[#f8fbf9] border-t border-[#e8f3ec] flex justify-between items-center text-xs text-gray-500 shrink-0">
                <span>Menampilkan {filteredData.length} data</span>
                {filteredData.length > 0 && (
                  <span>Rata-rata: {Math.round(filteredData.reduce((acc, item) => acc + (parseInt(item.nilai) || 0), 0) / filteredData.length)}</span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}