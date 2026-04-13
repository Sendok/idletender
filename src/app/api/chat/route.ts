import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    if (!jobId) return NextResponse.json({ error: 'Job ID required' }, { status: 400 })

    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const isProvider = job.createdById === user.id
    const isWorker = job.selectedWorkerId === user.id
    if (!isProvider && !isWorker) {
      return NextResponse.json({ error: 'Not authorized for this chat' }, { status: 403 })
    }

    const messages = await db.chatMessage.findMany({
      where: { jobId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Chat GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { jobId, message } = body
    if (!jobId || !message?.trim()) {
      return NextResponse.json({ error: 'Job ID and message are required' }, { status: 400 })
    }

    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const isProvider = job.createdById === user.id
    const isWorker = job.selectedWorkerId === user.id
    if (!isProvider && !isWorker) {
      return NextResponse.json({ error: 'Not authorized for this chat' }, { status: 403 })
    }

    const chatMessage = await db.chatMessage.create({
      data: { jobId, senderId: user.id, message: message.trim() },
      include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    })

    const receiverId = isProvider ? job.selectedWorkerId : job.createdById
    if (receiverId) {
      await db.notification.create({
        data: {
          userId: receiverId,
          type: 'NEW_MESSAGE',
          message: `New message from ${user.name} on "${job.title}"`,
          entityId: jobId,
        },
      })
    }

    return NextResponse.json({ message: chatMessage }, { status: 201 })
  } catch (error) {
    console.error('Chat POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
