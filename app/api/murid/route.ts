import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';

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

    // Hanya guru yang bisa akses
    if (user.role !== 'Guru') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[0]; // Sheet Data Murid
    const rows = await sheet.getRows();

    const murid = rows.map(row => ({
      username: row.get('username'),
      nama: row.get('nama'),
      kelas: row.get('kelas'),
      program: row.get('program'),
    }));

    return NextResponse.json({ murid });
  } catch (error) {
    console.error('Error fetching murid:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}