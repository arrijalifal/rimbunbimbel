'use client';

import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Book,
  User,
  Megaphone,
  LogOut,
  Trophy,
  BarChart3, // Tambahkan icon untuk Laporan Belajar
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'absensi', label: 'Absensi', icon: CalendarCheck, path: '/absensi' },
  { id: 'jadwal', label: 'Jadwal', icon: Clock, path: '/jadwal' },
  { id: 'laporan', label: 'Laporan Belajar', icon: BarChart3, path: '/laporan' }, // Menu baru
  { id: 'profil', label: 'Profil', icon: User, path: '/profil' },
  { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, path: '/pengumuman' },
  { id: 'prestasi', label: 'Prestasi', icon: Trophy, path: '/prestasi' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    router.push('/login');
    onClose();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static w-64 h-screen z-40 flex-shrink-0 flex flex-col py-6 px-4 transition-transform duration-300 overflow-y-auto bg-[#1a4731]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
            RB
          </div>
          <span className="text-lg font-bold text-white">Rimbun Bimbel</span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 text-sm font-medium
                  ${active ? 'active bg-white/15' : 'hover:bg-white/10'}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 text-sm hover:text-white hover:bg-white/10 transition"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Keluar
        </button>
      </aside>
    </>
  );
}