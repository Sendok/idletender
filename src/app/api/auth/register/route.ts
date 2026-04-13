import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken, sanitizeUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!['WORKER', 'JOB_PROVIDER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be WORKER or JOB_PROVIDER' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: { name, email, passwordHash, role }
    })

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    return NextResponse.json({ user: sanitizeUser(user), token }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
