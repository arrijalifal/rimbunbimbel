import { NextRequest, NextResponse } from 'next/server';
import { getPengumuman, addPengumuman, deletePengumuman } from '@/lib/googleSheets';
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

    const { program, pengumuman } = await request.json();

    if (!program || !pengumuman) {
      return NextResponse.json(
        { error: 'Program dan pengumuman wajib diisi' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // ✅ Tentukan target program
    const targetPrograms = program === "Semua"
      ? ["Akademik SD/SMP", "Calistung"]
      : [program];

    // ✅ Loop untuk menambah ke semua target
    for (const target of targetPrograms) {
      await addPengumuman({
        timestamp,
        program: target,
        pengumuman,
      });
    }

    return NextResponse.json({
      message: `Pengumuman berhasil ditambahkan ke ${targetPrograms.join(', ')}`,
      data: { timestamp, program, pengumuman }
    });
  } catch (error) {
    console.error('Error adding pengumuman:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

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

    // Hanya guru yang bisa menghapus pengumuman
    if (user.role !== 'Guru') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
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