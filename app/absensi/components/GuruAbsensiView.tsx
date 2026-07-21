'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Clock, UserCheck, UserX, UserMinus, CheckCircle, XCircle, History, Plus, X } from 'lucide-react';

interface AbsensiPending {
  username: string;
  tanggal: string;
  hari: string;
  jam: string;
  mapel: string;
  status: string;
  verifikasi_oleh: string;
  rowIndex: number;
}

interface AbsensiRiwayat {
  username: string;
  tanggal: string;
  hari: string;
  jam: string;
  mapel: string;
  status: string;
  verifikasi_oleh: string;
}

interface MuridData {
  username: string;
  nama: string;
  kelas: string;
}

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Hadir: 'bg-green-100 text-green-700',
  Izin: 'bg-blue-100 text-blue-700',
  Alpha: 'bg-red-100 text-red-700',
};

export default function GuruAbsensiView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingList, setPendingList] = useState<AbsensiPending[]>([]);
  const [historyList, setHistoryList] = useState<AbsensiRiwayat[]>([]);
  const [muridData, setMuridData] = useState<Record<string, MuridData>>({});
  const [todayDate, setTodayDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'Semua' | 'Pending' | 'Hadir' | 'Izin' | 'Alpha'>('Semua');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // ✅ State untuk modal tambah manual
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedMurid, setSelectedMurid] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tanggalManual, setTanggalManual] = useState('');
  const [jamManual, setJamManual] = useState('');
  const [statusManual, setStatusManual] = useState<'Hadir' | 'Izin' | 'Alpha'>('Hadir');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  useEffect(() => {
    const now = new Date();
    setTodayDate(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Ambil data absensi
      const semuaRes = await fetch('/api/absensi?type=semua');
      if (!semuaRes.ok) throw new Error('Gagal ambil data absensi');
      const semuaData = await semuaRes.json();
      const allAbsensi = semuaData.absensi || [];

      const pending = allAbsensi.filter((a: any) => a.status === 'Pending');
      const history = allAbsensi.filter((a: any) => a.status !== 'Pending');

      setPendingList(pending);
      setHistoryList(history);

      // ✅ 2. Ambil SEMUA data murid dari sheet (bukan hanya dari absensi)
      const muridRes = await fetch('/api/murid');
      const muridMap: Record<string, MuridData> = {};

      if (muridRes.ok) {
        const muridData = await muridRes.json();
        muridData.murid.forEach((m: any) => {
          // Hanya tambahkan yang punya nama (untuk menghindari data kosong)
          if (m.nama && m.nama.trim() !== '') {
            muridMap[m.username] = {
              username: m.username,
              nama: m.nama,
              kelas: m.kelas || '-',
            };
          }
        });
      }

      // ✅ 3. Tambahkan juga murid dari data absensi (kalau ada yang tidak ada di sheet)
      const allUsernames = [...new Set(allAbsensi.map((a: any) => a.username))];
      for (const username of allUsernames) {
        if (!muridMap[username as string]) {
          try {
            const profilRes = await fetch(`/api/profil?username=${username}`);
            if (profilRes.ok) {
              const profilData = await profilRes.json();
              if (profilData.profil) {
                muridMap[username as string] = {
                  username: profilData.profil.username,
                  nama: profilData.profil.nama || username,
                  kelas: profilData.profil.kelas || '-',
                };
              }
            }
          } catch (err) {
            console.error(`Error fetching profil for ${username}:`, err);
          }
        }
      }

      setMuridData(muridMap);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifikasi = async (rowIndex: number, status: string, mapel: string) => {
    try {
      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifikasi',
          rowIndex,
          status,
          mapel,
        }),
      });

      if (!response.ok) throw new Error('Gagal verifikasi');

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal verifikasi');
    }
  };

  // ✅ Fungsi untuk handle klik card statistik
  const handleCardClick = (status: 'Pending' | 'Hadir' | 'Izin' | 'Alpha') => {
    setSelectedStatus(status);
    if (status === 'Pending') {
      setActiveTab('pending');
    } else {
      setActiveTab('history');
    }
  };

  const filterList = (list: any[]) => {
    return list.filter(item => {
      const murid = muridData[item.username];
      const matchSearch = murid?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        murid?.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === 'Semua' || item.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  };

  // ✅ Fungsi untuk handle tambah manual
  const handleTambahManual = async () => {
    if (!selectedMurid || !selectedMapel || !tanggalManual || !jamManual) {
      setError('Semua field wajib diisi');
      return;
    }

    setIsSubmittingManual(true);
    setError('');

    try {
      // ✅ Langsung pakai selectedMurid sebagai username
      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifikasi-manual',
          username: selectedMurid, // ✅ Langsung pakai username
          tanggal: tanggalManual,
          hari: new Date(tanggalManual).toLocaleDateString('id-ID', { weekday: 'long' }),
          jam: jamManual,
          mapel: selectedMapel,
          status: statusManual,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menambah verifikasi');
      }

      setShowManualModal(false);
      resetManualForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah verifikasi');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // ✅ Reset form manual
  const resetManualForm = () => {
    setSelectedMurid('');
    setSelectedMapel('');
    setTanggalManual('');
    setJamManual('');
    setStatusManual('Hadir');
  };

  // ✅ Dapatkan daftar mapel unik
  const mapelOptions = ['Semua', ...new Set(pendingList.map(item => item.mapel).filter(Boolean))];

  const filteredPending = filterList(pendingList);
  const filteredHistory = filterList(historyList);

  // Hitung statistik
  const totalPending = pendingList.length + historyList.length; // Total semua data
  const pendingCount = pendingList.filter(s => s.status === 'Pending').length;
  const hadirCount = historyList.filter(s => s.status === 'Hadir').length; // ✅ dari historyList
  const izinCount = historyList.filter(s => s.status === 'Izin').length;     // ✅ dari historyList
  const alphaCount = historyList.filter(s => s.status === 'Alpha').length;   // ✅ dari historyList

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-mid border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a4731]">📋 Verifikasi Absensi</h2>
          <p className="text-sm text-gray-500 mt-1">{todayDate}</p>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-yellow-600">{pendingCount}</span> siswa menunggu verifikasi
        </div>
      </div>

      {/* Statistik - Semua card bisa diklik */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => {
            setSelectedStatus('Semua');
            setActiveTab('pending');
          }}
          className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500 hover:shadow-md transition-all text-left w-full"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800">{totalPending}</p>
            </div>
            <Users className="w-8 h-8 text-gray-500 opacity-50" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Pending')}
          className={`bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Pending' && activeTab === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Hadir')}
          className={`bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Hadir' && activeTab === 'history' ? 'ring-2 ring-green-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{hadirCount}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Izin')}
          className={`bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Izin' && activeTab === 'history' ? 'ring-2 ring-blue-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Izin</p>
              <p className="text-2xl font-bold text-blue-600">{izinCount}</p>
            </div>
            <UserMinus className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Alpha')}
          className={`bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Alpha' && activeTab === 'history' ? 'ring-2 ring-red-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Alpha</p>
              <p className="text-2xl font-bold text-red-600">{alphaCount}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'pending'
            ? 'border-green-500 text-green-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Menunggu Verifikasi
            {pendingCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'history'
            ? 'border-green-500 text-green-700'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Riwayat Verifikasi
          </span>
        </button>
      </div>

      {/* Daftar Siswa */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h3 className="font-semibold text-[#1a4731] text-lg">
            👨‍🎓 {activeTab === 'pending' ? 'Menunggu Verifikasi' : 'Riwayat Verifikasi'}
            ({activeTab === 'pending' ? filteredPending.length : filteredHistory.length})
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid w-full sm:w-48"
              />
            </div>
            {/* ✅ Tombol Tambah Verifikasi Manual */}
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tambah Manual
            </button>

            <div className="flex gap-1 flex-wrap">
              {['Semua', 'Pending', 'Hadir', 'Izin', 'Alpha'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status as any);
                    if (status === 'Pending') {
                      setActiveTab('pending');
                    } else if (status !== 'Semua') {
                      setActiveTab('history');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                    ${selectedStatus === status
                      ? 'bg-green-mid text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b-2 border-[#e8f3ec]">
                <th className="pb-3 font-medium">No</th>
                <th className="pb-3 font-medium">Nama Siswa</th>
                <th className="pb-3 font-medium">Kelas</th>
                <th className="pb-3 font-medium">Tanggal</th>
                <th className="pb-3 font-medium">Jam</th>
                <th className="pb-3 font-medium">Mapel</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'pending' ? (
                filteredPending.length > 0 ? (
                  filteredPending.map((item, index) => {
                    const murid = muridData[item.username];
                    return (
                      <tr key={index} className="border-b border-[#f0f7f3] last:border-0 hover:bg-[#f8fbf9] transition-colors">
                        <td className="py-3 text-gray-500">{index + 1}</td>
                        <td className="py-3 font-medium text-gray-700">
                          {murid?.nama || item.username}
                        </td>
                        <td className="py-3 text-gray-600">{murid?.kelas || '-'}</td>
                        <td className="py-3 text-gray-600">{item.tanggal}</td>
                        <td className="py-3 text-gray-600">{item.jam}</td>
                        <td className="py-3 text-gray-600">{item.mapel || '-'}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                            ${statusColors[item.status as keyof typeof statusColors]}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {item.status === 'Pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleVerifikasi(item.rowIndex, 'Hadir', item.mapel)}
                                className="p-1.5 rounded-lg hover:bg-green-50 transition text-green-600"
                                title="Hadir"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleVerifikasi(item.rowIndex, 'Izin', item.mapel)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 transition text-blue-600"
                                title="Izin"
                              >
                                <Clock className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleVerifikasi(item.rowIndex, 'Alpha', item.mapel)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-600"
                                title="Alpha"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              ✓ Diverifikasi oleh {item.verifikasi_oleh}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Tidak ada data pending
                    </td>
                  </tr>
                )
              ) : (
                filteredHistory.length > 0 ? (
                  filteredHistory.map((item, index) => {
                    const murid = muridData[item.username];
                    return (
                      <tr key={index} className="border-b border-[#f0f7f3] last:border-0 hover:bg-[#f8fbf9] transition-colors">
                        <td className="py-3 text-gray-500">{index + 1}</td>
                        <td className="py-3 font-medium text-gray-700">
                          {murid?.nama || item.username}
                        </td>
                        <td className="py-3 text-gray-600">{murid?.kelas || '-'}</td>
                        <td className="py-3 text-gray-600">{item.tanggal}</td>
                        <td className="py-3 text-gray-600">{item.jam}</td>
                        <td className="py-3 text-gray-600">{item.mapel || '-'}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                            ${statusColors[item.status as keyof typeof statusColors]}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 text-center text-gray-500 text-xs">
                          {item.verifikasi_oleh !== '-' ? `✓ ${item.verifikasi_oleh}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Belum ada riwayat verifikasi
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1a4731]">Tambah Verifikasi Manual</h3>
              <button
                onClick={() => {
                  setShowManualModal(false);
                  resetManualForm();
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Pilih Murid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Murid <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMurid}
                  onChange={(e) => setSelectedMurid(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                >
                  <option value="">Pilih Murid</option>
                  {Object.values(muridData).map((murid) => (
                    <option key={murid.username} value={murid.username}>
                      {murid.nama} ({murid.kelas})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mapel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  placeholder="Contoh: Matematika, Bahasa Inggris..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalManual}
                  onChange={(e) => setTanggalManual(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                />
              </div>

              {/* Jam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jam <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={jamManual}
                  onChange={(e) => setJamManual(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusManual}
                  onChange={(e) => setStatusManual(e.target.value as 'Hadir' | 'Izin' | 'Alpha')}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowManualModal(false);
                    resetManualForm();
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleTambahManual}
                  disabled={isSubmittingManual || !selectedMurid || !selectedMapel || !tanggalManual || !jamManual}
                  className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingManual ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}