import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await db.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Only the job creator can start the job' }, { status: 403 })
    }
    if (job.status !== 'WORKER_SELECTED') {
      return NextResponse.json({ error: 'Job must be in WORKER_SELECTED status to start' }, { status: 400 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    })

    if (job.selectedWorkerId) {
      await db.notification.create({
        data: {
          userId: job.selectedWorkerId,
          type: 'JOB_STATUS_CHANGED',
          message: `Job "${job.title}" is now in progress`,
          entityId: id,
        },
      })
    }

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'STARTED_JOB',
        entityType: 'JOB',
        entityId: id,
      },
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Start job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
