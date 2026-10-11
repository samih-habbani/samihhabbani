import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { parseMissionBody, withProviderNames } from '@/lib/missions'

export async function GET(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const sp = new URL(request.url).searchParams
    const where: Prisma.TrainingMissionWhereInput = {}

    // Calendar window: every mission overlapping [from, to]
    const from = sp.get('from'), to = sp.get('to')
    if (from && to) {
      const f = new Date(`${from}T00:00:00.000Z`), t = new Date(`${to}T23:59:59.999Z`)
      if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return Response.json({ error: 'Invalid dates' }, { status: 400 })
      where.startDate = { lte: t }
      where.OR = [{ endDate: { gte: f } }, { endDate: null, startDate: { gte: f } }]
    }

    // Missions that can go on an invoice (for this provider; or already on invoice `forInvoice`)
    const providerId = parseInt(sp.get('providerId') || '')
    if (providerId) where.providerId = providerId
    if (sp.get('available') === '1') {
      const forInvoice = parseInt(sp.get('forInvoice') || '') || -1
      where.status = { notIn: ['cancelled', 'tbc'] } // unconfirmed missions can't be billed yet
      where.AND = [{ OR: [{ invoiceId: null }, { invoiceId: forInvoice }] }]
    }

    const page = Math.max(1, parseInt(sp.get('page') || '1') || 1)
    const limit = from && to ? 500 : Math.min(100, parseInt(sp.get('limit') || '20') || 20)
    const [missions, total] = await Promise.all([
      prisma.trainingMission.findMany({ where, orderBy: { startDate: from && to ? 'asc' : 'desc' }, skip: from && to ? 0 : (page - 1) * limit, take: limit }),
      prisma.trainingMission.count({ where }),
    ])
    return Response.json({ missions: await withProviderNames(missions), currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total })
  } catch (error) {
    console.error('List missions error:', error)
    return Response.json({ error: 'Failed to fetch missions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const body = await request.json().catch(() => null)
    const parsed = parseMissionBody(body)
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const provider = await prisma.provider.findUnique({ where: { id: parsed.data.providerId }, select: { id: true } })
    if (!provider) return Response.json({ error: 'Provider not found' }, { status: 404 })
    const mission = await prisma.trainingMission.create({ data: parsed.data })
    return Response.json(mission, { status: 201 })
  } catch (error) {
    console.error('Create mission error:', error)
    return Response.json({ error: 'Failed to create mission' }, { status: 500 })
  }
}
