'use client'

import { FileText, Receipt, Building2, Wallet, TrendingUp, Send, Clock } from 'lucide-react'
import { Badge, ButtonLink, Card, EmptyState, PageHeader, StatCard, type Tone } from './ui'

export interface OverviewItem { id: number; number: string; billTo: string | null; title: string; amount: string; status: string; note?: string; ready?: boolean }
export interface ToGenerateGroup {
  providerId: number
  providerName: string
  currency: string
  total: string
  missions: { id: number; title: string; date: string; amount: string; overdue: boolean }[]
}
export interface OverviewData {
  monthLabel: string
  earnedMonth: string
  scheduledMonth: string | null // breakdown line under the month figure
  earnedYear: string
  year: number
  toSend: string
  toSendDetail: string
  awaiting: string
  fxNote: string
  quotesYear: number
  invoicesYear: number
  providers: number
  invoices: OverviewItem[]
  quotes: OverviewItem[]
  toGenerate: ToGenerateGroup[]
  drafts: OverviewItem[]
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
            {i.note && <div style={{ marginTop: 4 }}><Badge tone={i.ready ? 'green' : 'neutral'}>{i.note}</Badge></div>}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 18 }}>
        <StatCard label={`Expected — ${data.monthLabel}`} value={<span style={{ fontSize: 26 }}>{data.earnedMonth}</span>} sub={data.scheduledMonth ?? ''} icon={Wallet} tone="green" />
        <StatCard label={`Earned — ${data.year}`} value={<span style={{ fontSize: 26 }}>{data.earnedYear}</span>} sub="Missions delivered, excl. VAT" icon={TrendingUp} tone="gold" />
        <StatCard label="To send this month" value={<span style={{ fontSize: 26 }}>{data.toSend}</span>} sub={data.toSendDetail} icon={Send} tone="red" />
        <StatCard label="Awaiting payment" value={<span style={{ fontSize: 26 }}>{data.awaiting}</span>} sub="Invoices sent, not yet paid" icon={Clock} tone="blue" />
      </div>
      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#6b6b60', marginBottom: 18 }}>All amounts in AED — {data.fxNote}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label="Quotes this year" value={data.quotesYear} icon={FileText} tone="blue" />
        <StatCard label="Invoices this year" value={data.invoicesYear} icon={Receipt} tone="gold" />
        <StatCard label="Providers" value={data.providers} icon={Building2} tone="neutral" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 18 }}>
        <List title="Latest invoices" items={data.invoices} icon={Receipt} empty="No invoices yet" />
        <List title="Latest quotes" items={data.quotes} icon={FileText} empty="No quotes yet" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 18, marginTop: 28 }}>
        <Card style={{ overflow: 'hidden' }}>
          <div style={head}>Invoices to generate</div>
          {data.toGenerate.length === 0 ? <EmptyState icon={Receipt} title="Nothing to generate" description="Every delivered mission is already invoiced." /> : data.toGenerate.map((g) => (
            <div key={`${g.providerId}-${g.currency}`} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, color: '#f5eedd', fontWeight: 600 }}>{g.providerName} <span style={{ color: '#d4b472', fontWeight: 400 }}>· {g.total}</span></div>
                <ButtonLink
                  href={`/admin/dashboard/invoices?new=1&providerId=${g.providerId}&providerName=${encodeURIComponent(g.providerName)}&missions=${g.missions.map((m) => m.id).join(',')}`}
                  variant="primary" newTab={false}
                >Create invoice</ButtonLink>
              </div>
              {g.missions.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', padding: '2px 0' }}>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.date} · {m.title}{m.overdue ? <span style={{ marginLeft: 8 }}><Badge tone="red">overdue</Badge></span> : null}</span>
                  <span style={{ flexShrink: 0, color: '#d8d8cc' }}>{m.amount}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
        <List title="Drafts to send" items={data.drafts} icon={Send} empty="No draft waiting" />
      </div>
    </div>
  )
}
