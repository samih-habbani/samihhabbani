import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

// Gatekeeper for the backoffice. Every admin API handler ALSO checks the
// session itself (requireSession) — this is the first, not the only, layer.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/admin')
  const isLogin = pathname === '/admin/login'

  let authed = false
  try {
    authed = !!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  } catch {
    authed = false // AUTH_SECRET missing → nobody gets in
  }

  if (isLogin) {
    if (authed) return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    return NextResponse.next()
  }

  if (!authed) {
    if (isApi) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const res = NextResponse.next()
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'private, no-store')
  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
