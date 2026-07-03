'use client';

import { useState, useEffect } from 'react';
import { Search, Users, CheckCircle, XCircle, Clock, UserCheck, UserX, UserMinus, ChevronDown, Check, X } from 'lucide-react';

// Dummy data guru tetap
const teachersData = [
  { id: 1, name: 'Dr. Ahmad Fauzi, M.Pd.' },
  { id: 2, name: 'Dra. Siti Rahayu, M.Si.' },
  { id: 3, name: 'Budi Santoso, S.Pd.' },
  { id: 4, name: 'Dewi Lestari, S.Si.' },
  { id: 5, name: 'Dr. Rizky Ramadhan, M.Kom.' },
];

// Dummy data siswa yang minta konfirmasi hadir hari ini
const studentsData = [
  { id: 1, name: 'Rina Permata', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:00', teacher: null },
  { id: 2, name: 'Budi Santoso', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:05', teacher: null },
  { id: 3, name: 'Siti Rahayu', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:10', teacher: null },
  { id: 4, name: 'Agus Wijaya', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:12', teacher: null },
  { id: 5, name: 'Dewi Lestari', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:15', teacher: null },
  { id: 6, name: 'Rizky Ramadhan', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:18', teacher: null },
  { id: 7, name: 'Maya Sari', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:20', teacher: null },
  { id: 8, name: 'Doni Pratama', kelas: 'XII IPA 2', status: 'Pending', waktu: '15:25', teacher: null },
];

// Status badge colors
const statusColors = {
  Pending: 'bg-gray-100 text-gray-600',
  Hadir: 'bg-green-100 text-green-700',
  Izin: 'bg-yellow-100 text-yellow-700',
  Alpha: 'bg-red-100 text-red-700',
};

export default function GuruAbsensiView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState(studentsData);
  const [selectedStatus, setSelectedStatus] = useState<'Semua' | 'Pending' | 'Hadir' | 'Izin' | 'Alpha'>('Semua');
  const [todayDate, setTodayDate] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Record<number, number>>({});

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
  }, []);

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'Semua' || student.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  // Hitung statistik
  const totalStudents = students.length;
  const pendingCount = students.filter(s => s.status === 'Pending').length;
  const hadirCount = students.filter(s => s.status === 'Hadir').length;
  const izinCount = students.filter(s => s.status === 'Izin').length;
  const alphaCount = students.filter(s => s.status === 'Alpha').length;

  // Handle konfirmasi kehadiran
  const handleConfirmAttendance = (studentId: number, teacherId: number | null) => {
    if (teacherId === null) {
      // Jika belum pilih guru, tampilkan alert
      alert('Silakan pilih guru terlebih dahulu!');
      return;
    }

    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? {
              ...student,
              status: 'Hadir',
              teacher: teacherId,
            }
          : student
      )
    );
    setOpenDropdown(null);
  };

  // Handle izin
  const handleIzin = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? {
              ...student,
              status: 'Izin',
              teacher: null,
            }
          : student
      )
    );
  };

  // Handle alpha
  const handleAlpha = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? {
              ...student,
              status: 'Alpha',
              teacher: null,
            }
          : student
      )
    );
  };

  // Reset status ke Pending
  const handleResetStatus = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? {
              ...student,
              status: 'Pending',
              teacher: null,
            }
          : student
      )
    );
  };

  // Get teacher name by id
  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return '-';
    const teacher = teachersData.find(t => t.id === teacherId);
    return teacher ? teacher.name : '-';
  };

  return (
    <div className="space-y-6">
      {/* Header dengan tanggal */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a4731]">📋 Konfirmasi Absensi</h2>
          <p className="text-sm text-gray-500 mt-1">{todayDate}</p>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-green-dark">{pendingCount}</span> siswa menunggu konfirmasi
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-600">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{hadirCount}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Izin</p>
              <p className="text-2xl font-bold text-yellow-600">{izinCount}</p>
            </div>
            <UserMinus className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Alpha</p>
              <p className="text-2xl font-bold text-red-600">{alphaCount}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h3 className="font-semibold text-[#1a4731] text-lg">
            👨‍🎓 Daftar Siswa ({filteredStudents.length})
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
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
            
            {/* Filter Status */}
            <div className="flex gap-1 flex-wrap">
              {['Semua', 'Pending', 'Hadir', 'Izin', 'Alpha'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as any)}
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
                <th className="pb-3 font-medium">Waktu</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Guru</th>
                <th className="pb-3 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-[#f0f7f3] last:border-0 hover:bg-[#f8fbf9] transition-colors">
                    <td className="py-3 text-gray-500">{index + 1}</td>
                    <td className="py-3 font-medium text-gray-700">{student.name}</td>
                    <td className="py-3 text-gray-600">{student.kelas}</td>
                    <td className="py-3 text-gray-500">{student.waktu}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                        ${statusColors[student.status as keyof typeof statusColors]}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {student.teacher ? getTeacherName(student.teacher) : '-'}
                    </td>
                    <td className="py-3">
                      {student.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          {/* Dropdown Pilih Guru */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === student.id ? null : student.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition whitespace-nowrap"
                            >
                              Pilih Guru
                              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === student.id ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {openDropdown === student.id && (
                              <div className="absolute z-10 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-48 overflow-y-auto">
                                {teachersData.map((teacher) => (
                                  <button
                                    key={teacher.id}
                                    onClick={() => {
                                      setSelectedTeacher(prev => ({
                                        ...prev,
                                        [student.id]: teacher.id
                                      }));
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center justify-between
                                      ${selectedTeacher[student.id] === teacher.id ? 'bg-green-50' : ''}`}
                                  >
                                    <span>{teacher.name}</span>
                                    {selectedTeacher[student.id] === teacher.id && (
                                      <Check className="w-4 h-4 text-green-600" />
                                    )}
                                  </button>
                                ))}
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                  <button
                                    onClick={() => {
                                      setSelectedTeacher(prev => ({
                                        ...prev,
                                        [student.id]: 0
                                      }));
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
                                  >
                                    ✕ Batal pilih
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Tombol Konfirmasi */}
                          <button
                            onClick={() => handleConfirmAttendance(student.id, selectedTeacher[student.id] || null)}
                            className="p-1.5 rounded-lg hover:bg-green-50 transition text-green-600"
                            title="Konfirmasi Hadir"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>

                          {/* Tombol Izin */}
                          <button
                            onClick={() => handleIzin(student.id)}
                            className="p-1.5 rounded-lg hover:bg-yellow-50 transition text-yellow-600"
                            title="Izin"
                          >
                            <Clock className="w-5 h-5" />
                          </button>

                          {/* Tombol Alpha */}
                          <button
                            onClick={() => handleAlpha(student.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-600"
                            title="Alpha"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs text-gray-400">
                            {student.status === 'Hadir' ? `✓ ${getTeacherName(student.teacher)}` : `✓ ${student.status}`}
                          </span>
                          <button
                            onClick={() => handleResetStatus(student.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-400"
                            title="Reset status"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Tidak ada siswa yang ditemukan
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