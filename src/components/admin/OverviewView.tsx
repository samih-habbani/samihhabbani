'use client'

import { FileText, Receipt, Building2, Wallet } from 'lucide-react'
import { Badge, ButtonLink, Card, EmptyState, PageHeader, StatCard, type Tone } from './ui'

export interface OverviewItem { id: number; number: string; billTo: string | null; title: string; amount: string; status: string }
export interface OverviewData {
  quotesYear: number
  invoicesYear: number
  providers: number
  outstanding: string
  invoices: OverviewItem[]
  quotes: OverviewItem[]
}

const statusTone = (s: string): Tone => (s === 'paid' || s === 'accepted' ? 'green' : s === 'sent' ? 'blue' : s === 'declined' ? 'red' : s === 'invoiced' ? 'gold' : 'neutral')
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)', fontFamily: 'var(--font-lora)', fontSize: 13 }
const head: React.CSSProperties = { padding: '18px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)', fontFamily: 'var(--font-cormorant)', fontSize: 20, color: '#f5eedd' }

function List({ title, items, icon: Icon, empty }: { title: string; items: OverviewItem[]; icon: typeof FileText; empty: string }) {
  return (
    <Card style={{ overflow: 'hidden' }}>
      <div style={head}>{title}</div>
      {items.length === 0 ? <EmptyState icon={Icon} title={empty} /> : items.map((i) => (
        <div key={i.id} style={row}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#f5eedd' }}>{i.number}</div>
            <div style={{ color: '#8f8f7f', fontSize: 12 }}>{i.billTo || '—'} · {i.title}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: '#d8d8cc', marginBottom: 4 }}>{i.amount}</div>
            <Badge tone={statusTone(i.status)} dot>{i.status}</Badge>
          </div>
        </div>
      ))}
    </Card>
  )
}

export default function OverviewView({ data }: { data: OverviewData }) {
  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your training quotes, invoices and provider network at a glance."
        breadcrumbs={[{ label: 'Overview' }]}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <ButtonLink href="/admin/dashboard/quotes?new=1" variant="secondary" size="md" newTab={false}>New quote</ButtonLink>
            <ButtonLink href="/admin/dashboard/invoices?new=1" variant="primary" size="md" newTab={false}>New invoice</ButtonLink>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label="Quotes this year" value={data.quotesYear} icon={FileText} tone="blue" />
        <StatCard label="Invoices this year" value={data.invoicesYear} icon={Receipt} tone="gold" />
        <StatCard label="Awaiting payment" value={<span style={{ fontSize: 26 }}>{data.outstanding}</span>} icon={Wallet} tone="green" />
        <StatCard label="Providers" value={data.providers} icon={Building2} tone="neutral" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 18 }}>
        <List title="Latest invoices" items={data.invoices} icon={Receipt} empty="No invoices yet" />
        <List title="Latest quotes" items={data.quotes} icon={FileText} empty="No quotes yet" />
      </div>
    </div>
  )
}
