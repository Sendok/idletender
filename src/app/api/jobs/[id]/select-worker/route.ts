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

    const job = await db.job.findUnique({
      where: { id },
      include: { proposals: true },
    })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Only the job creator can select a worker' }, { status: 403 })
    }
    if (job.status !== 'OPEN' && job.status !== 'PROPOSALS_RECEIVED') {
      return NextResponse.json({ error: 'Cannot select worker for this job status' }, { status: 400 })
    }

    const body = await request.json()
    const { workerId } = body
    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 })
    }

    const acceptedProposal = job.proposals.find(p => p.workerId === workerId && p.status === 'ACCEPTED')
    if (!acceptedProposal) {
      const shortlistedProposal = job.proposals.find(p => p.workerId === workerId && (p.status === 'SHORTLISTED' || p.status === 'SUBMITTED'))
      if (shortlistedProposal) {
        await db.proposal.update({ where: { id: shortlistedProposal.id }, data: { status: 'ACCEPTED' } })
      } else {
        return NextResponse.json({ error: 'Worker must have a proposal for this job' }, { status: 400 })
      }
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: {
        selectedWorkerId: workerId,
        status: 'WORKER_SELECTED',
      },
    })

    await db.jobAssignment.create({
      data: {
        jobId: id,
        workerId,
        status: 'ACTIVE',
      },
    })

    await db.proposal.updateMany({
      where: { jobId: id, workerId: { not: workerId }, status: { notIn: ['REJECTED', 'WITHDRAWN'] } },
      data: { status: 'REJECTED' },
    })

    await db.notification.create({
      data: {
        userId: workerId,
        type: 'WORKER_SELECTED',
        message: `You have been selected for job "${job.title}"`,
        entityId: id,
      },
    })

    const otherWorkerIds = job.proposals.filter(p => p.workerId !== workerId).map(p => p.workerId)
    for (const wid of otherWorkerIds) {
      await db.notification.create({
        data: {
          userId: wid,
          type: 'PROPOSAL_STATUS_CHANGED',
          message: `Your proposal for "${job.title}" was not selected`,
          entityId: id,
        },
      })
    }

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'SELECTED_WORKER',
        entityType: 'JOB',
        entityId: id,
      },
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Select worker error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
