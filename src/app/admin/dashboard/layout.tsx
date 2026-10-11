import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/admin/login')

  // The signed cookie already proves the session. A database hiccup while
  // loading the profile (name/email in the sidebar) must NOT log the user
  // out — only a successful lookup that finds no such user does.
  let user: { name: string | null; email: string } | null = null
  try {
    user = await prisma.user.findUnique({ where: { id: session.uid }, select: { name: true, email: true } })
    if (!user) redirect('/admin/login')
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw error
    console.error('Dashboard profile lookup error:', error)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#06090f' }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, minWidth: 0, padding: '36px 44px 60px' }}>{children}</main>
    </div>
  )
}
