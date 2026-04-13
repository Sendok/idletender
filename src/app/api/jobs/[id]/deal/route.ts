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
    if (user.role !== 'JOB_PROVIDER') {
      return NextResponse.json({ error: 'Only providers can accept deals' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { agreedBudget } = body

    if (!agreedBudget) {
      return NextResponse.json({ error: 'Agreed budget is required' }, { status: 400 })
    }

    const job = await db.job.findUnique({ where: { id } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Not your job' }, { status: 403 })
    }
    if (job.status !== 'WORKER_SELECTED') {
      return NextResponse.json({ error: 'Job must be in WORKER_SELECTED status to deal' }, { status: 400 })
    }
    if (!job.selectedWorkerId) {
      return NextResponse.json({ error: 'No worker selected' }, { status: 400 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        agreedBudget: parseFloat(agreedBudget),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        selectedWorker: { select: { id: true, name: true } },
      },
    })

    await db.jobAssignment.create({
      data: {
        jobId: id,
        workerId: job.selectedWorkerId,
        status: 'ACTIVE',
      },
    })

    await db.notification.create({
      data: {
        userId: job.selectedWorkerId,
        type: 'JOB_STATUS_CHANGED',
        message: `Deal accepted for "${job.title}"! Budget: $${parseFloat(agreedBudget).toLocaleString()}. Work has started.`,
        entityId: id,
      },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'DEAL_ACCEPTED',
        entityType: 'JOB',
        entityId: id,
      },
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Deal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
