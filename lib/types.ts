export interface User {
  id: string;
  name: string;
  role: 'Murid' | 'Guru' | 'Admin';
  email: string;
  phone: string;
  kelas: string;
  paket: string;
  joined: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Schedule {
  id: string;
  subject: string;
  time: string;
  teacher: string;
  room: string;
  day: number; // 0-6 (Sunday-Saturday)
}

export interface Attendance {
  id: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Izin' | 'Alpha';
  subject: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  category: string;
  icon: 'award' | 'star' | 'zap';
  color: string;
}

export interface Material {
  id: string;
  title: string;
  progress: number;
  color: string;
}