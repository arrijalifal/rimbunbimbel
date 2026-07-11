import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';

// GET: Ambil data nilai
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

        const doc = await getGoogleSheetsClient();
        const sheet = doc.sheetsByIndex[6]; // Sheet Nilai Murid
        const rows = await sheet.getRows();

        let nilaiData = rows.map(row => ({
            username: row.get('username'),
            tanggal: row.get('tanggal'),
            hari: row.get('hari'),
            mapel: row.get('mapel'),
            pengajar: row.get('pengajar') || '-',
            nilai: row.get('nilai') || '-',
            catatan: row.get('catatan') || '-',
        }));

        // Filter berdasarkan role
        if (user.role === 'Murid') {
            nilaiData = nilaiData.filter(item => item.username === user.username);
        }

        return NextResponse.json({ nilai: nilaiData });
    } catch (error) {
        console.error('Error fetching nilai:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

// PUT: Update nilai
// PUT: Update nilai
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
        }

        // Hanya guru yang bisa update nilai
        if (user.role !== 'Guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { username, tanggal, mapel, nilai, catatan } = await request.json();

        const doc = await getGoogleSheetsClient();
        const sheet = doc.sheetsByIndex[6]; // Sheet Nilai Murid
        const rows = await sheet.getRows();

        // Cari row yang sesuai
        const row = rows.find(r =>
            r.get('username') === username &&
            r.get('tanggal') === tanggal &&
            r.get('mapel') === mapel
        );

        if (!row) {
            return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
        }

        // ✅ CEK APAKAH GURU INI YANG MENGAJAR MAPEL TERSEBUT
        const pengajar = row.get('pengajar');
        if (pengajar !== user.username) {
            return NextResponse.json({
                error: `Anda tidak memiliki akses untuk mengedit nilai ini. Nilai diajar oleh ${pengajar}`
            }, { status: 403 });
        }

        row.set('nilai', nilai);
        row.set('catatan', catatan);
        await row.save();

        return NextResponse.json({
            message: 'Nilai berhasil diupdate',
            data: { username, tanggal, mapel, nilai, catatan }
        });
    } catch (error) {
        console.error('Error updating nilai:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}