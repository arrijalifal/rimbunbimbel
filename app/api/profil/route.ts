import { NextRequest, NextResponse } from 'next/server';
import { getProfilByUsername } from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Jika ada parameter username, ambil data profil untuk username tersebut
    if (username) {
      const profil = await getProfilByUsername(username);
      if (!profil) {
        return NextResponse.json(
          { error: 'Data profil tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json({ profil });
    }

    // Jika tidak ada parameter, ambil dari token
    if (!token) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

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