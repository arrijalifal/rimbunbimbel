import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password, role } = body;

  // In production, validate against database
  // This is just a simple example
  if (username === 'demo' && password === 'demo') {
    return NextResponse.json({
      success: true,
      user: {
        id: '1',
        name: 'Rina Permata',
        role: role || 'Murid',
        email: 'rina@rimbun.id',
      },
    });
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  );
}