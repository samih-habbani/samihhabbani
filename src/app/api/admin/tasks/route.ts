import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { parseTaskBody, checkLinks, withLinks } from '@/lib/tasks'

export async function GET(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const sp = new URL(request.url).searchParams
    const where: Prisma.TrainingTaskWhereInput = {}
    const from = sp.get('from'), to = sp.get('to')
    const windowed = !!(from && to)
    if (windowed) {
      const f = new Date(`${from}T00:00:00.000Z`), t = new Date(`${to}T23:59:59.999Z`)
      if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return Response.json({ error: 'Invalid dates' }, { status: 400 })
      where.dueDate = { gte: f, lte: t }
    }
    const status = sp.get('status')
    if (status === 'open') where.done = false
    if (status === 'done') where.done = true
    const providerId = parseInt(sp.get('providerId') || '')
    if (providerId) where.providerId = providerId
    const missionId = parseInt(sp.get('missionId') || '')
    if (missionId) where.missionId = missionId
    const q = (sp.get('q') || '').trim().slice(0, 100)
    if (q) {
      const ci = { contains: q, mode: 'insensitive' as const }
      const matching = await prisma.provider.findMany({ where: { OR: [{ company: ci }, { name: ci }, { firstName: ci }] }, select: { id: true }, take: 200 })
      where.OR = [{ title: ci }, { description: ci }, { providerId: { in: matching.map((p) => p.id) } }]
    }
    const page = Math.max(1, parseInt(sp.get('page') || '1') || 1)
    const limit = windowed ? 500 : 20
    const [rows, total] = await Promise.all([
      prisma.trainingTask.findMany({ where, orderBy: [{ dueDate: status === 'done' ? 'desc' : 'asc' }, { id: 'asc' }], skip: windowed ? 0 : (page - 1) * limit, take: limit }),
      prisma.trainingTask.count({ where }),
    ])
    return Response.json({ tasks: await withLinks(rows), currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total })
  } catch (error) {
    console.error('List tasks error:', error)
    return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const parsed = parseTaskBody(await request.json().catch(() => null))
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const bad = await checkLinks(parsed.data)
    if (bad) return Response.json({ error: bad }, { status: 404 })
    return Response.json(await prisma.trainingTask.create({ data: parsed.data }), { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return Response.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
