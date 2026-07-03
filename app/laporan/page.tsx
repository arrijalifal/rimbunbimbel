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
  FileText
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

// Dummy data laporan belajar
const reportData = [
  { 
    id: 1, 
    tanggal: '2026-07-03', 
    matpel: 'Matematika', 
    nilai: 92, 
    predikat: 'A',
    keterangan: 'Sangat Baik',
    guru: 'Dr. Ahmad Fauzi, M.Pd.'
  },
  { 
    id: 2, 
    tanggal: '2026-07-02', 
    matpel: 'Fisika', 
    nilai: 85, 
    predikat: 'B+',
    keterangan: 'Baik',
    guru: 'Dra. Siti Rahayu, M.Si.'
  },
  { 
    id: 3, 
    tanggal: '2026-07-01', 
    matpel: 'Bahasa Inggris', 
    nilai: 78, 
    predikat: 'B',
    keterangan: 'Cukup',
    guru: 'Budi Santoso, S.Pd.'
  },
  { 
    id: 4, 
    tanggal: '2026-06-30', 
    matpel: 'Kimia', 
    nilai: 88, 
    predikat: 'A-',
    keterangan: 'Baik',
    guru: 'Dewi Lestari, S.Si.'
  },
  { 
    id: 5, 
    tanggal: '2026-06-29', 
    matpel: 'Biologi', 
    nilai: 95, 
    predikat: 'A',
    keterangan: 'Sangat Baik',
    guru: 'Dr. Rizky Ramadhan, M.Kom.'
  },
  { 
    id: 6, 
    tanggal: '2026-06-28', 
    matpel: 'Matematika', 
    nilai: 70, 
    predikat: 'C+',
    keterangan: 'Cukup',
    guru: 'Dr. Ahmad Fauzi, M.Pd.'
  },
  { 
    id: 7, 
    tanggal: '2026-06-27', 
    matpel: 'Fisika', 
    nilai: 82, 
    predikat: 'B',
    keterangan: 'Baik',
    guru: 'Dra. Siti Rahayu, M.Si.'
  },
  { 
    id: 8, 
    tanggal: '2026-06-26', 
    matpel: 'Bahasa Inggris', 
    nilai: 90, 
    predikat: 'A',
    keterangan: 'Sangat Baik',
    guru: 'Budi Santoso, S.Pd.'
  },
  { 
    id: 9, 
    tanggal: '2026-06-25', 
    matpel: 'Kimia', 
    nilai: 65, 
    predikat: 'C',
    keterangan: 'Kurang',
    guru: 'Dewi Lestari, S.Si.'
  },
  { 
    id: 10, 
    tanggal: '2026-06-24', 
    matpel: 'Biologi', 
    nilai: 87, 
    predikat: 'B+',
    keterangan: 'Baik',
    guru: 'Dr. Rizky Ramadhan, M.Kom.'
  },
];

// Daftar mata pelajaran untuk filter
const mataPelajaranList = [
  'Semua',
  'Matematika',
  'Fisika',
  'Bahasa Inggris',
  'Kimia',
  'Biologi'
];

// Daftar predikat untuk filter
const predikatList = [
  'Semua',
  'A',
  'A-',
  'B+',
  'B',
  'C+',
  'C'
];

export default function LaporanPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatpel, setSelectedMatpel] = useState('Semua');
  const [selectedPredikat, setSelectedPredikat] = useState('Semua');
  const [sortField, setSortField] = useState<'tanggal' | 'nilai'>('tanggal');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filteredData, setFilteredData] = useState(reportData);

  // Filter dan sort data
  useEffect(() => {
    let result = [...reportData];

    // Filter search
    if (searchTerm) {
      result = result.filter(item =>
        item.matpel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter mata pelajaran
    if (selectedMatpel !== 'Semua') {
      result = result.filter(item => item.matpel === selectedMatpel);
    }

    // Filter predikat
    if (selectedPredikat !== 'Semua') {
      result = result.filter(item => item.predikat === selectedPredikat);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'tanggal') {
        comparison = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      } else if (sortField === 'nilai') {
        comparison = a.nilai - b.nilai;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredData(result);
  }, [searchTerm, selectedMatpel, selectedPredikat, sortField, sortDirection]);

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
  const totalData = reportData.length;
  const averageNilai = Math.round(reportData.reduce((acc, item) => acc + item.nilai, 0) / totalData);
  const highestNilai = Math.max(...reportData.map(item => item.nilai));
  const lowestNilai = Math.min(...reportData.map(item => item.nilai));

  // Get predikat untuk nilai rata-rata
  const getPredikat = (nilai: number) => {
    if (nilai >= 90) return 'A';
    if (nilai >= 85) return 'A-';
    if (nilai >= 80) return 'B+';
    if (nilai >= 75) return 'B';
    if (nilai >= 70) return 'C+';
    return 'C';
  };

  // Get warna untuk predikat
  const getPredikatColor = (predikat: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-700',
      'A-': 'bg-green-50 text-green-600',
      'B+': 'bg-blue-100 text-blue-700',
      'B': 'bg-blue-50 text-blue-600',
      'C+': 'bg-yellow-100 text-yellow-700',
      'C': 'bg-yellow-50 text-yellow-600',
    };
    return colors[predikat] || 'bg-gray-100 text-gray-600';
  };

  // Get icon trend
  const getTrendIcon = (nilai: number) => {
    if (nilai >= 90) return <Star className="w-4 h-4 text-yellow-500" />;
    if (nilai >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (nilai >= 70) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            {/* Statistik Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Filter & Search */}
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari mata pelajaran, guru, atau keterangan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                  />
                </div>

                {/* Filter Mata Pelajaran */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedMatpel}
                    onChange={(e) => setSelectedMatpel(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid bg-white"
                  >
                    {mataPelajaranList.map((matpel) => (
                      <option key={matpel} value={matpel}>
                        {matpel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Predikat */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPredikat}
                    onChange={(e) => setSelectedPredikat(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid bg-white"
                  >
                    {predikatList.map((predikat) => (
                      <option key={predikat} value={predikat}>
                        Predikat: {predikat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabel Laporan */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f0f7f3] border-b-2 border-[#e8f3ec]">
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">
                        <button
                          onClick={() => handleSort('tanggal')}
                          className="flex items-center gap-1 hover:text-green-mid transition"
                        >
                          Tanggal
                          {sortField === 'tanggal' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Guru</th>
                      <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">
                        <button
                          onClick={() => handleSort('nilai')}
                          className="flex items-center gap-1 hover:text-green-mid transition mx-auto"
                        >
                          Nilai
                          {sortField === 'nilai' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">Predikat</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#1a4731]">Keterangan</th>
                      <th className="px-4 py-3 text-center font-semibold text-[#1a4731]">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr 
                          key={item.id} 
                          className="border-b border-[#f0f7f3] hover:bg-[#f8fbf9] transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {item.matpel}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {item.guru}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-800">
                            {item.nilai}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPredikatColor(item.predikat)}`}>
                              {item.predikat}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.keterangan}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              {getTrendIcon(item.nilai)}
                            </div>
                          </td>
                        </tr>
                      ))
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

              {/* Footer Tabel */}
              <div className="px-4 py-3 bg-[#f8fbf9] border-t border-[#e8f3ec] flex justify-between items-center text-xs text-gray-500">
                <span>
                  Menampilkan {filteredData.length} dari {reportData.length} data
                </span>
                <span>
                  {filteredData.length > 0 && (
                    <>
                      Rata-rata: {Math.round(filteredData.reduce((acc, item) => acc + item.nilai, 0) / filteredData.length)}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}