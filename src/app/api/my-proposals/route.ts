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
      return NextResponse.json({ error: 'Only workers can view their proposals' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { workerId: user.id }
    if (status) where.status = status

    const proposals = await db.proposal.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            deadline: true,
            status: true,
            category: true,
            createdBy: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('Get my proposals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
