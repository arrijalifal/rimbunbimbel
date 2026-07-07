'use client';

import { useState, useEffect } from 'react';

interface JadwalMurid {
  hari: string;
  jam: string;
}

interface JadwalMapel {
  mapel_1: string;
  mapel_2: string;
}

interface AbsensiRiwayat {
  tanggal: string;
  hari: string;
  jam: string;
  status: string;
  verifikasi_oleh: string;
}

const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function MuridAbsensiView() {
  const [todayDate, setTodayDate] = useState('');
  const [todayHari, setTodayHari] = useState('');
  const [jadwalHariIni, setJadwalHariIni] = useState<JadwalMurid[]>([]);
  const [jadwalMapel, setJadwalMapel] = useState<JadwalMapel[]>([]);
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<AbsensiRiwayat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAbsen, setIsAbsen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mingguKe, setMingguKe] = useState(1);
  const [absensiHariIni, setAbsensiHariIni] = useState<AbsensiRiwayat | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const now = new Date();
      setTodayDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );

      const hariIndex = now.getDay();
      const hari = hariIndo[hariIndex];
      setTodayHari(hari);

      const minggu = Math.ceil((now.getDate()) / 7);
      setMingguKe(minggu);

      // 1. Ambil jadwal murid
      const jadwalRes = await fetch('/api/absensi?type=jadwal');
      if (!jadwalRes.ok) throw new Error('Gagal ambil jadwal');
      const jadwalData = await jadwalRes.json();

      const jadwalHariIni = jadwalData.jadwal.filter((j: JadwalMurid) => j.hari === hari);
      setJadwalHariIni(jadwalHariIni);

      // 2. Ambil jadwal mapel
      const profilRes = await fetch('/api/profil');
      if (!profilRes.ok) throw new Error('Gagal ambil profil');
      const profilData = await profilRes.json();

      if (profilData.profil && jadwalHariIni.length > 0) {
        const mapelRes = await fetch(
          `/api/absensi?type=mapel&minggu=${minggu}&hari=${hari}&program=${encodeURIComponent(profilData.profil.program)}`
        );
        if (mapelRes.ok) {
          const mapelData = await mapelRes.json();
          setJadwalMapel(mapelData.jadwal || []);
        }
      }

      // 3. ✅ CEK STATUS ABSENSI HARI INI
      // 3. ✅ CEK STATUS ABSENSI HARI INI - DENGAN DELAY
      const cekRes = await fetch('/api/absensi?type=cek-hari-ini');
      if (cekRes.ok) {
        const cekData = await cekRes.json();
        console.log('📊 Cek absen hari ini:', cekData); // Debug
        setIsAbsen(cekData.sudahAbsen);
        if (cekData.sudahAbsen && cekData.absensi.length > 0) {
          setAbsensiHariIni(cekData.absensi[0]);
        }
      }

      // 4. Ambil riwayat absensi
      const riwayatRes = await fetch('/api/absensi?type=riwayat');
      if (riwayatRes.ok) {
        const riwayatData = await riwayatRes.json();
        setRiwayatAbsensi(riwayatData.absensi || []);
      }

      await refreshStatusHariIni();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tambahkan fungsi ini setelah fetchData
  const refreshStatusHariIni = async () => {
    try {
      const cekRes = await fetch('/api/absensi?type=cek-hari-ini');
      if (cekRes.ok) {
        const cekData = await cekRes.json();
        console.log('📊 Refresh status absen:', cekData);
        setIsAbsen(cekData.sudahAbsen);
        if (cekData.sudahAbsen && cekData.absensi.length > 0) {
          setAbsensiHariIni(cekData.absensi[0]);
        }
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    }
  };

  const handleAbsen = async () => {
    if (isAbsen) {
      setError('Anda sudah melakukan absen hari ini');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const now = new Date();
      const tanggal = now.toISOString().split('T')[0];
      const hari = hariIndo[now.getDay()];
      const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'absen',
          tanggal,
          hari,
          jam,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal absen');
      }

      // ✅ SET isAbsen = true
      setIsAbsen(true);
      setAbsensiHariIni({
        tanggal,
        hari,
        jam,
        status: 'Pending',
        verifikasi_oleh: '-',
      });

      // ✅ TUNGGU SEBENTAR SEBELUM REFRESH (biar data sempat tersimpan di Google Sheets)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ✅ REFRESH DATA
      await fetchData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal absen');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const hasJadwal = jadwalHariIni.length > 0;

  return (
    <div className="space-y-6">
      {/* Kartu Status Absensi Hari Ini */}
      <div className="rounded-2xl p-6 shadow-md bg-white transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1a4731] text-lg">
            📅 Status Absensi Hari Ini
          </h3>
          <span className="text-sm text-gray-500">{todayDate}</span>
        </div>

        {hasJadwal ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-[#2d6a4f] font-medium mb-2">
                  ✅ Hari ini kamu memiliki jadwal les
                </p>
                {jadwalHariIni.map((jadwal, idx) => (
                  <div key={idx} className="bg-[#f0f7f3] rounded-lg p-3 border border-[#b7e4c7] mb-2">
                    <p className="font-semibold text-[#1a4731]">
                      {jadwalMapel.length > 0 ? jadwalMapel[0].mapel_1 : 'Mata Pelajaran'}
                      {jadwalMapel.length > 1 && ` & ${jadwalMapel[0].mapel_2}`}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      <span>🕐 {jadwal.jam}</span>
                      <span>📚 {jadwal.hari}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ TOMBOL ABSEN - CEK isAbsen DARI DATABASE */}
            {!isAbsen ? (
              <button
                type="button"
                onClick={handleAbsen}
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 
                  ${isSubmitting
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                style={{
                  background: isSubmitting
                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                    : 'linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)',
                  boxShadow: isSubmitting
                    ? 'none'
                    : '0 4px 15px rgba(26, 71, 49, 0.3)',
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  '✅ Absen Sekarang'
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full py-3.5 rounded-xl font-semibold text-white cursor-not-allowed transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
                  }}
                  disabled
                >
                  {absensiHariIni?.status === 'Pending' && '✓ Sudah Absen (Menunggu Verifikasi)'}
                  {absensiHariIni?.status === 'Hadir' && '✓ Hadir - Terverifikasi'}
                  {absensiHariIni?.status === 'Izin' && '✓ Izin - Terverifikasi'}
                  {absensiHariIni?.status === 'Alpha' && '✗ Alpha - Terverifikasi'}
                  {!absensiHariIni && '✓ Sudah Absen Hari Ini'}
                </button>

                {/* ✅ TAMPILKAN STATUS SESUAI KONDISI */}
                {absensiHariIni && (
                  <p className="text-center text-xs text-gray-500">
                    {absensiHariIni.status === 'Pending' && (
                      <span>Status: <span className="font-medium text-yellow-600">Pending</span> (Menunggu verifikasi guru)</span>
                    )}
                    {absensiHariIni.status === 'Hadir' && (
                      <span>Status: <span className="font-medium text-green-600">Hadir</span> (Diverifikasi oleh {absensiHariIni.verifikasi_oleh})</span>
                    )}
                    {absensiHariIni.status === 'Izin' && (
                      <span>Status: <span className="font-medium text-blue-600">Izin</span> (Diverifikasi oleh {absensiHariIni.verifikasi_oleh})</span>
                    )}
                    {absensiHariIni.status === 'Alpha' && (
                      <span>Status: <span className="font-medium text-red-600">Alpha</span> (Diverifikasi oleh {absensiHariIni.verifikasi_oleh})</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[#74a892] text-sm font-medium">
                📖 Hari ini tidak ada jadwal les
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Riwayat Absensi */}
      <div className="rounded-2xl p-6 shadow-md bg-white transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1a4731] text-lg">
            📋 Riwayat Absensi
          </h3>
          <span className="text-xs text-gray-400">
            {riwayatAbsensi.length} entri
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b-2 border-[#e8f3ec]">
                <th className="pb-3 font-medium">Tanggal</th>
                <th className="pb-3 font-medium">Hari</th>
                <th className="pb-3 font-medium">Jam</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Verifikasi Oleh</th>
              </tr>
            </thead>
            <tbody>
              {riwayatAbsensi.length > 0 ? (
                riwayatAbsensi.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#f0f7f3] last:border-0 hover:bg-[#f8fbf9] transition-colors">
                    <td className="py-3 text-gray-700">{item.tanggal}</td>
                    <td className="py-3 text-gray-600">{item.hari}</td>
                    <td className="py-3 text-gray-600">{item.jam}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                        ${item.status === 'Hadir' ? 'bg-green-100 text-green-700' : ''}
                        ${item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${item.status === 'Izin' ? 'bg-blue-100 text-blue-700' : ''}
                        ${item.status === 'Alpha' ? 'bg-red-100 text-red-700' : ''}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{item.verifikasi_oleh}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Belum ada riwayat absensi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}