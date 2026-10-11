import crypto from 'node:crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'sh_admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function secret(): string {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 32) throw new Error('AUTH_SECRET is missing or shorter than 32 characters')
  return s
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

// Unlike a bare `userId` cookie, the token is HMAC-signed with AUTH_SECRET and
// carries an expiry — it can't be forged or extended without the secret.
export function createSessionToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token?: string | null): { uid: number } | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null

  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof uid !== 'number' || typeof exp !== 'number' || exp < Math.floor(Date.now() / 1000)) return null
    return { uid }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ uid: number } | null> {
  const store = await cookies()
  return verifySessionToken(store.get(SESSION_COOKIE)?.value)
}

// For route handlers: returns the session, or a ready-made 401 response.
export async function requireSession(): Promise<{ uid: number } | Response> {
  const session = await getSession()
  return session ?? Response.json({ error: 'Unauthorized' }, { status: 401 })
}
