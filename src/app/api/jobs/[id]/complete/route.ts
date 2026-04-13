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
    if (job.createdById !== user.id && job.selectedWorkerId !== user.id) {
      return NextResponse.json({ error: 'Only the job creator or assigned worker can complete the job' }, { status: 403 })
    }
    if (job.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Job must be in IN_PROGRESS status to complete' }, { status: 400 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })

    await db.jobAssignment.updateMany({
      where: { jobId: id, status: 'ACTIVE' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    if (job.selectedWorkerId) {
      await db.notification.create({
        data: {
          userId: job.selectedWorkerId,
          type: 'JOB_COMPLETED',
          message: `Job "${job.title}" has been completed`,
          entityId: id,
        },
      })
    }

    await db.notification.create({
      data: {
        userId: job.createdById,
        type: 'JOB_COMPLETED',
        message: `Job "${job.title}" has been marked as completed`,
        entityId: id,
      },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'COMPLETED_JOB',
        entityType: 'JOB',
        entityId: id,
      },
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Complete job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
