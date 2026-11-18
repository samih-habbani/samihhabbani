import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { parseAppointmentBody, withProviderNames } from '@/lib/appointments'

export async function GET(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const sp = new URL(request.url).searchParams
    const where: Prisma.TrainingAppointmentWhereInput = {}
    const from = sp.get('from'), to = sp.get('to')
    const windowed = !!(from && to)
    if (windowed) {
      const f = new Date(`${from}T00:00:00.000Z`), t = new Date(`${to}T23:59:59.999Z`)
      if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return Response.json({ error: 'Invalid dates' }, { status: 400 })
      where.date = { gte: f, lte: t }
    }
    const page = Math.max(1, parseInt(sp.get('page') || '1') || 1)
    const limit = windowed ? 500 : 20
    const [rows, total] = await Promise.all([
      prisma.trainingAppointment.findMany({ where, orderBy: [{ date: windowed ? 'asc' : 'desc' }, { startTime: 'asc' }], skip: windowed ? 0 : (page - 1) * limit, take: limit }),
      prisma.trainingAppointment.count({ where }),
    ])
    return Response.json({ appointments: await withProviderNames(rows), currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total })
  } catch (error) {
    console.error('List appointments error:', error)
    return Response.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const parsed = parseAppointmentBody(await request.json().catch(() => null))
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    if (parsed.data.providerId && !(await prisma.provider.findUnique({ where: { id: parsed.data.providerId }, select: { id: true } }))) {
      return Response.json({ error: 'Provider not found' }, { status: 404 })
    }
    return Response.json(await prisma.trainingAppointment.create({ data: parsed.data }), { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return Response.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
