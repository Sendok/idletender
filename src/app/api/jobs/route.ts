import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, sanitizeUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, avatarUrl: true, location: true } },
          _count: { select: { proposals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.job.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'JOB_PROVIDER') {
      return NextResponse.json({ error: 'Only job providers can create jobs' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, budgetMin, budgetMax, deadline, skills, category } = body

    if (!title || !description || !budgetMin || !budgetMax || !deadline) {
      return NextResponse.json({ error: 'Title, description, budget range, and deadline are required' }, { status: 400 })
    }

    const job = await db.job.create({
      data: {
        title,
        description,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        deadline: new Date(deadline),
        skills: skills || null,
        category: category || null,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATED_JOB',
        entityType: 'JOB',
        entityId: job.id,
      },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
