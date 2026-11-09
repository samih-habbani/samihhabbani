import { prisma } from '@/lib/prisma'
import { grossTotal } from '@/lib/training-docs'
import { withProviderNames } from '@/lib/missions'
import { getFx } from '@/lib/fx'
import OverviewView, { type OverviewItem, type ToGenerateGroup } from '@/components/admin/OverviewView'

export const dynamic = 'force-dynamic'

const fmt = (n: number, cur: string) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cur}`
type Totals = Record<string, number>
const add = (t: Totals, cur: string, n: number) => { t[cur] = (t[cur] ?? 0) + n }

export default async function OverviewPage() {
  const fx = await getFx()
  // Every figure on this page is shown in AED (converted from the document's own currency)
  const aedTotal = (t: Totals) => Object.entries(t).reduce((a, [c, n]) => a + fx.toAed(n, c), 0)
  const label = (t: Totals) => (aedTotal(t) > 0 ? fmt(aedTotal(t), 'AED') : '—')
  // An amount in AED, with the original in brackets when it was converted
  const aed = (n: number, cur: string) => (cur === 'AED' ? fmt(n, 'AED') : `${fmt(fx.toAed(n, cur), 'AED')} (${fmt(n, cur)})`)
  const now = new Date()
  const y = now.getUTCFullYear(), mo = now.getUTCMonth()
  const monthStart = new Date(Date.UTC(y, mo, 1))
  const monthEnd = new Date(Date.UTC(y, mo + 1, 1))
  const yearStart = new Date(Date.UTC(y, 0, 1))
  const yearEnd = new Date(Date.UTC(y + 1, 0, 1))
  const endOfToday = new Date(Date.UTC(y, mo, now.getUTCDate(), 23, 59, 59, 999))
  // Only missions that count as real work: not cancelled, not still "to be confirmed"
  const counts = { status: { notIn: ['cancelled', 'tbc'] } }

  const [providers, quotesYear, invoicesYear, recentInvoices, recentQuotes, sentInvoices, draftInvoices, missionsYear, unbilled] = await Promise.all([
    prisma.provider.count({ where: { type: { contains: 'training', mode: 'insensitive' } } }),
    prisma.trainingQuote.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.trainingInvoice.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.trainingInvoice.findMany({ orderBy: { id: 'desc' }, take: 5 }),
    prisma.trainingQuote.findMany({ orderBy: { id: 'desc' }, take: 5 }),
    prisma.trainingInvoice.findMany({ where: { status: 'sent' }, select: { priceTotal: true, applyVat: true, vatRate: true, currency: true } }),
    prisma.trainingInvoice.findMany({ where: { status: 'draft' }, orderBy: { id: 'desc' } }),
    prisma.trainingMission.findMany({ where: { status: { not: 'cancelled' }, startDate: { gte: yearStart, lt: yearEnd } }, select: { startDate: true, priceTotal: true, currency: true, status: true } }),
    prisma.trainingMission.findMany({ where: { ...counts, invoiceId: null, startDate: { lte: endOfToday } }, orderBy: { startDate: 'asc' } }),
  ])

  // Earned = delivered missions (date already passed), excl. VAT, per currency
  // Month card = everything planned for the month (delivered + still to come), as per the missions;
  // unconfirmed ("to be confirmed") ones are shown separately and never counted.
  const expectedMonth: Totals = {}, deliveredMonth: Totals = {}, comingMonth: Totals = {}, tbcMonth: Totals = {}, earnedYear: Totals = {}
  for (const m of missionsYear) {
    const amount = m.priceTotal ?? 0
    const inMonth = m.startDate >= monthStart && m.startDate < monthEnd
    if (m.status === 'tbc') { if (inMonth) add(tbcMonth, m.currency, amount); continue }
    if (m.startDate <= endOfToday) add(earnedYear, m.currency, amount)
    if (inMonth) {
      add(expectedMonth, m.currency, amount)
      add(m.startDate <= endOfToday ? deliveredMonth : comingMonth, m.currency, amount)
    }
  }
  const has = (t: Totals) => Object.values(t).some((n) => n > 0)

  const awaiting: Totals = {}
  for (const i of sentInvoices) add(awaiting, i.currency, grossTotal(i))

  // To send this month = invoices already generated but still draft + this month's delivered work not yet invoiced
  const draftTotals: Totals = {}, toGenerateMonth: Totals = {}
  // A draft only becomes "to send" once its last session has taken place
  const isReady = (d: { endDate: Date | null; startDate: Date | null }) => (d.endDate ?? d.startDate ?? new Date(0)) <= endOfToday
  for (const d of draftInvoices) if (isReady(d)) add(draftTotals, d.currency, grossTotal(d))
  for (const m of unbilled) if (m.startDate >= monthStart) add(toGenerateMonth, m.currency, m.priceTotal ?? 0)
  const toSend: Totals = {}
  for (const [c, n] of Object.entries(draftTotals)) add(toSend, c, n)
  for (const [c, n] of Object.entries(toGenerateMonth)) add(toSend, c, n)

  // Reminders: delivered missions with no invoice yet, grouped by provider + currency
  const named = await withProviderNames(unbilled)
  const groups = new Map<string, ToGenerateGroup>()
  for (const m of named) {
    const key = `${m.providerId}-${m.currency}`
    const g = groups.get(key) ?? { providerId: m.providerId, providerName: m.providerName ?? `#${m.providerId}`, currency: m.currency, total: '', missions: [] }
    g.missions.push({
      id: m.id, title: m.title, date: m.startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
      amount: m.priceTotal != null ? aed(m.priceTotal, m.currency) : 'no price', overdue: m.startDate < monthStart,
    })
    groups.set(key, g)
  }
  for (const g of groups.values()) {
    const sum = unbilled.filter((m) => `${m.providerId}-${m.currency}` === `${g.providerId}-${g.currency}`).reduce((a, m) => a + (m.priceTotal ?? 0), 0)
    g.total = aed(sum, g.currency)
  }

  const toItem = (d: { id: number; billToName: string | null; title: string; status: string; priceTotal: number | null; applyVat: boolean; vatRate: number; currency: string }, number: string): OverviewItem => ({
    id: d.id, number, billTo: d.billToName, title: d.title, status: d.status, amount: aed(grossTotal(d), d.currency),
  })

  return (
    <OverviewView
      data={{
        monthLabel: now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
        earnedMonth: label(expectedMonth),
        scheduledMonth: [
          has(expectedMonth) ? `${label(deliveredMonth)} delivered · ${label(comingMonth)} still to come` : 'No mission planned this month',
          has(tbcMonth) ? `+ ${label(tbcMonth)} to be confirmed` : '',
        ].filter(Boolean).join(' · '),
        earnedYear: label(earnedYear),
        year: y,
        toSend: label(toSend),
        toSendDetail: `${label(draftTotals)} in draft · ${label(toGenerateMonth)} not yet generated`,
        awaiting: label(awaiting),
        fxNote: fx.note,
        quotesYear, invoicesYear, providers,
        invoices: recentInvoices.map((i) => toItem(i, i.invoiceNumber)),
        quotes: recentQuotes.map((q) => toItem(q, q.quoteNumber)),
        toGenerate: [...groups.values()],
        drafts: draftInvoices.map((i) => ({
          ...toItem(i, i.invoiceNumber),
          note: isReady(i) ? 'Ready to send' : `Not ready — sessions until ${(i.endDate ?? i.startDate)!.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })}`,
          ready: isReady(i),
        })),
      }}
    />
  )
}
