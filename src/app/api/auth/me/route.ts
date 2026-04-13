import { NextResponse } from 'next/server'
import { getUserFromRequest, sanitizeUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
