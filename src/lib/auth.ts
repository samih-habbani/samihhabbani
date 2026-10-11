import crypto from 'node:crypto'
import { prisma } from './prisma'

// Passwords live in the SAME `user` table as syrama-yachting, hashed with its
// scheme (PBKDF2-SHA512, 1000 iterations, fixed salt) — so the same account
// works in both backoffices. Kept bit-for-bit compatible on purpose.
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex')
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    ?? await prisma.user.findUnique({ where: { email: email.trim() } })
  // Hash even when the user doesn't exist so response time doesn't reveal it.
  const hashed = hashPassword(password)
  if (!user || !safeEqual(hashed, user.password)) return null
  return user
}
