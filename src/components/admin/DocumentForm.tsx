'use client'

import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { Button, Card, Field, Notice, SelectField, TextArea, TextField } from './ui'
import { Briefcase } from 'lucide-react'
import ProviderPicker, { type ProviderLite } from './ProviderPicker'

export type DocKind = 'quote' | 'invoice'

// Shape returned by the API for both tables (only what the form needs).
export interface DocRow {
  id: number
  providerId: number | null
  title: string
  description: string | null
  topic: string | null
  clientName: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  startTime: string | null
  endTime: string | null
  hours: number | null
  hourlyRate: number | null
  priceTotal: number | null
  currency: string
  applyVat: boolean
  vatRate: number
  status: string
  notes: string | null
  validUntil?: string | null
  dueDate?: string | null
}

const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const round2 = (n: number) => Math.round(n * 100) / 100

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(184,151,74,0.1)' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>{children}</div>
    </div>
  )
}
const full: React.CSSProperties = { gridColumn: '1 / -1' }

interface AvailableMission { id: number; title: string; clientName: string | null; startDate: string; endDate: string | null; priceTotal: number | null; currency: string; invoiceId: number | null }

interface Props {
  kind: DocKind
  doc: DocRow | null
  initialProvider: ProviderLite | null
  onSaved: (saved: { id: number; number: string }) => void
  onCancel: () => void
}

