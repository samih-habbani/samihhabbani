import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import type { Prisma } from '@prisma/client'
import { INVOICE_STATUSES, buildInvoiceContent, invoicePayload, parseDocBody, resolveBillTo } from '@/lib/training-docs'

type Ctx = { params: Promise<{ id: string }> }
const parseId = async (ctx: Ctx) => parseInt((await ctx.params).id)

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  const invoice = await prisma.trainingInvoice.findUnique({ where: { id: await parseId(ctx) } })
  return invoice ? Response.json(invoice) : Response.json({ error: 'Invoice not found' }, { status: 404 })
}

// Full edit — drafts only, so a sent/paid invoice can't be silently rewritten.
export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingInvoice.findUnique({ where: { id }, select: { status: true } })
    if (!existing) return Response.json({ error: 'Invoice not found' }, { status: 404 })
    if (existing.status !== 'draft') return Response.json({ error: 'Only draft invoices can be edited. Set it back to draft first.' }, { status: 409 })

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request' }, { status: 400 })
    const parsed = parseDocBody('invoice', body)
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const billTo = await resolveBillTo(parsed.data.providerId)
    if (!billTo) return Response.json({ error: 'Provider not found' }, { status: 404 })

    const content = await buildInvoiceContent(parsed.data, id)
    if ('error' in content) return Response.json({ error: content.error }, { status: 400 })

    const invoice = await prisma.$transaction(async (tx) => {
      // Release missions that are no longer on this invoice, then link the selected ones.
      await tx.trainingMission.updateMany({ where: { invoiceId: id, id: { notIn: content.missionIds } }, data: { invoiceId: null, updatedAt: new Date() } })
      if (content.missionIds.length > 0) {
        await tx.trainingMission.updateMany({ where: { id: { in: content.missionIds } }, data: { invoiceId: id, status: 'done', updatedAt: new Date() } })
      }
      return tx.trainingInvoice.update({
        where: { id },
        data: { ...invoicePayload(content.fields, billTo), lines: content.lines as unknown as Prisma.InputJsonValue },
      })
    }, { maxWait: 10000, timeout: 30000 })
    return Response.json(invoice)
  } catch (error) {
    console.error('Update invoice error:', error)
    return Response.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// Status change (draft → sent → paid …)
export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const { status } = await request.json().catch(() => ({}))
    if (!(INVOICE_STATUSES as readonly string[]).includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 })
    const invoice = await prisma.trainingInvoice.update({ where: { id: await parseId(ctx) }, data: { status, updatedAt: new Date() } })
    return Response.json(invoice)
  } catch (error) {
    console.error('Update invoice status error:', error)
    return Response.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

// Drafts only — issued invoice numbers must never leave gaps.
export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingInvoice.findUnique({ where: { id }, select: { status: true, quoteId: true } })
    if (!existing) return Response.json({ error: 'Invoice not found' }, { status: 404 })
    if (existing.status !== 'draft') return Response.json({ error: 'Only draft invoices can be deleted.' }, { status: 409 })

    await prisma.$transaction(async (tx) => {
      await tx.trainingMission.updateMany({ where: { invoiceId: id }, data: { invoiceId: null, updatedAt: new Date() } })
      await tx.trainingInvoice.delete({ where: { id } })
      // Re-open the quote this invoice came from so it can be converted again.
      if (existing.quoteId) {
        await tx.trainingQuote.updateMany({ where: { id: existing.quoteId, invoiceId: id }, data: { status: 'accepted', invoiceId: null, updatedAt: new Date() } })
      }
    }, { maxWait: 10000, timeout: 30000 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete invoice error:', error)
    return Response.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
