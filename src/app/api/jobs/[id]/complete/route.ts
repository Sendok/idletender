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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const job = await db.job.findUnique({ where: { id } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Only the provider can approve the review and complete the job
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Only the job provider can approve completion' }, { status: 403 })
    }

    if (job.status !== 'REVIEW' && job.status !== 'IN_PROGRESS' && job.status !== 'PAYMENT_PENDING') {
      return NextResponse.json({ error: 'Job must be in REVIEW, IN_PROGRESS, or PAYMENT_PENDING status to complete' }, { status: 400 })
    }

    // If in REVIEW, transition to PAYMENT_PENDING (waiting for payment)
    if (job.status === 'REVIEW') {
      // Create escrow payment if not already created
      const existingPayment = await db.payment.findFirst({ where: { jobId: id, status: 'ESCROWED' } })
      const agreedBudget = job.agreedBudget || job.budgetMax

      if (!existingPayment && job.selectedWorkerId) {
        await db.payment.create({
          data: {
            jobId: id,
            senderId: user.id,
            receiverId: job.selectedWorkerId,
            amount: agreedBudget,
            status: 'ESCROWED',
          },
        })
      }

      const updatedJob = await db.job.update({
        where: { id },
        data: { status: 'PAYMENT_PENDING' },
      })

      if (job.selectedWorkerId) {
        await db.notification.create({
          data: {
            userId: job.selectedWorkerId,
            type: 'PAYMENT_RECEIVED',
            message: `Work on "${job.title}" approved! Payment of $${agreedBudget.toLocaleString()} is being processed.`,
            entityId: id,
          },
        })
      }

      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'APPROVED_REVIEW',
          entityType: 'JOB',
          entityId: id,
        },
      })

      return NextResponse.json({ job: updatedJob })
    }

    // PAYMENT_PENDING or IN_PROGRESS → COMPLETED (release payments)
    const updatedJob = await db.job.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })

    await db.jobAssignment.updateMany({
      where: { jobId: id, status: 'ACTIVE' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    // Release escrowed payments
    await db.payment.updateMany({
      where: { jobId: id, status: 'ESCROWED' },
      data: { status: 'RELEASED' },
    })

    if (job.selectedWorkerId) {
      await db.notification.create({
        data: {
          userId: job.selectedWorkerId,
          type: 'JOB_COMPLETED',
          message: `Job "${job.title}" has been completed! Payment released.`,
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
