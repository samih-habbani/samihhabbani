import { prisma } from '@/lib/prisma'
import type { TrainingInvoice, TrainingQuote } from '@prisma/client'
import { getIssuer } from '@/lib/issuer'
import type { DocumentPdfData } from '@/lib/document-pdf'

export type DocKind = 'quote' | 'invoice'

export const CURRENCIES = ['AED', 'EUR', 'USD'] as const
export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'invoiced'] as const
export const INVOICE_STATUSES = ['draft', 'sent', 'paid'] as const

// Imported provider rows use dash-only strings ('-', '--') as "no value".
const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
const real = (v?: string | null) => (v && v.trim() && !isPlaceholder(v) ? v.trim() : null)

// ── Request-body parsing (shared by quotes and invoices) ──────────────

export interface DocFields {
  providerId: number
  title: string
  description: string | null
  topic: string | null
  clientName: string | null
  location: string | null
  startDate: Date | null
  endDate: Date | null
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
  // quote: valid-until · invoice: due date
  extraDate: Date | null
  // invoices only: missions being billed (amounts then come from the DB)
  missionIds: number[]
}

const str = (v: unknown, max = 2000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)

function num(v: unknown): number | null | 'invalid' {
  if (v === undefined || v === null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? n : 'invalid'
}

function date(v: unknown): Date | null | 'invalid' {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(v)) return 'invalid'
  const d = new Date(`${v.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? 'invalid' : d
}

const time = (v: unknown) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null)
const round2 = (n: number) => Math.round(n * 100) / 100

export function parseDocBody(kind: DocKind, body: Record<string, unknown>): { data: DocFields } | { error: string } {
  const providerId = parseInt(String(body.providerId ?? ''))
  if (!Number.isInteger(providerId) || providerId <= 0) return { error: 'Please select a provider to bill' }

  const missionIds = Array.isArray(body.missionIds)
    ? body.missionIds.map((v) => parseInt(String(v))).filter((n) => Number.isInteger(n) && n > 0)
    : []
  const title = str(body.title, 200) ?? (kind === 'invoice' && missionIds.length > 0 ? '' : null)
  if (title === null) return { error: 'Title is required' }

  const hours = num(body.hours)
  const hourlyRate = num(body.hourlyRate)
  let priceTotal = num(body.priceTotal)
  const startDate = date(body.startDate)
  const endDate = date(body.endDate)
  const extraDate = date(kind === 'quote' ? body.validUntil : body.dueDate)
  if ([hours, hourlyRate, priceTotal].includes('invalid')) return { error: 'Hours, rate and price must be positive numbers' }
  if ([startDate, endDate, extraDate].includes('invalid')) return { error: 'Invalid date' }
  if (startDate instanceof Date && endDate instanceof Date && endDate < startDate) return { error: 'End date is before start date' }

  // Total defaults to hours × rate when the user didn't type one.
  if (priceTotal === null && typeof hours === 'number' && typeof hourlyRate === 'number') priceTotal = round2(hours * hourlyRate)

  const currency = String(body.currency || 'AED')
  if (!(CURRENCIES as readonly string[]).includes(currency)) return { error: 'Unsupported currency' }

  const applyVat = body.applyVat === true
  const vatRaw = num(body.vatRate)
  if (vatRaw === 'invalid' || (typeof vatRaw === 'number' && vatRaw > 100)) return { error: 'Invalid VAT rate' }

  const allowed: readonly string[] = kind === 'quote' ? QUOTE_STATUSES : INVOICE_STATUSES
  const status = String(body.status || 'draft')
  if (!allowed.includes(status)) return { error: 'Invalid status' }

  return {
    data: {
      providerId,
      title,
      description: str(body.description, 4000),
      topic: str(body.topic, 300),
      clientName: str(body.clientName, 200),
      location: str(body.location, 300),
      startDate: startDate as Date | null,
      endDate: endDate as Date | null,
      startTime: time(body.startTime),
      endTime: time(body.endTime),
      hours: hours as number | null,
      hourlyRate: hourlyRate as number | null,
      priceTotal: priceTotal as number | null,
      currency,
      applyVat,
      vatRate: applyVat ? (vatRaw as number | null) ?? 5 : 0,
      status,
      notes: str(body.notes, 4000),
      extraDate: extraDate as Date | null,
      missionIds: kind === 'invoice' ? missionIds : [],
    },
  }
}

// Snapshot of who is being billed, frozen into the document when it's saved —
// so editing/deleting the provider later never rewrites an issued document.
export async function resolveBillTo(providerId: number) {
  const p = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { company: true, name: true, firstName: true, address: true, postalCode: true, city: true, country: true, phone: true, email: true },
  })
  if (!p) return null
  const person = [real(p.firstName), real(p.name)].filter(Boolean).join(' ') || null
  const name = real(p.company) || person
  const lines: string[] = []
  if (real(p.company) && person) lines.push(`Attn: ${person}`)
  if (real(p.address)) lines.push(real(p.address)!)
  const cityLine = [real(p.postalCode), real(p.city)].filter(Boolean).join(' ')
  const cityCountry = [cityLine, real(p.country)].filter(Boolean).join(', ')
  if (cityCountry) lines.push(cityCountry)
  if (real(p.phone)) lines.push(real(p.phone)!)
  if (real(p.email)) lines.push(real(p.email)!)
  return { billToName: name, billToAddress: lines.join('\n') || null }
}

// ── Numbering ─────────────────────────────────────────────────────────
// Same idea as syrama's "INV-26<id>": year prefix + the row's own id, so the
// number can only be set once the row exists.
const yy = () => String(new Date().getFullYear()).slice(-2)
export const formatNumber = (kind: DocKind, id: number) =>
  `SH-${kind === 'invoice' ? 'INV' : 'QUO'}-${yy()}-${String(id).padStart(4, '0')}`

// Training invoices are issued by the SAME company as syrama-yachting, so they
// share its numbering: the next number is drawn from syrama's own `invoice`
// id sequence ("INV-26<id>"), keeping one continuous run across both
// businesses — 11 yachting invoices means the next training one is 12, and
// syrama's next invoice then continues after it.
type Db = Pick<typeof prisma, '$queryRaw'>
export async function nextInvoiceNumber(db: Db = prisma): Promise<string> {
  const [row] = await db.$queryRaw<{ id: bigint }[]>`SELECT nextval(pg_get_serial_sequence('invoice', 'id')) AS id`
  return `INV-${yy()}${row.id}`
}

export const tempNumber = () => `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ── PDF data ──────────────────────────────────────────────────────────

const fmtDate = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : null

// Narrow no-break spaces from toLocaleString aren't in the standard Helvetica
// PDF font — group thousands manually with a plain space, comma decimals.
function fmtMoney(n: number | null | undefined) {
  if (n == null) return null
  const [i, d] = n.toFixed(2).split('.')
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${d}`
}

const fmtHours = (n: number | null | undefined) => (n == null ? null : `${Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/, '')} h`)

export function docToPdfData(kind: DocKind, doc: TrainingQuote | TrainingInvoice): DocumentPdfData {
  const isQuote = kind === 'quote'
  const base = doc.priceTotal
  const vatAmount = doc.applyVat && base != null ? base * (doc.vatRate / 100) : null
  const total = doc.applyVat && base != null ? base + (vatAmount ?? 0) : base
  const q = doc as TrainingQuote
  const inv = doc as TrainingInvoice

  const stored = isQuote ? [] : readLines(inv.lines)
  const lines: InvoiceLine[] = stored.length > 0 ? stored : [{
    title: doc.title, description: doc.description, topic: doc.topic, clientName: doc.clientName, location: doc.location, participants: null,
    startDate: iso(doc.startDate), endDate: iso(doc.endDate), startTime: doc.startTime, endTime: doc.endTime,
    hours: doc.hours, hourlyRate: doc.hourlyRate, amount: doc.priceTotal,
  }]
  const parseIso = (v: string | null) => (v ? new Date(v) : null)
  const single = lines.length === 1

  const pdfLines = lines.map((l) => {
    const schedule = [l.startTime, l.endTime].filter(Boolean).join(' – ') || null
    const details = single ? [] : [
      l.clientName && `Client: ${l.clientName}`,
      l.location && `Location: ${l.location}`,
      l.topic && `Topic: ${l.topic}`,
      schedule && `Schedule: ${schedule}`,
      l.participants && `Participants: ${l.participants}`,
    ].filter((x): x is string => !!x)
    return {
      title: l.title,
      description: l.description,
      details,
      rateLine: l.hourlyRate != null && l.hours != null ? `${fmtHours(l.hours)} × ${fmtMoney(l.hourlyRate)} ${doc.currency}/h` : null,
      startDate: fmtDate(parseIso(l.startDate)),
      endDate: fmtDate(parseIso(l.endDate)),
      hours: fmtHours(l.hours),
      amount: fmtMoney(l.amount),
    }
  })

  const first = lines[0]
  return {
    kind,
    number: isQuote ? q.quoteNumber : inv.invoiceNumber,
    date: fmtDate(doc.createdAt) || '',
    extraDateLabel: isQuote ? 'Valid until' : 'Due date',
    extraDate: fmtDate(isQuote ? q.validUntil : inv.dueDate),
    status: doc.status,
    issuer: getIssuer(),
    billToName: doc.billToName,
    billToLines: doc.billToAddress ? doc.billToAddress.split('\n') : [],
    lines: pdfLines,
    infoBox: single ? {
      client: first.clientName, location: first.location, topic: first.topic,
      schedule: [first.startTime, first.endTime].filter(Boolean).join(' – ') || null,
      participants: first.participants,
    } : null,
    applyVat: doc.applyVat,
    vatRate: doc.vatRate,
    subtotal: fmtMoney(base),
    vatAmount: fmtMoney(vatAmount),
    totalDue: fmtMoney(total),
    currency: doc.currency,
    notes: doc.notes,
  }
}

// ── Prisma create/update payloads ─────────────────────────────────────

type BillTo = { billToName: string | null; billToAddress: string | null }

const common = (f: DocFields, b: BillTo) => ({
  providerId: f.providerId,
  billToName: b.billToName,
  billToAddress: b.billToAddress,
  title: f.title,
  description: f.description,
  topic: f.topic,
  clientName: f.clientName,
  location: f.location,
  startDate: f.startDate,
  endDate: f.endDate,
  startTime: f.startTime,
  endTime: f.endTime,
  hours: f.hours,
  hourlyRate: f.hourlyRate,
  priceTotal: f.priceTotal,
  currency: f.currency,
  applyVat: f.applyVat,
  vatRate: f.vatRate,
  status: f.status,
  notes: f.notes,
  updatedAt: new Date(),
})

export const quotePayload = (f: DocFields, b: BillTo) => ({ ...common(f, b), validUntil: f.extraDate })
export const invoicePayload = (f: DocFields, b: BillTo) => ({ ...common(f, b), dueDate: f.extraDate })

// Amount including VAT — what the recipient actually owes.
export const grossTotal = (d: { priceTotal: number | null; applyVat: boolean; vatRate: number }) =>
  d.priceTotal == null ? 0 : d.applyVat ? d.priceTotal * (1 + d.vatRate / 100) : d.priceTotal


// ── Invoice lines (one per billed session) ────────────────────────────

export interface InvoiceLine {
  title: string
  description: string | null
  topic: string | null
  clientName: string | null
  location: string | null
  participants: number | null
  startDate: string | null // ISO
  endDate: string | null
  startTime: string | null
  endTime: string | null
  hours: number | null
  hourlyRate: number | null
  amount: number | null
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)

export function lineFromFields(f: DocFields): InvoiceLine {
  return {
    title: f.title, description: f.description, topic: f.topic, clientName: f.clientName, location: f.location, participants: null,
    startDate: iso(f.startDate), endDate: iso(f.endDate), startTime: f.startTime, endTime: f.endTime,
    hours: f.hours, hourlyRate: f.hourlyRate, amount: f.priceTotal,
  }
}

export function lineFromMission(m: { title: string; description: string | null; clientName: string | null; location: string | null; participants: number | null; startDate: Date; endDate: Date | null; startTime: string | null; endTime: string | null; hours: number | null; hourlyRate: number | null; priceTotal: number | null }): InvoiceLine {
  return {
    title: m.title, description: m.description, topic: null, clientName: m.clientName, location: m.location, participants: m.participants,
    startDate: iso(m.startDate), endDate: iso(m.endDate), startTime: m.startTime, endTime: m.endTime,
    hours: m.hours, hourlyRate: m.hourlyRate, amount: m.priceTotal,
  }
}

export const readLines = (v: unknown): InvoiceLine[] => (Array.isArray(v) ? (v as InvoiceLine[]) : [])

// ── Invoice content: manual fields, or built from selected missions ───

export async function buildInvoiceContent(f: DocFields, currentInvoiceId: number | null) {
  if (f.missionIds.length === 0) {
    return { fields: f, lines: [lineFromFields(f)], missionIds: [] as number[] }
  }
  const ids = [...new Set(f.missionIds)]
  const missions = await prisma.trainingMission.findMany({
    where: {
      id: { in: ids }, providerId: f.providerId, status: { notIn: ['cancelled', 'tbc'] },
      OR: [{ invoiceId: null }, { invoiceId: currentInvoiceId ?? -1 }],
    },
    orderBy: { startDate: 'asc' },
  })
  if (missions.length !== ids.length) return { error: 'Some selected missions are unavailable (already invoiced, cancelled, or for another provider).' }
  if (new Set(missions.map((m) => m.currency)).size > 1) return { error: 'Selected missions use different currencies — invoice them separately.' }
  const unpriced = missions.find((m) => m.priceTotal == null)
  if (unpriced) return { error: `Mission "${unpriced.title}" has no price yet.` }

  const one = missions.length === 1 ? missions[0] : null
  const starts = missions.map((m) => m.startDate.getTime())
  const ends = missions.map((m) => (m.endDate ?? m.startDate).getTime())
  const hours = missions.reduce((a, m) => a + (m.hours ?? 0), 0)
  return {
    fields: {
      ...f,
      title: f.title || one?.title || `Training sessions (${missions.length})`,
      description: f.description ?? one?.description ?? null,
      topic: null,
      clientName: one?.clientName ?? null,
      location: one?.location ?? null,
      startDate: new Date(Math.min(...starts)),
      endDate: new Date(Math.max(...ends)),
      startTime: one?.startTime ?? null,
      endTime: one?.endTime ?? null,
      hours: hours || null,
      hourlyRate: one?.hourlyRate ?? null,
      priceTotal: round2(missions.reduce((a, m) => a + (m.priceTotal ?? 0), 0)),
      currency: missions[0].currency,
    },
    lines: missions.map(lineFromMission),
    missionIds: missions.map((m) => m.id),
  }
}
