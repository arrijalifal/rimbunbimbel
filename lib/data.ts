import { Announcement, Schedule, Attendance, Achievement, Material } from './types';

export const announcementsData: Announcement[] = [
  {
    id: '1',
    title: 'Ujian Tengah Semester dimulai 14 Juli',
    date: '30 Juni 2026',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Pendaftaran kelas baru dibuka 5 Juli',
    date: '29 Juni 2026',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Libur Hari Raya 10-12 Juli 2026',
    date: '28 Juni 2026',
    priority: 'low',
  },
];

export const scheduleData: Record<number, Schedule[]> = {
  0: [], // Sunday
  1: [
    // Monday
    {
      id: '1',
      subject: 'Matematika',
      time: '15:00 - 16:30',
      teacher: 'Pak Budi',
      room: 'A1',
      day: 1,
    },
  ],
  2: [], // Tuesday
  3: [
    // Wednesday
    {
      id: '2',
      subject: 'Fisika',
      time: '16:30 - 18:00',
      teacher: 'Bu Sari',
      room: 'B2',
      day: 3,
    },
  ],
  4: [], // Thursday
  5: [
    // Friday
    {
      id: '3',
      subject: 'Matematika',
      time: '15:00 - 16:30',
      teacher: 'Pak Budi',
      room: 'A1',
      day: 5,
    },
  ],
  6: [], // Saturday
};

export const attendanceData: Attendance[] = [
  {
    id: '1',
    date: '30 Jun 2026',
    time: '15:00',
    status: 'Hadir',
    subject: 'Matematika',
  },
  {
    id: '2',
    date: '29 Jun 2026',
    time: '15:05',
    status: 'Hadir',
    subject: 'Matematika',
  },
  {
    id: '3',
    date: '28 Jun 2026',
    time: '-',
    status: 'Izin',
    subject: 'Acara keluarga',
  },
  {
    id: '4',
    date: '27 Jun 2026',
    time: '16:30',
    status: 'Hadir',
    subject: 'Fisika',
  },
];

export const achievementsData: Achievement[] = [
  {
    id: '1',
    title: 'Nilai Sempurna Ulangan Matematika',
    date: '27 Juni 2026',
    category: 'Prestasi Akademik',
    icon: 'award',
    color: 'yellow',
  },
  {
    id: '2',
    title: 'Kehadiran 100% Bulan Juni',
    date: '30 Juni 2026',
    category: 'Disiplin & Kehadiran',
    icon: 'star',
    color: 'blue',
  },
  {
    id: '3',
    title: 'Penyelesaian Semua PR Tepat Waktu',
    date: '25 Juni 2026',
    category: 'Dedikasi & Konsistensi',
    icon: 'zap',
    color: 'green',
  },
];

export const materialsData: Material[] = [
  {
    id: '1',
    title: 'Matematika - Bab 5: Integral',
    progress: 70,
    color: '#6366f1',
  },
  {
    id: '2',
    title: 'Fisika - Bab 3: Gelombang Cahaya',
    progress: 45,
    color: '#6366f1',
  },
  {
    id: '3',
    title: 'Bahasa Inggris - Unit 8: Speaking',
    progress: 0,
    color: '#9ca3af',
  },
];