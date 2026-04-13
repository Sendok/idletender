import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'WORKER') {
      return NextResponse.json({ error: 'Only workers can submit proposals' }, { status: 403 })
    }

    const body = await request.json()
    const { jobId, proposalText, expectedBudget, estimatedDuration, attachments } = body

    if (!jobId || !proposalText || !expectedBudget || !estimatedDuration) {
      return NextResponse.json({ error: 'Job ID, proposal text, expected budget, and estimated duration are required' }, { status: 400 })
    }

    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (job.status !== 'OPEN' && job.status !== 'PROPOSALS_RECEIVED') {
      return NextResponse.json({ error: 'Cannot submit proposal to this job' }, { status: 400 })
    }

    const existing = await db.proposal.findUnique({
      where: { jobId_workerId: { jobId, workerId: user.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 409 })
    }

    const proposal = await db.proposal.create({
      data: {
        jobId,
        workerId: user.id,
        proposalText,
        expectedBudget: parseFloat(expectedBudget),
        estimatedDuration,
        status: 'SUBMITTED',
      },
    })

    // Create attachment records if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      await db.proposalAttachment.createMany({
        data: attachments.map((att: { fileName: string; fileSize: number; fileType: string; fileUrl: string }) => ({
          proposalId: proposal.id,
          fileName: att.fileName,
          fileSize: att.fileSize,
          fileType: att.fileType,
          fileUrl: att.fileUrl,
        })),
      })
    }

    if (job.status === 'OPEN') {
      await db.job.update({ where: { id: jobId }, data: { status: 'PROPOSALS_RECEIVED' } })
    }

    await db.notification.create({
      data: {
        userId: job.createdById,
        type: 'PROPOSAL_RECEIVED',
        message: `New proposal received for "${job.title}"`,
        entityId: jobId,
      },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'SUBMITTED_PROPOSAL',
        entityType: 'JOB',
        entityId: jobId,
      },
    })

    const fullProposal = await db.proposal.findUnique({
      where: { id: proposal.id },
      include: { attachments: true },
    })

    return NextResponse.json({ proposal: fullProposal }, { status: 201 })
  } catch (error) {
    console.error('Create proposal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
