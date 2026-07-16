import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET tidak ditemukan di environment variables');
}

console.log('🔑 JWT_SECRET loaded:', JWT_SECRET.substring(0, 5) + '...' + JWT_SECRET.substring(JWT_SECRET.length - 5));

export interface UserPayload {
  username: string;
  role: string;
}

export function generateToken(user: UserPayload) {
  console.log('🔐 Generating token with secret:', JWT_SECRET.substring(0, 5) + '...');
  return jwt.sign(
    { 
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string) {
  try {
    console.log('🔑 Verifying token with secret:', JWT_SECRET.substring(0, 5) + '...');
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    console.log('✅ Token valid:', decoded);
    return decoded;
  } catch (error) {
    // ✅ Perbaiki: cek tipe error sebelum akses .message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Token verification failed:', errorMessage);
    console.error('   JWT_SECRET length:', JWT_SECRET.length);
    return null;
  }
}

export function comparePassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}