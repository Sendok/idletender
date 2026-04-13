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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await db.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.createdById !== user.id) {
      return NextResponse.json({ error: 'Only the job creator can view proposals' }, { status: 403 })
    }

    const proposals = await db.proposal.findMany({
      where: { jobId: id },
      include: {
        worker: { select: { id: true, name: true, avatarUrl: true, bio: true, skills: true, location: true } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('Get proposals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
