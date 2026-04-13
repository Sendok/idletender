import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_IN = '7d'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user) return null

  return user
}

export function sanitizeUser(user: any) {
  const { passwordHash, ...safeUser } = user
  return safeUser
}
