import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Client as NeonClient } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  const neon = new NeonClient({ connectionString })
  
  const adapter = new PrismaNeon(neon)
  
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma