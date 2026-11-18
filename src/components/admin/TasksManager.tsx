'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft, ListChecks, Pencil, Trash2, Save, Search, Check, Briefcase } from 'lucide-react'
import ProviderPicker, { type ProviderLite } from './ProviderPicker'
import { Badge, Button, Card, EmptyState, Field, Notice, PageHeader, Pagination, SelectField, Section, TextArea, TextField } from './ui'

interface Task {
  id: number; title: string; description: string | null; providerId: number | null; providerName?: string | null
  missionId: number | null; missionTitle?: string | null; dueDate: string; done: boolean
}
interface MissionOpt { id: number; title: string; startDate: string; providerId: number; providerName?: string | null }

const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')
const full: React.CSSProperties = { gridColumn: '1 / -1' }
const GRID = '36px 150px 2.4fr 1.8fr 90px'
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const todayKey = () => new Date().toISOString().slice(0, 10)

function TaskForm({ task, presetDate, presetProvider, presetMission, onSaved, onCancel }: {
  task: Task | null; presetDate: string; presetProvider: ProviderLite | null; presetMission: number | null; onSaved: () => void; onCancel: () => void
}) {
  const t = task
  // Both links are optional: a task can be linked to a client, to a mission, to both, or to nothing.
  const [provider, setProvider] = useState<ProviderLite | null>(t?.providerId ? { id: t.providerId, name: null, firstName: null, company: t.providerName ?? null, city: null, country: null, type: null } : presetProvider)
  const [missionId, setMissionId] = useState<string>(t?.missionId ? String(t.missionId) : presetMission ? String(presetMission) : '')
  const [missions, setMissions] = useState<MissionOpt[]>([])
  const [f, setF] = useState({ title: t?.title ?? '', description: t?.description ?? '', dueDate: day(t?.dueDate) || presetDate || todayKey(), done: t?.done ?? false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }))

  // Missions to pick from: this client's when one is chosen, otherwise the latest ones
  useEffect(() => {
    const qs = new URLSearchParams({ limit: '100' })
    if (provider) qs.set('providerId', String(provider.id))
    fetch(`/api/admin/missions?${qs}`).then((r) => (r.ok ? r.json() : null)).then((d) => setMissions(d?.missions ?? [])).catch(() => setMissions([]))
  }, [provider])

  const pickMission = (id: string) => {
    setMissionId(id)
    const m = missions.find((x) => String(x.id) === id)
    // choosing a mission fills the client in when none is set yet
    if (m && !provider) setProvider({ id: m.providerId, name: null, firstName: null, company: m.providerName ?? null, city: null, country: null, type: null })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(t ? `/api/admin/tasks/${t.id}` : '/api/admin/tasks', {
        method: t ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, providerId: provider?.id ?? null, missionId: missionId ? Number(missionId) : null }),
      })
      if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to save'); return }
      onSaved()
    } catch { setError('An error occurred. Please try again.') } finally { setSaving(false) }
  }

  const known = missions.some((m) => String(m.id) === missionId)
  return (
    <Card style={{ maxWidth: 760, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>{t ? 'Edit Task' : 'New Task'}</h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>Something to prepare or do for a client. It shows on its day in your calendar.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={submit}>
        <Section title="Task">
          <div style={full}><Field label="Title *"><TextField value={f.title} onChange={(e) => set({ title: e.target.value })} required maxLength={200} placeholder="e.g. Send the course outline to Edoxi" /></Field></div>
          <Field label="Due date *"><TextField type="date" value={f.dueDate} onChange={(e) => set({ dueDate: e.target.value })} required /></Field>
          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42, fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc', cursor: 'pointer' }}>
              <input type="checkbox" checked={f.done} onChange={(e) => set({ done: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#2dd4bf' }} /> Done
            </label>
          </Field>
          <div style={full}><Field label="Description"><TextArea value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder="What exactly was asked, links, details…" /></Field></div>
        </Section>
        <Section title="Linked to (optional)">
          <div style={full}><Field label="Client" hint="Leave empty if the task isn't related to a client."><ProviderPicker value={provider} onChange={(p) => { setProvider(p); if (p && missionId && !missions.some((m) => String(m.id) === missionId && m.providerId === p.id)) setMissionId('') }} /></Field></div>
          <div style={full}>
            <Field label="Mission" hint={provider ? `Showing ${provider.company || 'this client'}'s missions.` : 'Pick a mission, or choose a client first to narrow the list.'}>
              <SelectField value={missionId} onChange={pickMission}>
                <option value="">— No mission —</option>
                {!known && missionId && <option value={missionId}>{t?.missionTitle ?? `Mission #${missionId}`}</option>}
                {missions.map((m) => <option key={m.id} value={m.id}>{`${fmt(m.startDate)} · ${m.title}${m.providerName ? ` · ${m.providerName}` : ''}`}</option>)}
              </SelectField>
            </Field>
          </div>
        </Section>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save Task'}</Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

export default function TasksManager() {
  const [rows, setRows] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [form, setForm] = useState<{ task: Task | null; date: string; provider: ProviderLite | null; mission: number | null } | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('open')
  const filtered = Boolean(debounced) || status !== 'open'

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(p) })
      if (debounced) qs.set('q', debounced)
      if (status) qs.set('status', status)
      const res = await fetch(`/api/admin/tasks?${qs}`)
      if (res.ok) { const d = await res.json(); setRows(d.tasks); setTotalPages(d.totalPages); setPage(p) }
    } finally { setLoading(false) }
  }, [debounced, status])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and whenever the filters change
  useEffect(() => { load(1) }, [load])
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const edit = q.get('edit')
    if (edit) {
      fetch(`/api/admin/tasks/${edit}`).then((r) => (r.ok ? r.json() : null)).then((tk) => { if (tk) setForm({ task: tk, date: '', provider: null, mission: null }) })
    } else if (q.get('new') === '1') {
      const pid = parseInt(q.get('providerId') || '')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open the form from the URL on mount
      setForm({
        task: null, date: q.get('date') || '', mission: parseInt(q.get('missionId') || '') || null,
        provider: pid ? { id: pid, name: null, firstName: null, company: q.get('providerName'), city: null, country: null, type: null } : null,
      })
    }
  }, [])

  const toggle = async (tk: Task) => {
    setError('')
    // optimistic: flip locally, roll back if the server refuses
    setRows((rs) => rs.map((r) => (r.id === tk.id ? { ...r, done: !tk.done } : r)))
    const res = await fetch(`/api/admin/tasks/${tk.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: !tk.done }) })
    if (!res.ok) { setError('Failed to update the task'); setRows((rs) => rs.map((r) => (r.id === tk.id ? { ...r, done: tk.done } : r))); return }
    // the task no longer belongs to the filtered list once its status flips
    if (status) setTimeout(() => load(page), 350)
  }

  const remove = async (tk: Task) => {
    if (!confirm(`Delete task "${tk.title}"?`)) return
    setError('')
    const res = await fetch(`/api/admin/tasks/${tk.id}`, { method: 'DELETE' })
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to delete'); return }
    load(page)
  }

  if (form) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setForm(null)} style={{ marginBottom: 24 }}><ArrowLeft size={14} /> Back to tasks</Button>
        <TaskForm task={form.task} presetDate={form.date} presetProvider={form.provider} presetMission={form.mission} onCancel={() => setForm(null)} onSaved={() => { setForm(null); load(1) }} />
      </div>
    )
  }

  const text: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  const today = todayKey()

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Things to prepare or do for your clients. They appear in your calendar (in teal) on their due date."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Tasks' }]}
        action={<div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/dashboard/calendar" style={{ textDecoration: 'none' }}><Button variant="secondary">Calendar</Button></Link>
          <Button variant="primary" onClick={() => setForm({ task: null, date: '', provider: null, mission: null })}><Plus size={14} strokeWidth={2.5} /> New task</Button>
        </div>}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8f8f7f', pointerEvents: 'none' }} />
          <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a task or client…" style={{ paddingLeft: 34 }} />
        </div>
        <div style={{ width: 170 }}>
          <SelectField value={status} onChange={setStatus}><option value="open">To do</option><option value="done">Done</option><option value="">All</option></SelectField>
        </div>
        {filtered && <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('open') }}>Reset</Button>}
      </div>
      {loading && rows.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading…</Card>
      ) : rows.length === 0 ? (
        <Card>{filtered
          ? <EmptyState icon={Search} title="No matching task" description="Try another keyword or status." />
          : <EmptyState icon={ListChecks} title="Nothing to do" description="Add a task with the button above — e.g. “Prepare the slides for Morgan”." />}</Card>
      ) : (
        <Card style={{ overflow: 'hidden', opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)', fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>
            <div /><div>Due</div><div>Task</div><div>Linked to</div><div />
          </div>
          {rows.map((tk) => {
            const overdue = !tk.done && day(tk.dueDate) < today
            return (
              <div key={tk.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
                <button onClick={() => toggle(tk)} title={tk.done ? 'Mark as to do' : 'Mark as done'} aria-label={tk.done ? 'Mark as to do' : 'Mark as done'}
                  style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${tk.done ? '#2dd4bf' : 'rgba(184,151,74,0.4)'}`, background: tk.done ? 'rgba(45,212,191,0.2)' : 'transparent', color: '#2dd4bf', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {tk.done && <Check size={14} strokeWidth={3} />}
                </button>
                <div style={text}>{fmt(tk.dueDate)}{overdue && <div style={{ marginTop: 3 }}><Badge tone="red">overdue</Badge></div>}{day(tk.dueDate) === today && !tk.done && <div style={{ marginTop: 3 }}><Badge tone="gold">today</Badge></div>}</div>
                <div style={{ minWidth: 0, opacity: tk.done ? 0.55 : 1 }}>
                  <div style={{ ...text, color: '#f5eedd', textDecoration: tk.done ? 'line-through' : 'none' }}>{tk.title}</div>
                  {tk.description && <div style={{ ...text, fontSize: 11.5, color: '#8f8f7f' }}>{tk.description}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', minWidth: 0 }}>
                  {tk.providerName && <Badge tone="blue">{tk.providerName}</Badge>}
                  {tk.missionId && <Link href={`/admin/dashboard/missions?edit=${tk.missionId}`} style={{ ...text, fontSize: 11.5, color: '#d4b472', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%' }}><Briefcase size={11} style={{ flexShrink: 0 }} />{tk.missionTitle ?? `Mission #${tk.missionId}`}</Link>}
                  {!tk.providerName && !tk.missionId && <span style={{ color: '#5a5a52', fontSize: 12 }}>—</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Button size="sm" variant="ghost" onClick={() => setForm({ task: tk, date: '', provider: null, mission: null })} title="Edit"><Pencil size={13} /></Button>
                  <Button size="sm" variant="danger" onClick={() => remove(tk)} title="Delete"><Trash2 size={13} /></Button>
                </div>
              </div>
            )
          })}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(p)} />
        </Card>
      )}
    </div>
  )
}
