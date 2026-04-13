import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'JOB_PROVIDER') {
      return NextResponse.json({ error: 'Only job providers can access this dashboard' }, { status: 403 })
    }

    const [
      totalJobs,
      openJobs,
      inProgressJobs,
      completedJobs,
      totalProposalsReceived,
      recentJobs,
      unreadNotifications,
    ] = await Promise.all([
      db.job.count({ where: { createdById: user.id } }),
      db.job.count({ where: { createdById: user.id, status: { in: ['OPEN', 'PROPOSALS_RECEIVED'] } } }),
      db.job.count({ where: { createdById: user.id, status: 'IN_PROGRESS' } }),
      db.job.count({ where: { createdById: user.id, status: 'COMPLETED' } }),
      db.proposal.count({ where: { job: { createdById: user.id } } }),
      db.job.findMany({
        where: { createdById: user.id },
        include: {
          _count: { select: { proposals: true } },
          selectedWorker: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.notification.count({ where: { userId: user.id, isRead: false } }),
    ])

    return NextResponse.json({
      stats: {
        totalJobs,
        openJobs,
        inProgressJobs,
        completedJobs,
        totalProposalsReceived,
      },
      recentJobs,
      unreadNotifications,
    })
  } catch (error) {
    console.error('Provider dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
