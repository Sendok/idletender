import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, sanitizeUser } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, skills, location, avatarUrl } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (skills !== undefined) updateData.skills = skills
    if (location !== undefined) updateData.location = location
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ user: sanitizeUser(updatedUser) })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
