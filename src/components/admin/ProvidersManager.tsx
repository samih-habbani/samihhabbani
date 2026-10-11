'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, ArrowLeft, Building2, UserCheck, UserX, Mail, Phone, Globe, Pencil, Trash2, Save, X, Search } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Field, Notice, PageHeader, Pagination, SelectField, StatCard, TextArea, TextField, fieldStyle } from './ui'

interface Provider {
  id: number
  name: string | null; firstName: string | null; company: string | null; position: string | null; manager: string | null
  email: string | null; phone: string | null; website: string | null; instagram: string | null; catalogUrl: string | null
  city: string | null; region: string | null; country: string | null; address: string | null; postalCode: string | null
  type: string | null; services: string[]; description: string | null; firstContact: string | null; notes: string | null
  isActive: boolean | null
}

const isPlaceholder = (v?: string | null) => !v || /^-+$/.test(v.trim())
const real = (v?: string | null) => (isPlaceholder(v) ? null : v!.trim())
const GRID = '1.8fr 1fr 1fr 1.5fr 1.2fr 0.8fr 90px'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(184,151,74,0.1)' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>{children}</div>
    </div>
  )
}
const full: React.CSSProperties = { gridColumn: '1 / -1' }

function ProviderForm({ provider, onSaved, onCancel }: { provider: Provider | null; onSaved: () => void; onCancel: () => void }) {
  const p = provider
  const [f, setF] = useState({
    name: p?.name ?? '', firstName: p?.firstName ?? '', company: p?.company ?? '', position: p?.position ?? '', manager: p?.manager ?? '',
    email: p?.email ?? '', phone: p?.phone ?? '', website: p?.website ?? '', instagram: p?.instagram ?? '', catalogUrl: p?.catalogUrl ?? '',
    city: p?.city ?? '', region: p?.region ?? '', country: p?.country ?? '', address: p?.address ?? '', postalCode: p?.postalCode ?? '',
    type: p?.type ?? 'Training', services: p?.services ?? [], description: p?.description ?? '', firstContact: p?.firstContact ?? '', notes: p?.notes ?? '',
    isActive: p?.isActive !== false,
  })
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (patch: Partial<typeof f>) => setF((prev) => ({ ...prev, ...patch }))
  const text = (k: keyof typeof f, label: string, placeholder?: string) => (
    <Field label={label}><TextField value={f[k] as string} onChange={(e) => set({ [k]: e.target.value } as Partial<typeof f>)} placeholder={placeholder} /></Field>
  )

  const addService = () => {
    const v = draft.trim()
    if (v && !f.services.includes(v)) set({ services: [...f.services, v] })
    setDraft('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/providers', {
        method: p ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, ...(p && { id: p.id }) }),
      })
      if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to save provider'); return }
      onSaved()
    } catch { setError('An error occurred. Please try again.') } finally { setSaving(false) }
  }

  return (
    <Card style={{ maxWidth: 820, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>{p ? 'Edit Provider' : 'Add New Provider'}</h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
        Nothing is required — fill in what you have. Providers are shared with syrama-yachting: edits apply to both.
      </p>
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={submit}>
        <Section title="Contact">
          {text('name', 'Last name')}{text('firstName', 'First name')}{text('company', 'Company')}{text('position', 'Position')}{text('manager', 'Manager')}
          {text('email', 'Email')}{text('phone', 'Phone')}{text('website', 'Website')}{text('instagram', 'Instagram')}{text('catalogUrl', 'Catalog URL', 'e.g. Google Drive link')}
        </Section>
        <Section title="Location">
          {text('city', 'City')}{text('region', 'Region')}{text('country', 'Country')}{text('address', 'Address')}{text('postalCode', 'Postal code')}
        </Section>
        <Section title="Classification">
          {text('type', 'Type', 'Keep "Training" — only training providers are shown here')}
          <div style={full}>
            <Field label="Services">
              <div style={{ display: 'flex', gap: 8, marginBottom: f.services.length ? 12 : 0 }}>
                <TextField value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService() } }} placeholder="Type a service and press Enter" />
                <Button type="button" variant="secondary" onClick={addService}><Plus size={14} /> Add</Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {f.services.map((s) => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 600, color: '#d4b472', background: 'rgba(184,151,74,0.12)', border: '1px solid rgba(184,151,74,0.3)', borderRadius: 999, padding: '5px 8px 5px 13px' }}>
                    {s}
                    <button type="button" onClick={() => set({ services: f.services.filter((x) => x !== s) })} aria-label={`Remove ${s}`} style={{ display: 'flex', background: 'transparent', border: 'none', color: '#d4b472', cursor: 'pointer', padding: 2 }}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </Field>
          </div>
        </Section>
        <Section title="Notes">
          <div style={full}><Field label="Description"><TextArea value={f.description} onChange={(e) => set({ description: e.target.value })} /></Field></div>
          {text('firstContact', 'First contact', 'How / who introduced you')}
          <div style={full}><Field label="Internal notes"><TextArea value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></Field></div>
        </Section>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, cursor: 'pointer', padding: '14px 18px', borderRadius: 8, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)' }}>
          <input type="checkbox" checked={f.isActive} onChange={(e) => set({ isActive: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#b8974a' }} />
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>Active contact</span>
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save Provider'}</Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

export default function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [active, setActive] = useState('')
  const [meta, setMeta] = useState<{ countries: string[]; stats: { total: number; active: number; inactive: number } } | null>(null)
  const [form, setForm] = useState<{ provider: Provider | null } | null>(null)
  const [error, setError] = useState('')

  const loadMeta = useCallback(async () => {
    const res = await fetch('/api/admin/providers/meta')
    if (res.ok) setMeta(await res.json())
  }, [])

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (query) params.set('search', query)
      if (country) params.set('country', country)
      if (active) params.set('active', active)
      const res = await fetch(`/api/admin/providers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProviders(data.providers); setTotalPages(data.totalPages); setTotal(data.total); setPage(p)
      }
    } finally { setLoading(false) }
  }, [query, country, active])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount / filter change
  useEffect(() => { load(1) }, [load])
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount / filter change
  useEffect(() => { loadMeta() }, [loadMeta])
  useEffect(() => { const t = setTimeout(() => setQuery(search.trim()), 300); return () => clearTimeout(t) }, [search])

  const remove = async (p: Provider) => {
    const label = real(p.company) || [real(p.firstName), real(p.name)].filter(Boolean).join(' ') || `#${p.id}`
    if (!confirm(`Delete provider "${label}"?\n\nThis table is shared with syrama-yachting — the provider disappears there too.`)) return
    setError('')
    const res = await fetch(`/api/admin/providers?id=${p.id}`, { method: 'DELETE' })
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Failed to delete provider'); return }
    load(page); loadMeta()
  }

  if (form) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setForm(null)} style={{ marginBottom: 24 }}><ArrowLeft size={14} /> Back to providers</Button>
        <ProviderForm provider={form.provider} onCancel={() => setForm(null)} onSaved={() => { setForm(null); load(page); loadMeta() }} />
      </div>
    )
  }

  const text: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

  return (
    <div>
      <PageHeader
        title="Providers"
        description="Your training partners (type “Training”) — stored in the same table as syrama-yachting, but only these are shown here."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Providers' }]}
        action={<Button variant="primary" onClick={() => setForm({ provider: null })}><Plus size={14} strokeWidth={2.5} /> Add Provider</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label="Total Providers" value={meta?.stats.total ?? '—'} icon={Building2} tone="gold" />
        <StatCard label="Active" value={meta?.stats.active ?? '—'} icon={UserCheck} tone="green" />
        <StatCard label="Inactive" value={meta?.stats.inactive ?? '—'} icon={UserX} tone="red" />
      </div>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, alignItems: 'end' }}>
          <Field label="Search">
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#6b6b60" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, company, email, service…" style={{ ...fieldStyle, paddingLeft: 38 }} />
            </div>
          </Field>
          <Field label="Country">
            <SelectField value={country} onChange={setCountry}><option value="">All countries</option>{meta?.countries.map((c) => <option key={c} value={c}>{c}</option>)}</SelectField>
          </Field>
          <Field label="Status">
            <SelectField value={active} onChange={setActive}><option value="">All</option><option value="true">Active</option><option value="false">Inactive</option></SelectField>
          </Field>
        </div>
      </Card>

      {error && <Notice tone="error">{error}</Notice>}

      {loading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading providers…</Card>
      ) : providers.length === 0 ? (
        <Card><EmptyState icon={Building2} title="No providers found" description="Try adjusting your filters or add a new provider." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)', fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>
            <div>Provider ({total})</div><div>Type</div><div>Location</div><div>Contact</div><div>Services</div><div>Status</div><div />
          </div>
          {providers.map((p) => {
            const person = Array.from(new Set([p.firstName, p.name].map(real).filter((v): v is string => !!v))).join(' ')
            const display = person || real(p.company) || 'Unnamed'
            const location = [real(p.city), real(p.country)].filter(Boolean).join(', ')
            const services = (p.services || []).map(real).filter((v): v is string => !!v)
            const contact = (Icon: typeof Mail, v: string | null) => v && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Icon size={11} style={{ flexShrink: 0 }} />{v}
              </span>
            )
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, rgba(184,151,74,0.18), rgba(184,151,74,0.06))', border: '1px solid rgba(184,151,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 700, color: '#d4b472' }}>
                    {display.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...text, fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>{display}</div>
                    <div style={{ ...text, fontSize: 11.5, color: '#8f8f7f' }}>{real(p.company) && person ? real(p.company) : '—'}</div>
                  </div>
                </div>
                <div style={text}>{real(p.type) || '—'}</div>
                <div style={text}>{location || '—'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  {contact(Mail, real(p.email))}{contact(Phone, real(p.phone))}{contact(Globe, real(p.website))}
                  {!real(p.email) && !real(p.phone) && !real(p.website) && <span style={{ color: '#5a5a52', fontSize: 12 }}>—</span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {services.slice(0, 2).map((s) => <Badge key={s}>{s}</Badge>)}
                  {services.length > 2 && <Badge>+{services.length - 2}</Badge>}
                </div>
                <div><Badge tone={p.isActive === false ? 'red' : 'green'} dot>{p.isActive === false ? 'Inactive' : 'Active'}</Badge></div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Button size="sm" variant="ghost" onClick={() => setForm({ provider: p })} title="Edit"><Pencil size={13} /></Button>
                  <Button size="sm" variant="danger" onClick={() => remove(p)} title="Delete"><Trash2 size={13} /></Button>
                </div>
              </div>
            )
          })}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(n) => load(n)} />
        </Card>
      )}
    </div>
  )
}
