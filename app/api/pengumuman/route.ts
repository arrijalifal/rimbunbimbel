import { NextRequest, NextResponse } from 'next/server';
import { getPengumuman, addPengumuman, deletePengumuman, getGoogleSheetsClient } from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';

// GET: Ambil semua pengumuman
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    const pengumuman = await getPengumuman();
    return NextResponse.json({ pengumuman });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST: Tambah pengumuman (khusus guru)
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

    // Hanya guru yang bisa menambah pengumuman
    if (user.role !== 'Guru') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // ✅ Terima array programs
    const { programs, pengumuman } = await request.json();

    if (!programs || programs.length === 0 || !pengumuman) {
      return NextResponse.json(
        { error: 'Pilih minimal satu program dan tulis pengumuman' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // ✅ Loop untuk setiap program yang dipilih
    for (const program of programs) {
      await addPengumuman({
        timestamp,
        program,
        pengumuman,
      });
    }

    return NextResponse.json({
      message: `Pengumuman berhasil ditambahkan ke ${programs.length} program`,
      data: { timestamp, programs, pengumuman }
    });
  } catch (error) {
    console.error('Error adding pengumuman:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE: Hapus pengumuman (khusus guru)
// DELETE: Hapus pengumuman (khusus guru)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
    }

    // Hanya guru yang bisa menghapus
    if (user.role !== 'Guru') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // ✅ TAMBAHKAN INI - Hapus semua
    if (action === 'all') {
      const doc = await getGoogleSheetsClient();
      const sheet = doc.sheetsByIndex[7]; // Sheet Pengumuman
      const rows = await sheet.getRows();
      
      // Hapus semua baris (kecuali header)
      for (const row of rows) {
        await row.delete();
      }
      
      return NextResponse.json({ message: 'Semua pengumuman berhasil dihapus' });
    }

    // Hapus satu (existing)
    const rowIndex = parseInt(searchParams.get('rowIndex') || '0');
    if (!rowIndex) {
      return NextResponse.json(
        { error: 'Row index diperlukan' },
        { status: 400 }
      );
    }

    const result = await deletePengumuman(rowIndex);
    if (!result) {
      return NextResponse.json(
        { error: 'Pengumuman tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Pengumuman berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting pengumuman:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}