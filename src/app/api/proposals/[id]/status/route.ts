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

    const proposal = await db.proposal.findUnique({
      where: { id },
      include: { job: true },
    })
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Worker can only WITHDRAW their own proposal
    if (user.role === 'WORKER') {
      if (proposal.workerId !== user.id) {
        return NextResponse.json({ error: 'You can only update your own proposals' }, { status: 403 })
      }
      if (status !== 'WITHDRAWN') {
        return NextResponse.json({ error: 'Workers can only withdraw proposals' }, { status: 400 })
      }
      if (proposal.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Cannot withdraw an accepted proposal' }, { status: 400 })
      }
    }

    // Job provider can SHORTLIST, ACCEPT, REJECT proposals on their jobs
    if (user.role === 'JOB_PROVIDER') {
      if (proposal.job.createdById !== user.id) {
        return NextResponse.json({ error: 'You can only update proposals on your own jobs' }, { status: 403 })
      }
      if (!['SHORTLISTED', 'ACCEPTED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status. Must be SHORTLISTED, ACCEPTED, or REJECTED' }, { status: 400 })
      }
    }

    const updatedProposal = await db.proposal.update({
      where: { id },
      data: { status },
    })

    // Notify the worker about status change
    if (status !== 'WITHDRAWN') {
      await db.notification.create({
        data: {
          userId: proposal.workerId,
          type: 'PROPOSAL_STATUS_CHANGED',
          message: `Your proposal for "${proposal.job.title}" has been ${status.toLowerCase()}`,
          entityId: proposal.jobId,
        },
      })
    } else {
      // Notify job provider about withdrawal
      await db.notification.create({
        data: {
          userId: proposal.job.createdById,
          type: 'PROPOSAL_STATUS_CHANGED',
          message: `A worker has withdrawn their proposal for "${proposal.job.title}"`,
          entityId: proposal.jobId,
        },
      })
    }

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: `PROPOSAL_${status}`,
        entityType: 'PROPOSAL',
        entityId: id,
      },
    })

    return NextResponse.json({ proposal: updatedProposal })
  } catch (error) {
    console.error('Update proposal status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
