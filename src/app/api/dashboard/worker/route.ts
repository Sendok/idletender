import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'WORKER') {
      return NextResponse.json({ error: 'Only workers can access this dashboard' }, { status: 403 })
    }

    const [
      totalProposals,
      shortlistedProposals,
      acceptedProposals,
      activeAssignments,
      completedAssignments,
      recentProposals,
      activeJobs,
      unreadNotifications,
    ] = await Promise.all([
      db.proposal.count({ where: { workerId: user.id } }),
      db.proposal.count({ where: { workerId: user.id, status: 'SHORTLISTED' } }),
      db.proposal.count({ where: { workerId: user.id, status: 'ACCEPTED' } }),
      db.jobAssignment.count({ where: { workerId: user.id, status: 'ACTIVE' } }),
      db.jobAssignment.count({ where: { workerId: user.id, status: 'COMPLETED' } }),
      db.proposal.findMany({
        where: { workerId: user.id },
        include: {
          job: { select: { id: true, title: true, status: true, budgetMin: true, budgetMax: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.jobAssignment.findMany({
        where: { workerId: user.id, status: 'ACTIVE' },
        include: {
          job: { select: { id: true, title: true, status: true, deadline: true } },
        },
        orderBy: { assignedAt: 'desc' },
      }),
      db.notification.count({ where: { userId: user.id, isRead: false } }),
    ])

    return NextResponse.json({
      stats: {
        totalProposals,
        shortlistedProposals,
        acceptedProposals,
        activeJobs: activeAssignments,
        completedJobs: completedAssignments,
      },
      recentProposals,
      activeJobs: activeJobs,
      unreadNotifications,
    })
  } catch (error) {
    console.error('Worker dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
