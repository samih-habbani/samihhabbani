import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import type { Prisma } from '@prisma/client'
import { nextInvoiceNumber } from '@/lib/training-docs'

// Turns a quote into a draft invoice carrying over everything (recipient
// snapshot, training details, dates, hours, price, VAT) — then marks the
// quote "invoiced" and links the two, all in one transaction.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = parseInt((await ctx.params).id)
    const invoice = await prisma.$transaction(async (tx) => {
      const q = await tx.trainingQuote.findUnique({ where: { id } })
      if (!q) throw Object.assign(new Error('Quote not found'), { http: 404 })
      if (q.status === 'invoiced' || q.invoiceId) throw Object.assign(new Error('This quote has already been converted to an invoice.'), { http: 409 })
      if (q.status === 'declined') throw Object.assign(new Error('A declined quote cannot be invoiced. Set it back to accepted first.'), { http: 409 })

      const created = await tx.trainingInvoice.create({
        data: {
          invoiceNumber: await nextInvoiceNumber(tx),
          lines: [{ title: q.title, description: q.description, topic: q.topic, clientName: q.clientName, location: q.location, participants: null, startDate: q.startDate?.toISOString() ?? null, endDate: q.endDate?.toISOString() ?? null, startTime: q.startTime, endTime: q.endTime, hours: q.hours, hourlyRate: q.hourlyRate, amount: q.priceTotal }] as unknown as Prisma.InputJsonValue,
          quoteId: q.id,
          providerId: q.providerId,
          billToName: q.billToName,
          billToAddress: q.billToAddress,
          title: q.title,
          description: q.description,
          topic: q.topic,
          clientName: q.clientName,
          location: q.location,
          startDate: q.startDate,
          endDate: q.endDate,
          startTime: q.startTime,
          endTime: q.endTime,
          hours: q.hours,
          hourlyRate: q.hourlyRate,
          priceTotal: q.priceTotal,
          currency: q.currency,
          applyVat: q.applyVat,
          vatRate: q.vatRate,
          status: 'draft',
          notes: q.notes,
        },
      })
      const numbered = created
      await tx.trainingQuote.update({ where: { id: q.id }, data: { status: 'invoiced', invoiceId: numbered.id, updatedAt: new Date() } })
      return numbered
    }, { maxWait: 10000, timeout: 30000 }) // remote DB: the 5 s default can expire on a cold connection
    return Response.json(invoice, { status: 201 })
  } catch (error) {
    const http = (error as { http?: number }).http
    if (http) return Response.json({ error: (error as Error).message }, { status: http })
    console.error('Convert quote error:', error)
    return Response.json({ error: 'Failed to convert quote' }, { status: 500 })
  }
}
