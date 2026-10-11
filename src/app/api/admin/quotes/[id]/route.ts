import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { QUOTE_STATUSES, parseDocBody, quotePayload, resolveBillTo } from '@/lib/training-docs'

type Ctx = { params: Promise<{ id: string }> }
const parseId = async (ctx: Ctx) => parseInt((await ctx.params).id)

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  const quote = await prisma.trainingQuote.findUnique({ where: { id: await parseId(ctx) } })
  return quote ? Response.json(quote) : Response.json({ error: 'Quote not found' }, { status: 404 })
}

export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingQuote.findUnique({ where: { id }, select: { status: true } })
    if (!existing) return Response.json({ error: 'Quote not found' }, { status: 404 })
    if (existing.status === 'invoiced') return Response.json({ error: 'This quote has already been invoiced and can no longer be edited.' }, { status: 409 })

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request' }, { status: 400 })
    const parsed = parseDocBody('quote', body)
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    if (parsed.data.status === 'invoiced') return Response.json({ error: 'A quote becomes "invoiced" by converting it' }, { status: 400 })
    const billTo = await resolveBillTo(parsed.data.providerId)
    if (!billTo) return Response.json({ error: 'Provider not found' }, { status: 404 })

    const quote = await prisma.trainingQuote.update({ where: { id }, data: quotePayload(parsed.data, billTo) })
    return Response.json(quote)
  } catch (error) {
    console.error('Update quote error:', error)
    return Response.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const { status } = await request.json().catch(() => ({}))
    if (!(QUOTE_STATUSES as readonly string[]).includes(status) || status === 'invoiced') {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }
    const existing = await prisma.trainingQuote.findUnique({ where: { id }, select: { status: true } })
    if (!existing) return Response.json({ error: 'Quote not found' }, { status: 404 })
    if (existing.status === 'invoiced') return Response.json({ error: 'This quote has already been invoiced.' }, { status: 409 })

    const quote = await prisma.trainingQuote.update({ where: { id }, data: { status, updatedAt: new Date() } })
    return Response.json(quote)
  } catch (error) {
    console.error('Update quote status error:', error)
    return Response.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingQuote.findUnique({ where: { id }, select: { status: true } })
    if (!existing) return Response.json({ error: 'Quote not found' }, { status: 404 })
    if (existing.status === 'invoiced') return Response.json({ error: 'This quote has been invoiced and cannot be deleted.' }, { status: 409 })
    await prisma.trainingQuote.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete quote error:', error)
    return Response.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
