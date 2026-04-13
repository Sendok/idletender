import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, rating, comment } = body

    if (!jobId || !rating || !comment) {
      return NextResponse.json({ error: 'Job ID, rating, and comment are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: { reviews: true },
    })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only review completed jobs' }, { status: 400 })
    }

    // Determine reviewer and receiver
    let reviewerId = user.id
    let receiverId = ''

    if (user.role === 'JOB_PROVIDER' && job.createdById === user.id) {
      if (!job.selectedWorkerId) {
        return NextResponse.json({ error: 'No worker was assigned to this job' }, { status: 400 })
      }
      receiverId = job.selectedWorkerId
    } else if (user.role === 'WORKER' && job.selectedWorkerId === user.id) {
      receiverId = job.createdById
    } else {
      return NextResponse.json({ error: 'You are not authorized to review this job' }, { status: 403 })
    }

    // Check if already reviewed
    const existingReview = await db.review.findUnique({
      where: { jobId_reviewerId: { jobId, reviewerId } },
    })
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this job' }, { status: 409 })
    }

    const review = await db.review.create({
      data: {
        jobId,
        reviewerId,
        receiverId,
        rating: parseInt(rating.toString()),
        comment,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    })

    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'REVIEW_RECEIVED',
        message: `${user.name} left you a ${rating}-star review on "${job.title}"`,
        entityId: jobId,
      },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'SUBMITTED_REVIEW',
        entityType: 'JOB',
        entityId: jobId,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
