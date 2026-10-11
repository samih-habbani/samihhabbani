'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Receipt, Building2, ExternalLink, LogOut, Briefcase, CalendarDays } from 'lucide-react'

const NAV = [
  { label: 'Main', items: [{ label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, exact: true }] },
  {
    label: 'Training',
    items: [
      { label: 'Calendar', href: '/admin/dashboard/calendar', icon: CalendarDays },
      { label: 'Missions', href: '/admin/dashboard/missions', icon: Briefcase },
      { label: 'Quotes', href: '/admin/dashboard/quotes', icon: FileText },
      { label: 'Invoices', href: '/admin/dashboard/invoices', icon: Receipt },
    ],
  },
  { label: 'Network', items: [{ label: 'Providers', href: '/admin/dashboard/providers', icon: Building2 }] },
]

export default function Sidebar({ user }: { user: { name: string | null; email: string } | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 7, marginBottom: 2,
    fontFamily: 'var(--font-lora)', fontSize: 13, fontWeight: active ? 600 : 500,
    color: active ? '#f5eedd' : '#8f8f7f', textDecoration: 'none',
    background: active ? 'linear-gradient(135deg, rgba(184,151,74,0.16) 0%, rgba(184,151,74,0.05) 100%)' : 'transparent',
    border: active ? '1px solid rgba(184,151,74,0.25)' : '1px solid transparent',
  })

  return (
    <aside style={{ width: 248, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', background: '#080b12', borderRight: '1px solid rgba(184,151,74,0.1)' }}>
      <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'block', padding: '26px 24px 22px' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, letterSpacing: '0.08em', color: '#f5eedd' }}>SAMIH HABBANI</div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10, letterSpacing: '0.28em', color: '#8f8f7f', marginTop: 2 }}>TRAINING ADMIN</div>
      </Link>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 14px' }}>
        {NAV.map((group) => (
          <div key={group.label} style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a5a52', padding: '0 10px', marginBottom: 8 }}>{group.label}</div>
            {group.items.map((item) => {
              const active = 'exact' in item && item.exact ? pathname === item.href : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} style={linkStyle(active)}>
                  <Icon size={16} strokeWidth={1.75} color={active ? '#d4b472' : '#75756a'} style={{ flexShrink: 0 }} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid rgba(184,151,74,0.1)', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #d4b472, #b8974a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 700, color: '#06090f' }}>
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 600, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>
        <Link href="/" style={{ ...linkStyle(false), marginBottom: 0 }}>
          <ExternalLink size={16} strokeWidth={1.75} color="#75756a" /> Back to site
        </Link>
        <button onClick={logout} style={{ ...linkStyle(false), width: '100%', background: 'transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 0 }}>
          <LogOut size={16} strokeWidth={1.75} color="#75756a" /> Logout
        </button>
      </div>
    </aside>
  )
}
