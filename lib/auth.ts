import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface UserPayload {
  id: string | number;
  username: string;
  name?: string;
}

export function generateToken(user: UserPayload) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function comparePassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}