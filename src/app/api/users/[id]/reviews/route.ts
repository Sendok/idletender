import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviews = await db.review.findMany({
      where: { receiverId: id },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true, role: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length })
  } catch (error) {
    console.error('Get user reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
