'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft, Briefcase, Pencil, Trash2, Save, ExternalLink, Users } from 'lucide-react'
import ProviderPicker, { type ProviderLite } from './ProviderPicker'
import { Badge, Button, Card, EmptyState, Field, Notice, PageHeader, Pagination, SelectField, Section, TextArea, TextField, type Tone } from './ui'

interface Mission {
  id: number; providerId: number; providerName?: string | null; title: string; description: string | null; clientName: string | null
  location: string | null; missionUrl: string | null; participants: number | null; startDate: string; endDate: string | null
  startTime: string | null; endTime: string | null; hours: number | null; hourlyRate: number | null; priceTotal: number | null
  currency: string; status: string; invoiceId: number | null
}

const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')
const round2 = (n: number) => Math.round(n * 100) / 100
const tone = (s: string): Tone => (s === 'done' ? 'green' : s === 'cancelled' ? 'red' : s === 'tbc' ? 'blue' : 'gold')
const label = (s: string) => (s === 'tbc' ? 'to be confirmed' : s)
const full: React.CSSProperties = { gridColumn: '1 / -1' }
const GRID = '1.1fr 1.6fr 1.3fr 1fr 1fr 90px'

function MissionForm({ mission, presetDate, onSaved, onCancel }: { mission: Mission | null; presetDate: string; onSaved: () => void; onCancel: () => void }) {
  const m = mission
  const [provider, setProvider] = useState<ProviderLite | null>(m ? { id: m.providerId, name: null, firstName: null, company: m.providerName ?? null, city: null, country: null, type: null } : null)
  const [f, setF] = useState({
    title: m?.title ?? '', description: m?.description ?? '', clientName: m?.clientName ?? '', location: m?.location ?? '', missionUrl: m?.missionUrl ?? '',
    participants: m?.participants != null ? String(m.participants) : '', startDate: day(m?.startDate) || presetDate, endDate: day(m?.endDate),
    startTime: m?.startTime ?? '', endTime: m?.endTime ?? '', hours: m?.hours != null ? String(m.hours) : '', hourlyRate: m?.hourlyRate != null ? String(m.hourlyRate) : '',
    priceTotal: m?.priceTotal != null ? String(m.priceTotal) : '', currency: m?.currency ?? 'AED', status: m?.status ?? 'planned',
  })
  const [touched, setTouched] = useState(m?.priceTotal != null && !(m.hours != null && m.hourlyRate != null && round2(m.hours * m.hourlyRate) === m.priceTotal))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (patch: Partial<typeof f>) => setF((prev) => {
    const next = { ...prev, ...patch }
    if (!touched && ('hours' in patch || 'hourlyRate' in patch)) {
      const h = parseFloat(next.hours), r = parseFloat(next.hourlyRate)
      if (Number.isFinite(h) && Number.isFinite(r)) next.priceTotal = String(round2(h * r))
    }
    return next
  })
  const text = (k: keyof typeof f, label: string, ph?: string, type = 'text') => (
    <Field label={label}><TextField type={type} value={f[k]} onChange={(e) => set({ [k]: e.target.value } as Partial<typeof f>)} placeholder={ph} /></Field>
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!provider) { setError('Please select the provider you work for.'); return }
    setSaving(true)
    try {
      const res = await fetch(m ? `/api/admin/missions/${m.id}` : '/api/admin/missions', {
        method: m ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, providerId: provider.id }),
      })
      if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to save'); return }
      onSaved()
    } catch { setError('An error occurred. Please try again.') } finally { setSaving(false) }
  }

  return (
    <Card style={{ maxWidth: 860, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>{m ? 'Edit Mission' : 'New Mission'}</h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>A training session to deliver. It appears in the calendar and can be selected when you create an invoice.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={submit}>
        <Section title="Who you work for"><div style={full}><Field label="Provider *"><ProviderPicker value={provider} onChange={setProvider} /></Field></div></Section>
        <Section title="Training">
          <div style={full}><Field label="Title *"><TextField value={f.title} onChange={(e) => set({ title: e.target.value })} required maxLength={200} placeholder="e.g. Python for data analysis" /></Field></div>
          <div style={full}><Field label="Description (optional)"><TextArea value={f.description} onChange={(e) => set({ description: e.target.value })} /></Field></div>
          {text('clientName', 'Client name', 'Company / school I go to')}
          {text('location', 'Address or Online', 'Address, or "Online"')}
          <div style={full}>{text('missionUrl', 'Mission link', 'e.g. Zoom / Teams URL', 'url')}</div>
          {text('participants', 'Participants', 'if known', 'number')}
        </Section>
        <Section title="Schedule">
          {text('startDate', 'Start date *', undefined, 'date')}{text('endDate', 'End date', undefined, 'date')}
          {text('startTime', 'Start time', undefined, 'time')}{text('endTime', 'End time', undefined, 'time')}
        </Section>
        <Section title="Pricing">
          {text('hours', 'Number of hours', undefined, 'number')}{text('hourlyRate', 'Rate per hour', undefined, 'number')}
          <Field label="Total (excl. VAT)" hint="Auto = hours × rate. Type a value for a fixed price.">
            <TextField type="number" step="0.01" min={0} value={f.priceTotal} onChange={(e) => { setTouched(true); set({ priceTotal: e.target.value }) }} />
          </Field>
          <Field label="Currency"><SelectField value={f.currency} onChange={(v) => set({ currency: v })}><option>AED</option><option>EUR</option><option>USD</option></SelectField></Field>
          <Field label="Status"><SelectField value={f.status} onChange={(v) => set({ status: v })}><option value="planned">Planned</option><option value="done">Done</option><option value="tbc">To be confirmed</option><option value="cancelled">Cancelled</option></SelectField></Field>
        </Section>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save Mission'}</Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

export default function MissionsManager() {
  const [rows, setRows] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [form, setForm] = useState<{ mission: Mission | null; date: string } | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/missions?page=${p}&limit=20`)
      if (res.ok) { const d = await res.json(); setRows(d.missions); setTotalPages(d.totalPages); setPage(p) }
    } finally { setLoading(false) }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
  useEffect(() => { load(1) }, [load])
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const edit = q.get('edit')
    if (edit) {
      fetch(`/api/admin/missions/${edit}`).then((r) => (r.ok ? r.json() : null)).then(async (mi) => {
        if (!mi) return
        const names = await fetch(`/api/admin/missions?providerId=${mi.providerId}&limit=1`).then((r) => r.json()).catch(() => null)
        setForm({ mission: { ...mi, providerName: names?.missions?.[0]?.providerName ?? null }, date: '' })
      })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open the form from the URL on mount
    } else if (q.get('new') === '1') setForm({ mission: null, date: q.get('date') || '' })
  }, [])

  const remove = async (m: Mission) => {
    if (!confirm(`Delete mission "${m.title}"?`)) return
    setError('')
    const res = await fetch(`/api/admin/missions/${m.id}`, { method: 'DELETE' })
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to delete'); return }
    load(page)
  }

  if (form) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setForm(null)} style={{ marginBottom: 24 }}><ArrowLeft size={14} /> Back to missions</Button>
        <MissionForm mission={form.mission} presetDate={form.date} onCancel={() => setForm(null)} onSaved={() => { setForm(null); load(1) }} />
      </div>
    )
  }

  const text: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  const d = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null)

  return (
    <div>
      <PageHeader
        title="Missions"
        description="Training sessions you deliver. They fill your calendar and can be billed from the invoice form."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Missions' }]}
        action={<div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/dashboard/calendar" style={{ textDecoration: 'none' }}><Button variant="secondary">Calendar</Button></Link>
          <Button variant="primary" onClick={() => setForm({ mission: null, date: '' })}><Plus size={14} strokeWidth={2.5} /> New mission</Button>
        </div>}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading…</Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No missions yet" description="Create your first training mission with the button above." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)', fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>
            <div>Date</div><div>Training</div><div>Provider</div><div>Amount</div><div>Status</div><div />
          </div>
          {rows.map((m) => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
              <div style={text}>{d(m.startDate)}{m.endDate && d(m.endDate) !== d(m.startDate) ? ` → ${d(m.endDate)}` : ''}<div style={{ fontSize: 11.5, color: '#6b6b60' }}>{[m.startTime, m.endTime].filter(Boolean).join(' – ')}</div></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...text, color: '#f5eedd' }}>{m.title}</div>
                <div style={{ ...text, fontSize: 11.5, color: '#8f8f7f', display: 'flex', gap: 10, alignItems: 'center' }}>
                  {[m.clientName, m.location].filter(Boolean).join(' · ') || '—'}
                  {m.participants ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Users size={11} />{m.participants}</span> : null}
                  {m.missionUrl && <a href={m.missionUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#d4b472', display: 'inline-flex' }} title="Open mission link"><ExternalLink size={12} /></a>}
                </div>
              </div>
              <div style={text}>{m.providerName || '—'}</div>
              <div style={text}>{m.priceTotal != null ? `${m.priceTotal.toLocaleString('en-US')} ${m.currency}` : '—'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                <Badge tone={tone(m.status)} dot>{label(m.status)}</Badge>
                {m.invoiceId && <Badge tone="blue">invoiced</Badge>}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {!m.invoiceId && <Button size="sm" variant="ghost" onClick={() => setForm({ mission: m, date: '' })} title="Edit"><Pencil size={13} /></Button>}
                {!m.invoiceId && <Button size="sm" variant="danger" onClick={() => remove(m)} title="Delete"><Trash2 size={13} /></Button>}
              </div>
            </div>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(p)} />
        </Card>
      )}
    </div>
  )
}
