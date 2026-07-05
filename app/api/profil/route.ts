import { NextRequest, NextResponse } from 'next/server';
import { getProfilByUsername } from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Ambil token dari cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Ambil data profil berdasarkan username
    const profil = await getProfilByUsername(user.username);
    
    if (!profil) {
      return NextResponse.json(
        { error: 'Data profil tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profil });
  } catch (error) {
    console.error('Error fetching profil:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}