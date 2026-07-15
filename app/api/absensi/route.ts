import { NextRequest, NextResponse } from 'next/server';
import {
  getJadwalMurid,
  getJadwalMapel,
  getAbsensiByUsername,
  getAbsensiPending,
  addAbsensi,
  updateAbsensiStatus,
  addNilaiMurid
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
      console.log('📊 Pending data with rowIndex:', pending.map(p => ({
        username: p.username,
        rowIndex: p.rowIndex
      })));
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

      const semuaAbsensi = rows
        .map(row => ({
          username: row.get('username'),
          tanggal: row.get('tanggal'),
          hari: row.get('hari'),
          jam: row.get('jam'),
          mapel: row.get('mapel') || '-', // ✅ TAMBAHKAN INI
          status: row.get('status'),
          verifikasi_oleh: row.get('verifikasi_oleh') || '-',
          rowIndex: row.rowNumber,
        }))
        .sort((a, b) => {
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

    if (type === 'jadwal-mapel') {
      const minggu = parseInt(searchParams.get('minggu') || '1');
      const program = searchParams.get('program') || '';

      const doc = await getGoogleSheetsClient();
      const sheet = doc.sheetsByIndex[4]; // Sheet Jadwal Mapel
      const rows = await sheet.getRows();

      const jadwal = rows
        .filter(row =>
          parseInt(row.get('minggu_ke')) === minggu &&
          row.get('program') === program
        )
        .map(row => ({
          minggu_ke: parseInt(row.get('minggu_ke')),
          hari: row.get('hari'),
          program: row.get('program'),
          mapel_1: row.get('mapel_1'),
          mapel_2: row.get('mapel_2'),
        }));

      return NextResponse.json({ jadwal });
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
      const { tanggal, hari, jam, mapel } = body;

      // ✅ CEK APAKAH SUDAH ABSEN HARI INI
      const existingAbsensi = await getAbsensiByUsername(user.username);
      const sudahAbsen = existingAbsensi.some(a => a.tanggal === tanggal);

      if (sudahAbsen) {
        return NextResponse.json(
          { error: 'Anda sudah melakukan absen hari ini' },
          { status: 400 }
        );
      }

      // ✅ VALIDASI MAPEL
      if (!mapel) {
        return NextResponse.json(
          { error: 'Silakan pilih mata pelajaran' },
          { status: 400 }
        );
      }

      // Lanjutkan tambah absensi dengan mapel
      await addAbsensi({
        username: user.username,
        tanggal,
        hari,
        jam,
        mapel, // ✅ Tambahkan mapel
        status: 'Pending',
        verifikasi_oleh: '-',
      });

      return NextResponse.json({ message: 'Absensi berhasil ditambahkan' });
    }

    if (action === 'verifikasi' && user.role === 'Guru') {
      const { rowIndex, status, mapel } = body;

      // ✅ TAMBAHKAN LOG INI
      console.log('🔍 VERIFIKASI - Detail:');
      console.log('  rowIndex:', rowIndex);
      console.log('  status:', status);
      console.log('  mapel:', mapel);
      console.log('  guru:', user.username);

      // Validasi status
      if (!['Hadir', 'Izin', 'Alpha'].includes(status)) {
        return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
      }

      // Update status absensi
      const result = await updateAbsensiStatus(rowIndex, status, user.username);

      console.log('  result updateAbsensiStatus:', result); // ✅ TAMBAHKAN INI

      if (!result) {
        return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
      }

      // ✅ JIKA STATUS HADIR, TAMBAHKAN KE SHEET NILAI MURID
      if (status === 'Hadir' && mapel) {
        const doc = await getGoogleSheetsClient();
        const sheet = doc.sheetsByIndex[5];
        const rows = await sheet.getRows();
        const row = rows.find(r => r.rowNumber === rowIndex);

        if (row) {
          // ✅ Hitung predikat dari nilai (default '-' karena nilai belum diisi)
          // Nilai default '-' berarti predikat juga '-'
          const predikat = '-';

          await addNilaiMurid({
            username: row.get('username'),
            tanggal: row.get('tanggal'),
            hari: row.get('hari'),
            mapel: mapel,
            pengajar: user.username,
            nilai: '-',
            predikat: predikat, // ✅ Tambahkan ini
            catatan: '-',
          });
        }
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