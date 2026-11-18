import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { parseAppointmentBody, withProviderNames } from '@/lib/appointments'

type Ctx = { params: Promise<{ id: string }> }
const parseId = async (ctx: Ctx) => parseInt((await ctx.params).id)

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  const row = await prisma.trainingAppointment.findUnique({ where: { id: await parseId(ctx) } })
  if (!row) return Response.json({ error: 'Appointment not found' }, { status: 404 })
  return Response.json((await withProviderNames([row]))[0])
}

export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    if (!(await prisma.trainingAppointment.findUnique({ where: { id }, select: { id: true } }))) return Response.json({ error: 'Appointment not found' }, { status: 404 })
    const parsed = parseAppointmentBody(await request.json().catch(() => null))
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    if (parsed.data.providerId && !(await prisma.provider.findUnique({ where: { id: parsed.data.providerId }, select: { id: true } }))) {
      return Response.json({ error: 'Provider not found' }, { status: 404 })
    }
    return Response.json(await prisma.trainingAppointment.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } }))
  } catch (error) {
    console.error('Update appointment error:', error)
    return Response.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    await prisma.trainingAppointment.delete({ where: { id: await parseId(ctx) } })
    return Response.json({ success: true })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') return Response.json({ error: 'Appointment not found' }, { status: 404 })
    console.error('Delete appointment error:', error)
    return Response.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
