import { NextRequest, NextResponse } from 'next/server';
import {
  getJadwalMurid,
  getJadwalMapel,
  getAbsensiByUsername,
  getAbsensiPending,
  addAbsensi,
  updateAbsensiStatus
} from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';
import { getGoogleSheetsClient } from '@/lib/googleSheets'; // Tambahkan ini

// GET: Ambil data absensi
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'mapel') {
      const minggu = parseInt(searchParams.get('minggu') || '1');
      const hari = searchParams.get('hari') || '';
      const program = searchParams.get('program') || '';

      const jadwal = await getJadwalMapel(minggu, hari, program);
      return NextResponse.json({ jadwal });
    }

    if (type === 'pending' && user.role === 'Guru') {
      const pending = await getAbsensiPending();
      return NextResponse.json({ absensi: pending });
    }

    if (type === 'riwayat') {
      const absensi = await getAbsensiByUsername(user.username);
      return NextResponse.json({ absensi });
    }

    if (type === 'jadwal') {
      const jadwal = await getJadwalMurid(user.username);
      return NextResponse.json({ jadwal });
    }

    // Di bagian GET, tambahkan setelah type lainnya
    if (type === 'semua') {
      const doc = await getGoogleSheetsClient();
      const sheet = doc.sheetsByIndex[5];
      const rows = await sheet.getRows();

      // Ambil semua data dan urutkan dari yang terbaru
      const semuaAbsensi = rows
        .map(row => ({
          username: row.get('username'),
          tanggal: row.get('tanggal'),
          hari: row.get('hari'),
          jam: row.get('jam'),
          status: row.get('status'),
          verifikasi_oleh: row.get('verifikasi_oleh') || '-',
          rowIndex: row.rowIndex,
        }))
        .sort((a, b) => {
          // Urutkan dari tanggal terbaru
          return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
        });

      return NextResponse.json({ absensi: semuaAbsensi });
    }

    // Di bagian GET, tambahkan:
    if (type === 'cek-hari-ini') {
      const today = new Date();
      const todayISO = today.toISOString().split('T')[0]; // 2026-07-07

      // Buat array format tanggal yang mungkin
      const todayFormats = [
        todayISO, // 2026-07-07
        today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), // 7 Juli 2026
        today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }), // 07/07/2026
      ];

      console.log('🔍 Cek hari ini - Username:', user.username);
      console.log('📅 Format tanggal yang dicek:', todayFormats);

      const absensi = await getAbsensiByUsername(user.username);
      console.log('📊 Data absensi:', absensi);

      // Cek apakah ada yang match dengan salah satu format
      const sudahAbsen = absensi.some(a => todayFormats.includes(a.tanggal));
      const absensiHariIni = absensi.filter(a => todayFormats.includes(a.tanggal));

      console.log('✅ Sudah absen:', sudahAbsen);

      return NextResponse.json({
        sudahAbsen,
        absensi: absensiHariIni
      });
    }

    if (type === 'riwayat-guru') {
      // Ambil semua data absensi yang sudah diverifikasi (bukan Pending)
      const doc = await getGoogleSheetsClient();
      const sheet = doc.sheetsByIndex[5];
      const rows = await sheet.getRows();

      const riwayat = rows
        .filter(row => row.get('status') !== 'Pending')
        .map(row => ({
          username: row.get('username'),
          tanggal: row.get('tanggal'),
          hari: row.get('hari'),
          jam: row.get('jam'),
          status: row.get('status'),
          verifikasi_oleh: row.get('verifikasi_oleh') || '-',
        }));

      return NextResponse.json({ absensi: riwayat });
    }

    return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching absensi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST: Tambah absensi / Update status
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

    const body = await request.json();
    const { action } = body;

    if (action === 'absen') {
      const { tanggal, hari, jam } = body;

      // ✅ CEK APAKAH SUDAH ABSEN HARI INI
      const existingAbsensi = await getAbsensiByUsername(user.username);
      const sudahAbsen = existingAbsensi.some(a => a.tanggal === tanggal);

      if (sudahAbsen) {
        return NextResponse.json(
          { error: 'Anda sudah melakukan absen hari ini' },
          { status: 400 }
        );
      }

      // Lanjutkan tambah absensi
      await addAbsensi({
        username: user.username,
        tanggal,
        hari,
        jam,
        status: 'Pending',
        verifikasi_oleh: '-',
      });

      return NextResponse.json({ message: 'Absensi berhasil ditambahkan' });
    }

    if (action === 'verifikasi' && user.role === 'Guru') {
      const { rowIndex, status } = body;

      // Validasi status
      if (!['Hadir', 'Izin', 'Alpha'].includes(status)) {
        return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
      }

      const result = await updateAbsensiStatus(rowIndex, status, user.username);

      if (!result) {
        return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Status absensi diupdate',
        data: { rowIndex, status, verifikasi_oleh: user.username }
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error processing absensi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}