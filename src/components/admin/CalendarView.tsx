'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button, Card, PageHeader } from './ui'

interface Mission { id: number; title: string; clientName: string | null; providerName?: string | null; startDate: string; endDate: string | null; startTime: string | null; endTime: string | null; status: string }

const key = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COLORS: Record<string, { bg: string; border: string; text: string }> = {
  planned: { bg: 'rgba(184,151,74,0.16)', border: 'rgba(184,151,74,0.4)', text: '#e6cf9a' },
  done: { bg: 'rgba(122,168,116,0.16)', border: 'rgba(122,168,116,0.4)', text: '#a6d3a0' },
  cancelled: { bg: 'rgba(196,94,94,0.12)', border: 'rgba(196,94,94,0.35)', text: '#e08080' },
}

export default function CalendarView() {
  const now = new Date()
  const [cursor, setCursor] = useState(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)))
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  // Monday-first grid covering the whole month (4–6 weeks)
  const first = cursor
  const offset = (first.getUTCDay() + 6) % 7
  const gridStart = addDays(first, -offset)
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  const weeks = Math.ceil((offset + daysInMonth) / 7)
  const gridEnd = addDays(gridStart, weeks * 7 - 1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/missions?from=${key(gridStart)}&to=${key(gridEnd)}`)
      if (res.ok) setMissions((await res.json()).missions)
    } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor])
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the month changes
  useEffect(() => { load() }, [load])

  const byDay = new Map<string, Mission[]>()
  for (const m of missions) {
    const start = new Date(m.startDate), end = new Date(m.endDate ?? m.startDate)
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const k = key(d)
      byDay.set(k, [...(byDay.get(k) ?? []), m])
    }
  }

  const move = (n: number) => setCursor(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + n, 1)))
  const today = key(new Date())
  const label = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Your training missions, month by month."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Calendar' }]}
        action={<Link href="/admin/dashboard/missions?new=1" style={{ textDecoration: 'none' }}><Button variant="primary"><Plus size={14} strokeWidth={2.5} /> New mission</Button></Link>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Button variant="secondary" size="sm" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={15} /></Button>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, color: '#f5eedd', minWidth: 190, textAlign: 'center' }}>{label}</div>
        <Button variant="secondary" size="sm" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={15} /></Button>
        <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)))}>Today</Button>
        {loading && <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#6b6b60' }}>Loading…</span>}
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
          {WEEKDAYS.map((w) => <div key={w} style={{ padding: '12px 10px', fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>{w}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {Array.from({ length: weeks * 7 }, (_, i) => {
            const d = addDays(gridStart, i), k = key(d)
            const inMonth = d.getUTCMonth() === first.getUTCMonth()
            const items = byDay.get(k) ?? []
            return (
              <div key={k} style={{ minHeight: 112, padding: 8, borderRight: (i + 1) % 7 ? '1px solid rgba(184,151,74,0.08)' : 'none', borderBottom: '1px solid rgba(184,151,74,0.08)', background: k === today ? 'rgba(184,151,74,0.07)' : 'transparent', opacity: inMonth ? 1 : 0.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: k === today ? 700 : 500, color: k === today ? '#d4b472' : '#a8a89a' }}>{d.getUTCDate()}</span>
                  <Link href={`/admin/dashboard/missions?new=1&date=${k}`} title="Add a mission" style={{ color: '#5a5a52', display: 'flex' }}><Plus size={12} /></Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {items.map((m) => {
                    const c = COLORS[m.status] ?? COLORS.planned
                    return (
                      <Link key={m.id} href={`/admin/dashboard/missions?edit=${m.id}`} title={[m.title, m.clientName, m.providerName].filter(Boolean).join(' · ')}
                        style={{ display: 'block', textDecoration: 'none', padding: '4px 7px', borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: 'var(--font-lora)', fontSize: 11, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: m.status === 'cancelled' ? 0.55 : 1 }}>
                        {m.startTime && key(new Date(m.startDate)) === k ? <b>{m.startTime} </b> : null}{m.title}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
