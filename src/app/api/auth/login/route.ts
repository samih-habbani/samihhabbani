import { cookies } from 'next/headers'
import { verifyUser } from '@/lib/auth'
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session'

// Best-effort brute-force brake. Serverless instances don't share memory, so
// this only slows a single warm instance — the fixed delay on failure and the
// slow password hash are what really make guessing impractical.
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function tooMany(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now })
    return false
  }
  entry.count += 1
  return entry.count > MAX_ATTEMPTS
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (tooMany(ip)) {
      return Response.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await verifyUser(email, password)
    if (!user) {
      await new Promise((r) => setTimeout(r, 600))
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    attempts.delete(ip)
    const store = await cookies()
    store.set(SESSION_COOKIE, createSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'An error occurred during login' }, { status: 500 })
  }
}
