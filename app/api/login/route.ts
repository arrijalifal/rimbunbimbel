import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/googleSheets';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    if (role && user.role && user.role !== role) {
      return NextResponse.json(
        { error: `Akun ini bukan untuk ${role}` },
        { status: 403 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // ✅ Perbaiki: hanya kirim username dan role
    const token = generateToken({
      username: user.username,
      role: user.role || 'Murid'
    });

    console.log('🔄 Setting cookie...');
    console.log('  Token:', token.substring(0, 20) + '...');
    console.log('  Environment:', process.env.NODE_ENV);

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        username: user.username,
        role: user.role || 'Murid'
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });

    console.log('✅ Cookie set response:', response.cookies);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}