export default function DocumentForm({ kind, doc, initialProvider, onSaved, onCancel }: Props) {
  const isQuote = kind === 'quote'
  const [provider, setProvider] = useState<ProviderLite | null>(initialProvider)
  const [f, setF] = useState({
    title: doc?.title ?? '',
    description: doc?.description ?? '',
    topic: doc?.topic ?? '',
    clientName: doc?.clientName ?? '',
    location: doc?.location ?? '',
    startDate: day(doc?.startDate),
    endDate: day(doc?.endDate),
    startTime: doc?.startTime ?? '',
    endTime: doc?.endTime ?? '',
    hours: doc?.hours != null ? String(doc.hours) : '',
    hourlyRate: doc?.hourlyRate != null ? String(doc.hourlyRate) : '',
    priceTotal: doc?.priceTotal != null ? String(doc.priceTotal) : '',
    currency: doc?.currency ?? 'AED',
    applyVat: doc?.applyVat ?? false,
    vatRate: String(doc?.vatRate || 5),
    status: doc?.status ?? 'draft',
    notes: doc?.notes ?? '',
    extraDate: day(isQuote ? doc?.validUntil : doc?.dueDate),
  })
  // Once the user types a total by hand, stop auto-filling it from hours × rate.
  const [totalTouched, setTotalTouched] = useState(doc?.priceTotal != null && !(doc.hours != null && doc.hourlyRate != null && round2(doc.hours * doc.hourlyRate) === doc.priceTotal))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // Invoices can be built from the provider's missions instead of typed by hand.
  const [missions, setMissions] = useState<AvailableMission[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [selectionInit, setSelectionInit] = useState(false)
  const providerId = provider?.id
  useEffect(() => {
    if (isQuote || !providerId) return
    const ctrl = new AbortController()
    fetch(`/api/admin/missions?available=1&providerId=${providerId}&forInvoice=${doc?.id ?? ''}&limit=100`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { missions: [] }))
      .then((d) => {
        setMissions(d.missions)
        if (!selectionInit) { setSelected(d.missions.filter((m: AvailableMission) => doc && m.invoiceId === doc.id).map((m: AvailableMission) => m.id)); setSelectionInit(true) }
      })
      .catch(() => {})
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, isQuote])
  const picked = missions.filter((m) => selected.includes(m.id))
  const fromMissions = picked.length > 0

  const set = (patch: Partial<typeof f>) => setF((prev) => {
    const next = { ...prev, ...patch }
    if (!totalTouched && ('hours' in patch || 'hourlyRate' in patch)) {
      const h = parseFloat(next.hours)
      const r = parseFloat(next.hourlyRate)
      next.priceTotal = Number.isFinite(h) && Number.isFinite(r) ? String(round2(h * r)) : prev.priceTotal
    }
    return next
  })

  const currency = fromMissions ? picked[0].currency : f.currency
  const totals = useMemo(() => {
    const base = fromMissions ? picked.reduce((a, m) => a + (m.priceTotal ?? 0), 0) : parseFloat(f.priceTotal)
    if (!Number.isFinite(base)) return null
    const rate = f.applyVat ? parseFloat(f.vatRate) || 0 : 0
    const vat = base * (rate / 100)
    return { base, vat, total: base + vat, rate }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.priceTotal, f.applyVat, f.vatRate, selected, missions])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!provider) { setError('Please select the provider to bill.'); return }
    setSaving(true)
    try {
      const base = isQuote ? '/api/admin/quotes' : '/api/admin/invoices'
      const res = await fetch(doc ? `${base}/${doc.id}` : base, {
        method: doc ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          title: f.title, description: f.description, topic: f.topic, clientName: f.clientName, location: f.location,
          startDate: f.startDate, endDate: f.endDate, startTime: f.startTime, endTime: f.endTime,
          hours: f.hours, hourlyRate: f.hourlyRate, priceTotal: f.priceTotal, currency: f.currency, missionIds: selected,
          applyVat: f.applyVat, vatRate: f.vatRate, status: f.status, notes: f.notes,
          ...(isQuote ? { validUntil: f.extraDate } : { dueDate: f.extraDate }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Failed to save'); return }
      onSaved({ id: data.id, number: isQuote ? data.quoteNumber : data.invoiceNumber })
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const noun = isQuote ? 'Quote' : 'Invoice'
  const statuses = isQuote ? ['draft', 'sent', 'accepted', 'declined'] : ['draft', 'sent', 'paid']

  return (
    <Card style={{ maxWidth: 860, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>{doc ? `Edit ${noun}` : `New ${noun}`}</h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
        {isQuote ? 'Prepare a training proposal — you can convert it into an invoice once accepted.' : 'Bill a provider for a training session you delivered.'}
      </p>

      {error && <Notice tone="error">{error}</Notice>}

      <form onSubmit={submit}>
        <Section title="Billed to">
          <div style={full}>
            <Field label="Provider *">
              <ProviderPicker value={provider} onChange={setProvider} />
            </Field>
          </div>
        </Section>

        {!isQuote && provider && (
          <Section title="Missions to bill">
            <div style={full}>
              {missions.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f' }}>No billable mission for this provider. Missions already on an invoice, cancelled, or marked “To be confirmed” are hidden — fill the invoice by hand below, or create a mission first.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {missions.map((m) => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, background: selected.includes(m.id) ? 'rgba(184,151,74,0.1)' : 'rgba(184,151,74,0.03)', border: '1px solid rgba(184,151,74,0.15)' }}>
                      <input type="checkbox" checked={selected.includes(m.id)} onChange={(e) => setSelected((prev) => (e.target.checked ? [...prev, m.id] : prev.filter((x) => x !== m.id)))} style={{ accentColor: '#b8974a' }} />
                      <Briefcase size={14} color="#d4b472" />
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd', flex: 1 }}>{m.title}{m.clientName ? <span style={{ color: '#8f8f7f' }}> · {m.clientName}</span> : null}</span>
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f' }}>{new Date(m.startDate).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</span>
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>{m.priceTotal != null ? `${fmt(m.priceTotal)} ${m.currency}` : 'no price'}</span>
                    </label>
                  ))}
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60' }}>Select one or more: amounts and dates are filled in automatically. Leave all unticked to type the invoice by hand.</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {!fromMissions && (<>
        <Section title="Training">
          <div style={full}>
            <Field label={fromMissions ? 'Invoice title (optional)' : 'Title *'}><TextField value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder={fromMissions ? 'Defaults to the mission title' : 'e.g. Microsoft 365 Copilot for managers'} required={!fromMissions} maxLength={200} /></Field>
          </div>
          <div style={full}>
            <Field label="Description"><TextArea value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder="What the session covers, format, audience…" /></Field>
          </div>
          <Field label="Topic covered"><TextField value={f.topic} onChange={(e) => set({ topic: e.target.value })} placeholder="e.g. Generative AI, Python, SQL" /></Field>
          <Field label="Client site (where I deliver)"><TextField value={f.clientName} onChange={(e) => set({ clientName: e.target.value })} placeholder="Company / school I go to" /></Field>
          <Field label="Location"><TextField value={f.location} onChange={(e) => set({ location: e.target.value })} placeholder="City, address or Online" /></Field>
        </Section>

        <Section title="Schedule">
          <Field label="Start date"><TextField type="date" value={f.startDate} onChange={(e) => set({ startDate: e.target.value })} /></Field>
          <Field label="End date"><TextField type="date" value={f.endDate} min={f.startDate || undefined} onChange={(e) => set({ endDate: e.target.value })} /></Field>
          <Field label="Start time"><TextField type="time" value={f.startTime} onChange={(e) => set({ startTime: e.target.value })} /></Field>
          <Field label="End time"><TextField type="time" value={f.endTime} onChange={(e) => set({ endTime: e.target.value })} /></Field>
        </Section>
        </>)}

        <Section title="Pricing">
          {!fromMissions && (<>
          <Field label="Number of hours"><TextField type="number" step="0.25" min={0} value={f.hours} onChange={(e) => set({ hours: e.target.value })} /></Field>
          <Field label="Rate per hour"><TextField type="number" step="0.01" min={0} value={f.hourlyRate} onChange={(e) => set({ hourlyRate: e.target.value })} /></Field>
          <Field label="Total (excl. VAT)" hint="Auto = hours × rate. Type a value to set a fixed price.">
            <TextField type="number" step="0.01" min={0} value={f.priceTotal} onChange={(e) => { setTotalTouched(true); set({ priceTotal: e.target.value }) }} />
          </Field>
          <Field label="Currency">
            <SelectField value={f.currency} onChange={(v) => set({ currency: v })}>
              <option value="AED">AED</option><option value="EUR">EUR</option><option value="USD">USD</option>
            </SelectField>
          </Field>
          </>)}

          <div style={full}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 16px', borderRadius: 8, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)' }}>
              <input type="checkbox" checked={f.applyVat} onChange={(e) => set({ applyVat: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#b8974a', cursor: 'pointer' }} />
              <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>Apply VAT (Dubai standard rate is 5%)</span>
              {f.applyVat && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TextField type="number" step="0.1" min={0} max={100} value={f.vatRate} onChange={(e) => set({ vatRate: e.target.value })} style={{ width: 90, padding: '6px 10px' }} />
                  <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>%</span>
                </span>
              )}
            </label>
          </div>

          {totals && (
            <div style={{ ...full, fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.2)', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8f8f7f' }}>Subtotal</span><span>{fmt(totals.base)} {currency}</span></div>
              {f.applyVat && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><span style={{ color: '#8f8f7f' }}>VAT ({totals.rate}%)</span><span>{fmt(totals.vat)} {currency}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(184,151,74,0.15)', fontWeight: 700, color: '#f5eedd' }}>
                <span>Total {isQuote ? '' : 'due'}</span><span>{fmt(totals.total)} {currency}</span>
              </div>
            </div>
          )}
        </Section>

        <Section title="Status & notes">
          <Field label={isQuote ? 'Valid until' : 'Due date'}><TextField type="date" value={f.extraDate} onChange={(e) => set({ extraDate: e.target.value })} /></Field>
          <Field label="Status">
            <SelectField value={f.status} onChange={(v) => set({ status: v })}>
              {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </SelectField>
          </Field>
          <div style={full}>
            <Field label="Notes (printed on the document)"><TextArea value={f.notes} onChange={(e) => set({ notes: e.target.value })} style={{ minHeight: 64 }} /></Field>
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={saving}>
            <Save size={14} strokeWidth={2} /> {saving ? 'Saving…' : `Save ${noun}`}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}
