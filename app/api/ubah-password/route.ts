import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { verifyToken, hashPassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validasi input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 3) {
      return NextResponse.json(
        { error: 'Password baru minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password baru dan konfirmasi tidak sama' },
        { status: 400 }
      );
    }

    // Ambil data user dari spreadsheet
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[2]; // Sheet Login (index 2)
    const rows = await sheet.getRows();

    // Cari user berdasarkan username
    const userRow = rows.find(row => row.get('username') === user.username);
    if (!userRow) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verifikasi password lama
    const hashedPassword = userRow.get('password');
    const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      );
    }

    // Hash password baru
    const newHashedPassword = await hashPassword(newPassword);

    // Update password di spreadsheet
    userRow.set('password', newHashedPassword);
    await userRow.save();

    return NextResponse.json({
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}