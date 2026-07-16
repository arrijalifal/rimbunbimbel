import { NextRequest, NextResponse } from 'next/server';
import { getProfilByUsername, getGuruByUsername } from '@/lib/googleSheets';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Jika ada parameter username, ambil data profil untuk username tersebut
    if (username) {
      // Coba cari di data murid dulu
      let profil = await getProfilByUsername(username);
      
      // Jika tidak ditemukan, coba cari di data guru
      if (!profil) {
        const guru = await getGuruByUsername(username);
        if (guru) {
          // Konversi ke format yang sama dengan profil murid
          profil = {
            username: guru.username,
            nama: guru.nama,
            kelas: 'Guru',
            program: '-',
            jadwal_les: '-',
            bergabung: '-',
          };
        }
      }
      
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

    // Coba cari di data murid dulu
    let profil = await getProfilByUsername(user.username);
    let isGuru = false;
    
    // Jika tidak ditemukan di murid, coba cari di data guru
    if (!profil) {
      const guru = await getGuruByUsername(user.username);
      if (guru) {
        isGuru = true;
        profil = {
          username: guru.username,
          nama: guru.nama,
          kelas: 'Guru',
          program: '-',
          jadwal_les: '-',
          bergabung: '-',
        };
      }
    }
    
    if (!profil) {
      return NextResponse.json(
        { error: 'Data profil tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profil, isGuru });
  } catch (error) {
    console.error('Error fetching profil:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}