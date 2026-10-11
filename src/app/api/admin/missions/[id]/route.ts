import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { parseMissionBody } from '@/lib/missions'

type Ctx = { params: Promise<{ id: string }> }
const parseId = async (ctx: Ctx) => parseInt((await ctx.params).id)

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  const mission = await prisma.trainingMission.findUnique({ where: { id: await parseId(ctx) } })
  return mission ? Response.json(mission) : Response.json({ error: 'Mission not found' }, { status: 404 })
}

export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingMission.findUnique({ where: { id }, select: { invoiceId: true } })
    if (!existing) return Response.json({ error: 'Mission not found' }, { status: 404 })
    const parsed = parseMissionBody(await request.json().catch(() => null))
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    // Once billed, the amounts are frozen on the invoice — keep the mission consistent with it.
    if (existing.invoiceId) return Response.json({ error: 'This mission is already invoiced and can no longer be edited.' }, { status: 409 })
    const provider = await prisma.provider.findUnique({ where: { id: parsed.data.providerId }, select: { id: true } })
    if (!provider) return Response.json({ error: 'Provider not found' }, { status: 404 })
    return Response.json(await prisma.trainingMission.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } }))
  } catch (error) {
    console.error('Update mission error:', error)
    return Response.json({ error: 'Failed to update mission' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingMission.findUnique({ where: { id }, select: { invoiceId: true } })
    if (!existing) return Response.json({ error: 'Mission not found' }, { status: 404 })
    if (existing.invoiceId) return Response.json({ error: 'This mission is on an invoice and cannot be deleted.' }, { status: 409 })
    await prisma.trainingMission.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete mission error:', error)
    return Response.json({ error: 'Failed to delete mission' }, { status: 500 })
  }
}
