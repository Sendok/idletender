import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    const where: any = {}
    if (jobId) where.jobId = jobId
    where.OR = [{ senderId: user.id }, { receiverId: user.id }]

    const payments = await db.payment.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Payments GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'JOB_PROVIDER') {
      return NextResponse.json({ error: 'Only providers can make payments' }, { status: 403 })
    }

    const body = await request.json()
    const { jobId, amount } = body
    if (!jobId || !amount) {
      return NextResponse.json({ error: 'Job ID and amount are required' }, { status: 400 })
    }

    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (!job.selectedWorkerId) {
      return NextResponse.json({ error: 'No worker assigned to this job' }, { status: 400 })
    }
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Not your job' }, { status: 403 })
    }

    const payment = await db.payment.create({
      data: {
        jobId,
        senderId: user.id,
        receiverId: job.selectedWorkerId,
        amount: parseFloat(amount),
        status: 'ESCROWED',
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    })

    await db.notification.create({
      data: {
        userId: job.selectedWorkerId,
        type: 'PAYMENT_RECEIVED',
        message: `Payment of $${parseFloat(amount).toLocaleString()} received for "${job.title}"`,
        entityId: jobId,
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Payment POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
