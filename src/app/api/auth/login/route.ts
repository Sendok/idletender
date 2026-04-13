import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, generateToken, sanitizeUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    return NextResponse.json({ user: sanitizeUser(user), token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
