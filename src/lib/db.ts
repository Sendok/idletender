import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if the cached client has the review model (added in schema update)
// If not, we need to create a fresh client
const cachedClient = globalForPrisma.prisma
const needsNewClient = cachedClient && !(cachedClient as any).review

if (needsNewClient) {
  try { cachedClient!.$disconnect() } catch {}
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
