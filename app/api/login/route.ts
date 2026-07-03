import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/googleSheets';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    // Cari user di Google Sheet
    const user = await findUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password (pastikan password di sheet sudah di-hash)
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name
    });

    // Set cookie
    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 hari
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}