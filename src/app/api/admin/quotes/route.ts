import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { QUOTE_STATUSES, formatNumber, grossTotal, parseDocBody, quotePayload, resolveBillTo, tempNumber } from '@/lib/training-docs'

export async function GET(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const status = searchParams.get('status')
    const where = status && (QUOTE_STATUSES as readonly string[]).includes(status) ? { status } : {}

    const now = new Date()
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    const [quotes, total, yearRows] = await Promise.all([
      prisma.trainingQuote.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.trainingQuote.count({ where }),
      prisma.trainingQuote.findMany({
        where: { createdAt: { gte: yearStart } },
        select: { priceTotal: true, applyVat: true, vatRate: true, currency: true, status: true },
      }),
    ])

    // Value of quotes still waiting for an answer, per currency.
    const pending: Record<string, number> = {}
    for (const r of yearRows) if (r.status === 'sent') pending[r.currency] = (pending[r.currency] ?? 0) + grossTotal(r)

    return Response.json({
      quotes,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
      stats: {
        year: now.getUTCFullYear(),
        count: yearRows.length,
        accepted: yearRows.filter((r) => r.status === 'accepted' || r.status === 'invoiced').length,
        pending,
      },
    })
  } catch (error) {
    console.error('List quotes error:', error)
    return Response.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request' }, { status: 400 })

    const parsed = parseDocBody('quote', body)
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    if (parsed.data.status === 'invoiced') return Response.json({ error: 'A quote becomes "invoiced" by converting it' }, { status: 400 })
    const billTo = await resolveBillTo(parsed.data.providerId)
    if (!billTo) return Response.json({ error: 'Provider not found' }, { status: 404 })

    const created = await prisma.trainingQuote.create({ data: { ...quotePayload(parsed.data, billTo), quoteNumber: tempNumber() } })
    const quote = await prisma.trainingQuote.update({ where: { id: created.id }, data: { quoteNumber: formatNumber('quote', created.id) } })
    return Response.json(quote, { status: 201 })
  } catch (error) {
    console.error('Create quote error:', error)
    return Response.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
