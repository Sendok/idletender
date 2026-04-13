import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(request)

    const job = await db.job.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true, location: true, bio: true } },
        selectedWorker: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { proposals: true } },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    let proposals = []
    if (user && (user.id === job.createdById || user.role === 'WORKER')) {
      if (user.id === job.createdById) {
        proposals = await db.proposal.findMany({
          where: { jobId: id },
          include: {
            worker: { select: { id: true, name: true, avatarUrl: true, bio: true, skills: true, location: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
      } else {
        const myProposal = await db.proposal.findUnique({
          where: { jobId_workerId: { jobId: id, workerId: user.id } },
        })
        if (myProposal) proposals = [myProposal]
      }
    }

    return NextResponse.json({ job, proposals })
  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const job = await db.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Only the job creator can update this job' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, budgetMin, budgetMax, deadline, status, skills, category } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (budgetMin !== undefined) updateData.budgetMin = parseFloat(budgetMin)
    if (budgetMax !== undefined) updateData.budgetMax = parseFloat(budgetMax)
    if (deadline !== undefined) updateData.deadline = new Date(deadline)
    if (status !== undefined) updateData.status = status
    if (skills !== undefined) updateData.skills = skills
    if (category !== undefined) updateData.category = category

    const updatedJob = await db.job.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        selectedWorker: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    if (status && status !== job.status) {
      await db.notification.create({
        data: {
          userId: job.selectedWorkerId || job.createdById,
          type: 'JOB_STATUS_CHANGED',
          message: `Job "${job.title}" status changed to ${status}`,
          entityId: job.id,
        },
      })
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: `JOB_STATUS_CHANGED_TO_${status}`,
          entityType: 'JOB',
          entityId: job.id,
        },
      })
    }

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Update job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: 'Only the job creator can delete this job' }, { status: 403 })
    }

    await db.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'CANCELLED_JOB',
        entityType: 'JOB',
        entityId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
