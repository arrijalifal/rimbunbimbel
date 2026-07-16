export const runtime = 'nodejs'; // ✅ Tambahkan ini di baris paling atas


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_ROUTES = ['/', '/login', '/register']; // ✅ Tambahkan '/'
const PUBLIC_API_ROUTES = ['/api/login', '/api/register'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  console.log('📌 Middleware:', pathname, 'Token:', !!token);

  // Jika di root path '/'
  if (pathname === '/') {
    if (token) {
      const user = verifyToken(token);
      if (user) {
        // Sudah login, redirect ke dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    // Belum login, redirect ke login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika akses ke login tapi sudah punya token valid
  if (pathname === '/login') {
    if (token) {
      const user = verifyToken(token);
      if (user) {
        console.log('✅ Already logged in, redirect to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    // Belum login, tampilkan halaman login
    return NextResponse.next();
  }

  // Public routes lainnya
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Public API
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected routes (harus login)
  if (!token) {
    console.log('❌ No token, redirect to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = verifyToken(token);
  if (!user) {
    console.log('❌ Invalid token, redirect to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  console.log('✅ Authenticated:', user.username);

  // Role-based access
  if (pathname.startsWith('/admin') && user.role !== 'Guru') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/murid') && user.role !== 'Murid') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.well-known).*)',
  ],
};