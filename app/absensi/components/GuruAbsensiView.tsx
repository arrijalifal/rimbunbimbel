'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Clock, UserCheck, UserX, UserMinus, CheckCircle, XCircle, History, Plus, X, Calendar, BookOpen } from 'lucide-react';

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

  // State untuk modal tambah manual
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedMurid, setSelectedMurid] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tanggalManual, setTanggalManual] = useState('');
  const [jamManual, setJamManual] = useState('');
  const [statusManual, setStatusManual] = useState<'Hadir' | 'Izin' | 'Alpha'>('Hadir');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Tambahkan state untuk loading per tombol
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

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
      const semuaRes = await fetch('/api/absensi?type=semua');
      if (!semuaRes.ok) throw new Error('Gagal ambil data absensi');
      const semuaData = await semuaRes.json();
      const allAbsensi = semuaData.absensi || [];

      const pending = allAbsensi.filter((a: any) => a.status === 'Pending');
      const history = allAbsensi.filter((a: any) => a.status !== 'Pending');

      setPendingList(pending);
      setHistoryList(history);

      const muridRes = await fetch('/api/murid');
      const muridMap: Record<string, MuridData> = {};

      if (muridRes.ok) {
        const muridData = await muridRes.json();
        muridData.murid.forEach((m: any) => {
          if (m.nama && m.nama.trim() !== '') {
            muridMap[m.username] = {
              username: m.username,
              nama: m.nama,
              kelas: m.kelas || '-',
            };
          }
        });
      }

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
    // ✅ Set loading untuk row ini
    setVerifyingId(rowIndex);

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
    } finally {
      // ✅ Reset loading setelah selesai (apapun hasilnya)
      setVerifyingId(null);
    }
  };

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

  const handleTambahManual = async () => {
    if (!selectedMurid || !selectedMapel || !tanggalManual || !jamManual) {
      setError('Semua field wajib diisi');
      return;
    }

    setIsSubmittingManual(true);
    setError('');

    try {
      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifikasi-manual',
          username: selectedMurid,
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

  const resetManualForm = () => {
    setSelectedMurid('');
    setSelectedMapel('');
    setTanggalManual('');
    setJamManual('');
    setStatusManual('Hadir');
  };

  const filteredPending = filterList(pendingList);
  const filteredHistory = filterList(historyList);

  const totalPending = pendingList.length + historyList.length;
  const pendingCount = pendingList.filter(s => s.status === 'Pending').length;
  const hadirCount = historyList.filter(s => s.status === 'Hadir').length;
  const izinCount = historyList.filter(s => s.status === 'Izin').length;
  const alphaCount = historyList.filter(s => s.status === 'Alpha').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-mid border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a4731] flex items-center gap-2">
            📋 Verifikasi Absensi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{todayDate}</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 bg-yellow-50 sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-yellow-200">
          <span className="font-semibold text-yellow-600">{pendingCount}</span> siswa menunggu verifikasi
        </div>
      </div>

      {/* Statistik 5 Card (Layout Grid Rapi di HP) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <button
          onClick={() => {
            setSelectedStatus('Semua');
            setActiveTab('pending');
          }}
          className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-gray-500 hover:shadow-md transition-all text-left w-full"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{totalPending}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 opacity-50 shrink-0" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Pending')}
          className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Pending' && activeTab === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-50 shrink-0" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Hadir')}
          className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Hadir' && activeTab === 'history' ? 'ring-2 ring-green-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">Hadir</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{hadirCount}</p>
            </div>
            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-50 shrink-0" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Izin')}
          className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all text-left w-full
            ${selectedStatus === 'Izin' && activeTab === 'history' ? 'ring-2 ring-blue-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">Izin</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{izinCount}</p>
            </div>
            <UserMinus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-50 shrink-0" />
          </div>
        </button>

        <button
          onClick={() => handleCardClick('Alpha')}
          className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-all text-left w-full col-span-2 sm:col-span-1
            ${selectedStatus === 'Alpha' && activeTab === 'history' ? 'ring-2 ring-red-400' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500">Alpha</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{alphaCount}</p>
            </div>
            <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 opacity-50 shrink-0" />
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 sm:px-4 py-2 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === 'pending'
            ? 'border-green-500 text-green-700 font-semibold'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Menunggu Verifikasi
            {pendingCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                {pendingCount}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 sm:px-4 py-2 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === 'history'
            ? 'border-green-500 text-green-700 font-semibold'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4" />
            Riwayat Verifikasi
          </span>
        </button>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-md">

        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h3 className="font-semibold text-[#1a4731] text-base sm:text-lg flex items-center gap-1.5">
            👨‍🎓 {activeTab === 'pending' ? 'Menunggu Verifikasi' : 'Riwayat Verifikasi'}
            <span className="text-xs font-normal text-gray-500">
              ({activeTab === 'pending' ? filteredPending.length : filteredHistory.length})
            </span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid w-full sm:w-48"
              />
            </div>

            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-600 transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tambah Manual
            </button>

            {/* Filter Status */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition whitespace-nowrap
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

        {/* ========================================================= */}
        {/* 📱 1. CARD VIEW (Tampil Khusus Layar Kecil / Mobile < md) */}
        {/* ========================================================= */}
        <div className="block md:hidden space-y-3">
          {(activeTab === 'pending' ? filteredPending : filteredHistory).length > 0 ? (
            (activeTab === 'pending' ? filteredPending : filteredHistory).map((item, index) => {
              const murid = muridData[item.username];
              return (
                <div key={index} className="bg-[#fcfdfd] border border-[#e8f3ec] rounded-xl p-3.5 shadow-sm">

                  {/* Row 1: Nama Murid & Badge Status */}
                  <div className="flex items-start justify-between gap-2 mb-2 border-b border-gray-100 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        {murid?.nama || item.username}
                      </h4>
                      <p className="text-[11px] text-gray-400">Kelas: {murid?.kelas || '-'}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${statusColors[item.status as keyof typeof statusColors]}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Row 2: Detail Jam, Tanggal & Mapel */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{item.tanggal} ({item.jam})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{item.mapel || '-'}</span>
                    </div>
                  </div>

                  {/* Row 3: Aksi Tombol (Verifikasi) */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    {activeTab === 'pending' && item.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2 w-full">
                        <span className="text-[11px] text-gray-400 mr-auto">Verifikasi:</span>

                        {/* Tombol Hadir */}
                        <button
                          onClick={() => handleVerifikasi(item.rowIndex, 'Hadir', item.mapel)}
                          disabled={verifyingId === item.rowIndex}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border transition
        ${verifyingId === item.rowIndex
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                            }`}
                        >
                          {verifyingId === item.rowIndex ? (
                            <svg className="animate-spin w-3.5 h-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          )}
                          Hadir
                        </button>

                        {/* Tombol Izin */}
                        <button
                          onClick={() => handleVerifikasi(item.rowIndex, 'Izin', item.mapel)}
                          disabled={verifyingId === item.rowIndex}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border transition
        ${verifyingId === item.rowIndex
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                            }`}
                        >
                          {verifyingId === item.rowIndex ? (
                            <svg className="animate-spin w-3.5 h-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          Izin
                        </button>

                        {/* Tombol Alpha */}
                        <button
                          onClick={() => handleVerifikasi(item.rowIndex, 'Alpha', item.mapel)}
                          disabled={verifyingId === item.rowIndex}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border transition
        ${verifyingId === item.rowIndex
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                            }`}
                        >
                          {verifyingId === item.rowIndex ? (
                            <svg className="animate-spin w-3.5 h-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                          )}
                          Alpha
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 w-full text-right">
                        ✓ Diverifikasi oleh: <span className="font-medium text-gray-600">{item.verifikasi_oleh || '-'}</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-gray-500 text-xs">
              {activeTab === 'pending' ? 'Tidak ada data pending' : 'Belum ada riwayat verifikasi'}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 💻 2. TABLE VIEW (Tampil di Layar Sedang & Desktop >= md) */}
        {/* ========================================================= */}
        <div className="hidden md:block overflow-x-auto">
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
                                disabled={verifyingId === item.rowIndex}
                                className={`p-1.5 rounded-lg transition ${verifyingId === item.rowIndex
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-green-50 text-green-600'
                                  }`}
                                title="Hadir"
                              >
                                {verifyingId === item.rowIndex ? (
                                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>

                              <button
                                onClick={() => handleVerifikasi(item.rowIndex, 'Izin', item.mapel)}
                                disabled={verifyingId === item.rowIndex}
                                className={`p-1.5 rounded-lg transition ${verifyingId === item.rowIndex
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-blue-50 text-blue-600'
                                  }`}
                                title="Izin"
                              >
                                {verifyingId === item.rowIndex ? (
                                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </button>

                              <button
                                onClick={() => handleVerifikasi(item.rowIndex, 'Alpha', item.mapel)}
                                disabled={verifyingId === item.rowIndex}
                                className={`p-1.5 rounded-lg transition ${verifyingId === item.rowIndex
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-red-50 text-red-600'
                                  }`}
                                title="Alpha"
                              >
                                {verifyingId === item.rowIndex ? (
                                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <XCircle className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 block text-center">
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

      {/* Modal Tambah Verifikasi Manual */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#1a4731]">Tambah Verifikasi Manual</h3>
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

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Murid <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMurid}
                  onChange={(e) => setSelectedMurid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                >
                  <option value="">Pilih Murid</option>
                  {Object.values(muridData).map((murid) => (
                    <option key={murid.username} value={murid.username}>
                      {murid.nama} ({murid.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  placeholder="Contoh: Matematika, Bahasa Inggris..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalManual}
                    onChange={(e) => setTanggalManual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Jam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jamManual}
                    onChange={(e) => setJamManual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusManual}
                  onChange={(e) => setStatusManual(e.target.value as 'Hadir' | 'Izin' | 'Alpha')}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setShowManualModal(false);
                    resetManualForm();
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-xs sm:text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleTambahManual}
                  disabled={isSubmittingManual || !selectedMurid || !selectedMapel || !tanggalManual || !jamManual}
                  className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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