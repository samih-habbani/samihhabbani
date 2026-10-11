import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import type { Prisma } from '@prisma/client'
import { buildInvoiceContent, grossTotal, invoicePayload, nextInvoiceNumber, parseDocBody, resolveBillTo, INVOICE_STATUSES } from '@/lib/training-docs'

export async function GET(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const status = searchParams.get('status')
    const where = status && (INVOICE_STATUSES as readonly string[]).includes(status) ? { status } : {}

    const now = new Date()
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    const [invoices, total, yearRows] = await Promise.all([
      prisma.trainingInvoice.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.trainingInvoice.count({ where }),
      prisma.trainingInvoice.findMany({
        where: { createdAt: { gte: yearStart } },
        select: { priceTotal: true, applyVat: true, vatRate: true, currency: true, status: true },
      }),
    ])

    const byCurrency: Record<string, { invoiced: number; paid: number; outstanding: number }> = {}
    for (const r of yearRows) {
      const c = (byCurrency[r.currency] ??= { invoiced: 0, paid: 0, outstanding: 0 })
      const amount = grossTotal(r)
      c.invoiced += amount
      if (r.status === 'paid') c.paid += amount
      else if (r.status === 'sent') c.outstanding += amount
    }

    return Response.json({
      invoices,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
      stats: { year: now.getUTCFullYear(), count: yearRows.length, byCurrency },
    })
  } catch (error) {
    console.error('List invoices error:', error)
    return Response.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request' }, { status: 400 })

    const parsed = parseDocBody('invoice', body)
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const billTo = await resolveBillTo(parsed.data.providerId)
    if (!billTo) return Response.json({ error: 'Provider not found' }, { status: 404 })

    const content = await buildInvoiceContent(parsed.data, null)
    if ('error' in content) return Response.json({ error: content.error }, { status: 400 })

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.trainingInvoice.create({
        data: {
          ...invoicePayload(content.fields, billTo),
          invoiceNumber: await nextInvoiceNumber(tx),
          lines: content.lines as unknown as Prisma.InputJsonValue,
        },
      })
      if (content.missionIds.length > 0) {
        await tx.trainingMission.updateMany({ where: { id: { in: content.missionIds } }, data: { invoiceId: created.id, updatedAt: new Date() } })
        // Only sessions that already took place become "done" — future ones stay planned.
        await tx.trainingMission.updateMany({ where: { id: { in: content.missionIds }, startDate: { lte: new Date() } }, data: { status: 'done' } })
      }
      return created
    }, { maxWait: 10000, timeout: 30000 })
    return Response.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return Response.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
