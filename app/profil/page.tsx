'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { AlertCircle, Check, Eye, EyeOff, Key, X } from 'lucide-react';

interface ProfilData {
  username: string;
  nama: string;
  kelas: string;
  program: string;
  jadwal_les: string;
  bergabung: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ State untuk modal ganti password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async () => {
    // Reset state
    setPasswordError('');
    setPasswordSuccess('');

    // Validasi
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Semua field wajib diisi');
      return;
    }

    if (newPassword.length < 3) {
      setPasswordError('Password baru minimal 3 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak sama');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ubah-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah password');
      }

      setPasswordSuccess('Password berhasil diubah!');

      // Reset form setelah 2 detik
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
        setPasswordError('');
      }, 2000);

    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        // 1. Ambil role user
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUserRole(meData.user?.role || 'Murid');

        // 2. Ambil data profil
        const response = await fetch('/api/profil');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Gagal mengambil data profil');
        }

        const data = await response.json();
        setProfil(data.profil);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error('Error fetching profil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [router]);

  // ✅ Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (nama: string) => {
    if (!nama) return '?';
    const words = nama.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // ✅ Fungsi untuk mendapatkan warna background berdasarkan username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              Data profil tidak ditemukan
            </div>
          </main>
        </div>
      </div>
    );
  }

  const initials = getInitials(profil.nama || profil.username);
  const avatarColor = getAvatarColor(profil.username);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto flex flex-col overflow-hidden">
          <div className="flex flex-col h-full gap-5">
            <div className="rounded-2xl p-6 shadow-md text-center bg-white flex flex-col items-center relative">
              {/* ✅ Avatar Inisial */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md ${avatarColor}`}>
                {initials}
              </div>

              <h2 className="text-xl font-bold text-[#1a4731] mt-4">{profil.nama}</h2>

              {/* ✅ Tampilkan role di bawah nama */}
              <p className="text-sm text-[#74a892] mt-1">
                {userRole === 'Guru' ? '👨‍🏫 Guru' : profil.kelas}
              </p>

              <div className="mt-6 text-left space-y-3 max-w-xs mx-auto w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Username</span>
                  <span className="font-medium">{profil.username}</span>
                </div>

                {/* Role */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${userRole === 'Guru' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {userRole || 'Murid'}
                  </span>
                </div>

                {/* Info khusus murid */}
                {userRole !== 'Guru' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Kelas</span>
                      <span className="font-medium">{profil.kelas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Program</span>
                      <span className="font-medium">{profil.program}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Jadwal Les</span>
                      <span className="font-medium">{profil.jadwal_les}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bergabung</span>
                      <span className="font-medium">{profil.bergabung}</span>
                    </div>
                  </>
                )}

                {/* Info khusus guru */}
                {userRole === 'Guru' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium text-green-600">Aktif</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Terdaftar Sejak</span>
                      <span className="font-medium">{profil.bergabung || '-'}</span>
                    </div>
                  </>
                )}

                {/* ✅ TOMBOL GANTI PASSWORD - Di sini, di bawah semua info */}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition border border-blue-200"
                >
                  <Key className="w-4 h-4" />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
          {/* Modal Ganti Password */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#1a4731] flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-500" />
                    Ganti Password
                  </h3>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Password Saat Ini */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan password saat ini"
                        className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Baru */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 3 karakter"
                        className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid/20 focus:border-green-mid"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error / Success */}
                  {passwordError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-sm">
                      <Check className="w-4 h-4 shrink-0" />
                      {passwordSuccess}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}