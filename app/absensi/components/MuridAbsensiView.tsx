'use client';

import { useState, useEffect } from 'react';

// Dummy data untuk jadwal per hari (0 = Minggu, 1 = Senin, dst)
const scheduleData: Record<number, Array<{ subject: string; time: string; room: string }>> = {
  0: [], // Minggu - Tidak ada jadwal
  1: [
    { subject: 'Matematika', time: '15:00 - 16:30', room: 'Ruang 101' },
    { subject: 'Fisika', time: '17:00 - 18:30', room: 'Ruang 102' },
  ],
  2: [
    { subject: 'Bahasa Inggris', time: '15:00 - 16:30', room: 'Ruang 103' },
  ],
  3: [
    { subject: 'Kimia', time: '16:00 - 17:30', room: 'Ruang 104' },
    { subject: 'Biologi', time: '18:00 - 19:30', room: 'Ruang 105' },
  ],
  4: [
    { subject: 'Matematika', time: '15:00 - 16:30', room: 'Ruang 101' },
  ],
  5: [
    { subject: 'Fisika', time: '09:00 - 10:30', room: 'Ruang 102' },
    { subject: 'Kimia', time: '11:00 - 12:30', room: 'Ruang 104' },
  ],
  6: [], // Sabtu - Tidak ada jadwal
};

// Dummy data riwayat absensi murid
const attendanceData = [
  { id: 1, date: '2026-06-28', time: '15:00', status: 'Hadir', subject: 'Matematika' },
  { id: 2, date: '2026-06-25', time: '16:00', status: 'Hadir', subject: 'Kimia' },
  { id: 3, date: '2026-06-21', time: '15:00', status: 'Izin', subject: 'Bahasa Inggris' },
  { id: 4, date: '2026-06-18', time: '17:00', status: 'Hadir', subject: 'Fisika' },
  { id: 5, date: '2026-06-14', time: '15:00', status: 'Alpha', subject: 'Matematika' },
];

export default function MuridAbsensiView() {
  const [todayDate, setTodayDate] = useState('');
  const [hasClass, setHasClass] = useState(false);
  const [classInfo, setClassInfo] = useState<{ subject: string; time: string; room: string } | null>(null);
  const [nextClass, setNextClass] = useState<{ subject: string; date: string; time: string } | null>(null);
  const [isAbsen, setIsAbsen] = useState(false);

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

    const dayOfWeek = now.getDay();
    const todayClasses = scheduleData[dayOfWeek] || [];

    if (todayClasses.length > 0) {
      setHasClass(true);
      const firstClass = todayClasses[0];
      setClassInfo({
        subject: firstClass.subject,
        time: firstClass.time,
        room: firstClass.room,
      });
    } else {
      setHasClass(false);
      for (let i = 1; i <= 7; i++) {
        const nextDay = (dayOfWeek + i) % 7;
        if (scheduleData[nextDay] && scheduleData[nextDay].length > 0) {
          const nextDate = new Date(now);
          nextDate.setDate(nextDate.getDate() + i);
          const nextClassData = scheduleData[nextDay][0];
          setNextClass({
            subject: nextClassData.subject,
            date: nextDate.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            time: nextClassData.time,
          });
          break;
        }
      }
    }
  }, []);

  const handleAbsen = () => {
    setIsAbsen(true);
  };

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

        {hasClass ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-[#2d6a4f] font-medium mb-2">
                  ✅ Hari ini kamu memiliki jadwal les
                </p>
                {classInfo && (
                  <div className="bg-[#f0f7f3] rounded-lg p-3 border border-[#b7e4c7]">
                    <p className="font-semibold text-[#1a4731]">
                      {classInfo.subject}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      <span>🕐 {classInfo.time}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isAbsen ? (
              <button
                type="button"
                onClick={handleAbsen}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #1a4731 0%, #2d6a4f 100%)',
                  boxShadow: '0 4px 15px rgba(26, 71, 49, 0.3)',
                }}
              >
                ✅ Absen Sekarang
              </button>
            ) : (
              <button
                type="button"
                className="w-full py-3.5 rounded-xl font-semibold text-white cursor-not-allowed transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                  boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
                }}
                disabled
              >
                ✓ Sudah Absen Hari Ini
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[#74a892] text-sm font-medium">
                📖 Hari ini tidak ada jadwal les
              </span>
            </div>
            
            {nextClass && (
              <div className="bg-[#edf7f0] rounded-lg p-4 border border-[#b7e4c7]">
                <p className="text-xs text-gray-600 font-medium mb-2">
                  📌 Jadwal Les Berikutnya:
                </p>
                <div className="space-y-1">
                  <p className="font-semibold text-[#1a4731]">
                    {nextClass.subject}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>📅 {nextClass.date}</span>
                    <span>🕐 {nextClass.time}</span>
                  </div>
                </div>
              </div>
            )}
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
            {attendanceData.length} entri
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b-2 border-[#e8f3ec]">
                <th className="pb-3 font-medium">Tanggal</th>
                <th className="pb-3 font-medium">Jam</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((item) => (
                <tr key={item.id} className="border-b border-[#f0f7f3] last:border-0 hover:bg-[#f8fbf9] transition-colors">
                  <td className="py-3 text-gray-700">{item.date}</td>
                  <td className="py-3 text-gray-600">{item.time}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                      ${item.status === 'Hadir' ? 'bg-green-100 text-green-700' : ''}
                      ${item.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${item.status === 'Alpha' ? 'bg-red-100 text-red-700' : ''}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{item.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}