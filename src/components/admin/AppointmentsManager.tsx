'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft, CalendarClock, Pencil, Trash2, Save, MapPin } from 'lucide-react'
import ProviderPicker, { type ProviderLite } from './ProviderPicker'
import { Badge, Button, Card, EmptyState, Field, Notice, PageHeader, Pagination, Section, TextArea, TextField } from './ui'

interface Appointment {
  id: number; title: string; providerId: number | null; providerName?: string | null
  date: string; startTime: string | null; endTime: string | null; location: string | null; notes: string | null
}

const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')
const full: React.CSSProperties = { gridColumn: '1 / -1' }
const GRID = '1.1fr 1.8fr 1.3fr 1.2fr 90px'

function AppointmentForm({ appointment, presetDate, onSaved, onCancel }: { appointment: Appointment | null; presetDate: string; onSaved: () => void; onCancel: () => void }) {
  const a = appointment
  // The provider is optional: an appointment doesn't have to be linked to anyone.
  const [provider, setProvider] = useState<ProviderLite | null>(a?.providerId ? { id: a.providerId, name: null, firstName: null, company: a.providerName ?? null, city: null, country: null, type: null } : null)
  const [f, setF] = useState({ title: a?.title ?? '', date: day(a?.date) || presetDate, startTime: a?.startTime ?? '', endTime: a?.endTime ?? '', location: a?.location ?? '', notes: a?.notes ?? '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(a ? `/api/admin/appointments/${a.id}` : '/api/admin/appointments', {
        method: a ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, providerId: provider?.id ?? null }),
      })
      if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to save'); return }
      onSaved()
    } catch { setError('An error occurred. Please try again.') } finally { setSaving(false) }
  }

  return (
    <Card style={{ maxWidth: 760, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>{a ? 'Edit Appointment' : 'New Appointment'}</h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>A meeting or call for your calendar — not a billable mission.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={submit}>
        <Section title="Appointment">
          <div style={full}><Field label="Title *"><TextField value={f.title} onChange={(e) => set({ title: e.target.value })} required maxLength={200} placeholder="e.g. Call with Ashwin about November sessions" /></Field></div>
          <Field label="Date *"><TextField type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} required /></Field>
          <Field label="Start time"><TextField type="time" value={f.startTime} onChange={(e) => set({ startTime: e.target.value })} /></Field>
          <Field label="End time"><TextField type="time" value={f.endTime} onChange={(e) => set({ endTime: e.target.value })} /></Field>
          <div style={full}><Field label="Location / link"><TextField value={f.location} onChange={(e) => set({ location: e.target.value })} placeholder="Address, or Zoom / Teams link" /></Field></div>
        </Section>
        <Section title="Linked provider (optional)">
          <div style={full}><Field label="Provider" hint="Leave empty if the appointment isn't related to a provider."><ProviderPicker value={provider} onChange={setProvider} /></Field></div>
        </Section>
        <Section title="Notes">
          <div style={full}><TextArea value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
        </Section>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save Appointment'}</Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

export default function AppointmentsManager() {
  const [rows, setRows] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [form, setForm] = useState<{ appointment: Appointment | null; date: string } | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/appointments?page=${p}`)
      if (res.ok) { const d = await res.json(); setRows(d.appointments); setTotalPages(d.totalPages); setPage(p) }
    } finally { setLoading(false) }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
  useEffect(() => { load(1) }, [load])
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const edit = q.get('edit')
    if (edit) {
      fetch(`/api/admin/appointments/${edit}`).then((r) => (r.ok ? r.json() : null)).then((ap) => { if (ap) setForm({ appointment: ap, date: '' }) })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open the form from the URL on mount
    } else if (q.get('new') === '1') setForm({ appointment: null, date: q.get('date') || '' })
  }, [])

  const remove = async (a: Appointment) => {
    if (!confirm(`Delete appointment "${a.title}"?`)) return
    setError('')
    const res = await fetch(`/api/admin/appointments/${a.id}`, { method: 'DELETE' })
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to delete'); return }
    load(page)
  }

  if (form) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setForm(null)} style={{ marginBottom: 24 }}><ArrowLeft size={14} /> Back to appointments</Button>
        <AppointmentForm appointment={form.appointment} presetDate={form.date} onCancel={() => setForm(null)} onSaved={() => { setForm(null); load(1) }} />
      </div>
    )
  }

  const text: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  const d = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Meetings and calls that appear in your calendar (in purple). Not billable, a provider link is optional."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Appointments' }]}
        action={<div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/dashboard/calendar" style={{ textDecoration: 'none' }}><Button variant="secondary">Calendar</Button></Link>
          <Button variant="primary" onClick={() => setForm({ appointment: null, date: '' })}><Plus size={14} strokeWidth={2.5} /> New appointment</Button>
        </div>}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading…</Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={CalendarClock} title="No appointments yet" description="Add your first meeting with the button above." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)', fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>
            <div>Date</div><div>Appointment</div><div>Provider</div><div>Location</div><div />
          </div>
          {rows.map((a) => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
              <div style={text}>{d(a.date)}<div style={{ fontSize: 11.5, color: '#6b6b60' }}>{[a.startTime, a.endTime].filter(Boolean).join(' – ')}</div></div>
              <div style={{ ...text, color: '#f5eedd' }}>{a.title}</div>
              <div>{a.providerName ? <Badge tone="blue">{a.providerName}</Badge> : <span style={{ color: '#5a5a52', fontSize: 12 }}>—</span>}</div>
              <div style={{ ...text, display: 'flex', alignItems: 'center', gap: 5 }}>{a.location ? <><MapPin size={11} style={{ flexShrink: 0 }} />{a.location}</> : '—'}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <Button size="sm" variant="ghost" onClick={() => setForm({ appointment: a, date: '' })} title="Edit"><Pencil size={13} /></Button>
                <Button size="sm" variant="danger" onClick={() => remove(a)} title="Delete"><Trash2 size={13} /></Button>
              </div>
            </div>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(p)} />
        </Card>
      )}
    </div>
  )
}
