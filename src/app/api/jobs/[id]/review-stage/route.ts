import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const job = await db.job.findUnique({ where: { id } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const isProvider = job.createdById === user.id
    const isWorker = job.selectedWorkerId === user.id
    if (!isProvider && !isWorker) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (job.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Job must be in IN_PROGRESS to submit for review' }, { status: 400 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: { status: 'REVIEW' },
      include: {
        createdBy: { select: { id: true, name: true } },
        selectedWorker: { select: { id: true, name: true } },
      },
    })

    await db.notification.create({
      data: {
        userId: job.createdById,
        type: 'JOB_STATUS_CHANGED',
        message: `Work on "${job.title}" is submitted for your review.`,
        entityId: id,
      },
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Review stage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
