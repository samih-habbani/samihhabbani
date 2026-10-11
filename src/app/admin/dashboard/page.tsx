import { prisma } from '@/lib/prisma'
import { grossTotal } from '@/lib/training-docs'
import OverviewView, { type OverviewItem } from '@/components/admin/OverviewView'

export const dynamic = 'force-dynamic'

const money = (n: number, cur: string) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cur}`

export default async function OverviewPage() {
  const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1))
  const [providers, quotesYear, invoicesYear, recentInvoices, recentQuotes, openInvoices] = await Promise.all([
    prisma.provider.count({ where: { type: { contains: 'training', mode: 'insensitive' } } }),
    prisma.trainingQuote.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.trainingInvoice.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.trainingInvoice.findMany({ orderBy: { id: 'desc' }, take: 5 }),
    prisma.trainingQuote.findMany({ orderBy: { id: 'desc' }, take: 5 }),
    prisma.trainingInvoice.findMany({ where: { status: 'sent' }, select: { priceTotal: true, applyVat: true, vatRate: true, currency: true } }),
  ])

  const outstanding: Record<string, number> = {}
  for (const i of openInvoices) outstanding[i.currency] = (outstanding[i.currency] ?? 0) + grossTotal(i)

  const toItem = (d: { id: number; billToName: string | null; title: string; status: string; priceTotal: number | null; applyVat: boolean; vatRate: number; currency: string }, number: string): OverviewItem => ({
    id: d.id, number, billTo: d.billToName, title: d.title, status: d.status, amount: money(grossTotal(d), d.currency),
  })

  return (
    <OverviewView
      data={{
        quotesYear, invoicesYear, providers,
        outstanding: Object.entries(outstanding).map(([c, n]) => money(n, c)).join(' · ') || '—',
        invoices: recentInvoices.map((i) => toItem(i, i.invoiceNumber)),
        quotes: recentQuotes.map((q) => toItem(q, q.quoteNumber)),
      }}
    />
  )
}
