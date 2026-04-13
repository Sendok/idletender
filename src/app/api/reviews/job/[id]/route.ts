import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviews = await db.review.findMany({
      where: { jobId: id },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true, role: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Get job reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
