import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notification = await db.notification.findUnique({ where: { id } })
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
