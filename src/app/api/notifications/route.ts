import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = { userId: user.id }
    if (unreadOnly) where.isRead = false

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId: user.id, isRead: false } }),
    ])

    return NextResponse.json({ notifications, total, unreadCount, page, limit })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
