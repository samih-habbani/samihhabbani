'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, FileText, Receipt, FileDown, Pencil, Trash2, ArrowRightLeft, ArrowLeft, Wallet, CircleCheck } from 'lucide-react'
import DocumentForm, { type DocKind, type DocRow } from './DocumentForm'
import type { ProviderLite } from './ProviderPicker'
import { Badge, Button, ButtonLink, Card, EmptyState, Notice, PageHeader, Pagination, SelectField, StatCard, type Tone } from './ui'

type Row = DocRow & {
  quoteNumber?: string
  invoiceNumber?: string
  billToName: string | null
  quoteId?: number | null
  invoiceId?: number | null
  createdAt: string
}

interface InvoiceStats { year: number; count: number; byCurrency: Record<string, { invoiced: number; paid: number; outstanding: number }> }
interface QuoteStats { year: number; count: number; accepted: number; pending: Record<string, number> }

const statusTone = (s: string): Tone => (s === 'paid' || s === 'accepted' ? 'green' : s === 'sent' ? 'blue' : s === 'declined' ? 'red' : s === 'invoiced' ? 'gold' : 'neutral')
const gross = (r: Row) => (r.priceTotal == null ? null : r.applyVat ? r.priceTotal * (1 + r.vatRate / 100) : r.priceTotal)
const money = (n: number, c: string) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${c}`
const dateLabel = (r: Row) => {
  const f = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null)
  const a = f(r.startDate), b = f(r.endDate)
  return a && b && a !== b ? `${a} → ${b}` : a || '—'
}
const GRID = '1.1fr 1.5fr 1.4fr 1fr 0.8fr 1.5fr'

export default function DocumentsManager({ kind }: { kind: DocKind }) {
  const isQuote = kind === 'quote'
  const base = isQuote ? '/api/admin/quotes' : '/api/admin/invoices'
  const noun = isQuote ? 'Quote' : 'Invoice'

  const [rows, setRows] = useState<Row[]>([])
  const [stats, setStats] = useState<InvoiceStats | QuoteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState<{ doc: Row | null } | null>(null)
  const [notice, setNotice] = useState<{ tone: 'error' | 'success'; text: string; pdf?: string } | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (status) params.set('status', status)
      const res = await fetch(`${base}?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRows(isQuote ? data.quotes : data.invoices)
        setStats(data.stats)
        setTotalPages(data.totalPages)
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }, [base, isQuote, status])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount / filter change
  useEffect(() => { load(1) }, [load])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount / filter change
    if (new URLSearchParams(window.location.search).get('new') === '1') setForm({ doc: null })
  }, [])

  const call = async (url: string, init: RequestInit, successText?: string) => {
    const res = await fetch(url, init)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setNotice({ tone: 'error', text: data.error || 'Something went wrong' }); return null }
    if (successText) setNotice({ tone: 'success', text: successText })
    return data
  }

  const setRowStatus = async (r: Row, s: string) => {
    if (await call(`${base}/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) })) load(page)
  }
  const remove = async (r: Row) => {
    if (!confirm(`Delete ${r.quoteNumber ?? r.invoiceNumber}?`)) return
    if (await call(`${base}/${r.id}`, { method: 'DELETE' }, `${noun} deleted.`)) load(page)
  }
  const convert = async (r: Row) => {
    if (!confirm(`Convert ${r.quoteNumber} into a draft invoice?`)) return
    const inv = await call(`${base}/${r.id}/convert`, { method: 'POST' })
    if (inv) {
      setNotice({ tone: 'success', text: `Invoice ${inv.invoiceNumber} created from ${r.quoteNumber} (draft).`, pdf: `/api/admin/invoices/${inv.id}/pdf` })
      load(page)
    }
  }

  if (form) {
    const d = form.doc
    const initialProvider: ProviderLite | null = d?.providerId
      ? { id: d.providerId, name: null, firstName: null, company: d.billToName, city: null, country: null, type: null }
      : null
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setForm(null)} style={{ marginBottom: 24 }}><ArrowLeft size={14} /> Back to {isQuote ? 'quotes' : 'invoices'}</Button>
        <DocumentForm
          kind={kind}
          doc={d}
          initialProvider={initialProvider}
          onCancel={() => setForm(null)}
          onSaved={({ id, number }) => {
            setForm(null)
            setNotice({ tone: 'success', text: `${noun} ${number} ${d ? 'updated' : 'created'}.`, pdf: `${base}/${id}/pdf` })
            load(1)
          }}
        />
      </div>
    )
  }

  const qs = stats as QuoteStats | null
  const is = stats as InvoiceStats | null
  const cur = !isQuote && is?.byCurrency ? Object.entries(is.byCurrency) : []
  const pending = isQuote && qs?.pending ? Object.entries(qs.pending) : []

  return (
    <div>
      <PageHeader
        title={isQuote ? 'Quotes' : 'Invoices'}
        description={isQuote ? 'Training proposals — convert an accepted quote into an invoice in one click.' : 'Invoices issued to your providers for training delivered.'}
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: isQuote ? 'Quotes' : 'Invoices' }]}
        action={<Button variant="primary" onClick={() => { setNotice(null); setForm({ doc: null }) }}><Plus size={14} strokeWidth={2.5} /> New {noun.toLowerCase()}</Button>}
      />

      {notice && (
        <Notice tone={notice.tone}>
          {notice.text}{' '}
          {notice.pdf && <a href={notice.pdf} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 700 }}>Download PDF ↗</a>}
        </Notice>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, marginBottom: 28 }}>
        {isQuote ? (
          <>
            <StatCard label={`Quotes (${qs?.year ?? ''})`} value={qs?.count ?? '—'} icon={FileText} tone="blue" />
            <StatCard label="Accepted" value={qs?.accepted ?? '—'} icon={CircleCheck} tone="green" />
            <StatCard label="Awaiting answer" value={<span style={{ fontSize: 24 }}>{pending.map(([c, n]) => money(n, c)).join(' · ') || '—'}</span>} icon={Wallet} tone="gold" />
          </>
        ) : (
          <>
            <StatCard label={`Invoices (${is?.year ?? ''})`} value={is?.count ?? '—'} icon={Receipt} tone="gold" />
            <StatCard label="Paid" value={<span style={{ fontSize: 24 }}>{cur.map(([c, v]) => money(v.paid, c)).join(' · ') || '—'}</span>} icon={CircleCheck} tone="green" />
            <StatCard label="Awaiting payment" value={<span style={{ fontSize: 24 }}>{cur.map(([c, v]) => money(v.outstanding, c)).join(' · ') || '—'}</span>} icon={Wallet} tone="blue" />
          </>
        )}
      </div>

      <Card style={{ padding: 24, marginBottom: 24, maxWidth: 320 }}>
        <SelectField value={status} onChange={setStatus}>
          <option value="">All statuses</option>
          {(isQuote ? ['draft', 'sent', 'accepted', 'declined', 'invoiced'] : ['draft', 'sent', 'paid']).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </SelectField>
      </Card>

      {loading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading…</Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={isQuote ? FileText : Receipt} title={`No ${isQuote ? 'quotes' : 'invoices'} yet`} description={`Create your first ${noun.toLowerCase()} with the button above.`} /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)', fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>
            <div>{noun}</div><div>Billed to</div><div>Training</div><div>Amount</div><div>Status</div><div />
          </div>

          {rows.map((r, i) => {
            const number = r.quoteNumber ?? r.invoiceNumber
            const amount = gross(r)
            const editable = isQuote ? r.status !== 'invoiced' : r.status === 'draft'
            const deletable = editable
            const text: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            return (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: i < rows.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd' }}>{number}</div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#6b6b60' }}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <div style={text}>{r.billToName || '—'}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={text}>{r.title}</div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#6b6b60' }}>{dateLabel(r)}{r.hours != null ? ` · ${r.hours} h` : ''}</div>
                </div>
                <div style={text}>{amount != null ? money(amount, r.currency) : '—'}{r.applyVat && <span style={{ color: '#6b6b60', fontSize: 11 }}> incl. VAT</span>}</div>
                <div><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></div>

                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                  <ButtonLink href={`${base}/${r.id}/pdf`}><FileDown size={13} strokeWidth={2} /> PDF</ButtonLink>
                  {isQuote && r.status !== 'invoiced' && r.status !== 'declined' && (
                    <Button size="sm" variant="primary" onClick={() => convert(r)} title="Create an invoice from this quote"><ArrowRightLeft size={13} /> Invoice</Button>
                  )}
                  {isQuote && r.status === 'invoiced' && r.invoiceId && <ButtonLink href={`/api/admin/invoices/${r.invoiceId}/pdf`} variant="ghost">Invoice PDF</ButtonLink>}
                  {editable && <Button size="sm" variant="ghost" onClick={() => { setNotice(null); setForm({ doc: r }) }} title="Edit"><Pencil size={13} /></Button>}
                  {deletable && <Button size="sm" variant="danger" onClick={() => remove(r)} title="Delete"><Trash2 size={13} /></Button>}
                  {r.status !== 'invoiced' && (
                    <div style={{ width: 118 }}>
                      <SelectField value={r.status} onChange={(s) => setRowStatus(r, s)}>
                        {(isQuote ? ['draft', 'sent', 'accepted', 'declined'] : ['draft', 'sent', 'paid']).map((s) => <option key={s} value={s}>{s}</option>)}
                      </SelectField>
                    </div>
                  )}
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
