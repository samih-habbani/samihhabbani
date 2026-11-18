import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { parseTaskBody, checkLinks, withLinks } from '@/lib/tasks'

type Ctx = { params: Promise<{ id: string }> }
const parseId = async (ctx: Ctx) => parseInt((await ctx.params).id)

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  const row = await prisma.trainingTask.findUnique({ where: { id: await parseId(ctx) } })
  if (!row) return Response.json({ error: 'Task not found' }, { status: 404 })
  return Response.json((await withLinks([row]))[0])
}

export async function PUT(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const id = await parseId(ctx)
    const existing = await prisma.trainingTask.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Task not found' }, { status: 404 })
    const parsed = parseTaskBody(await request.json().catch(() => null))
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const bad = await checkLinks(parsed.data)
    if (bad) return Response.json({ error: bad }, { status: 404 })
    // keep the original completion time when the task was already done
    const doneAt = parsed.data.done ? existing.doneAt ?? new Date() : null
    return Response.json(await prisma.trainingTask.update({ where: { id }, data: { ...parsed.data, doneAt, updatedAt: new Date() } }))
  } catch (error) {
    console.error('Update task error:', error)
    return Response.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// Quick toggle: { done: boolean }
export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.done !== 'boolean') return Response.json({ error: 'Invalid request' }, { status: 400 })
    const row = await prisma.trainingTask.update({ where: { id: await parseId(ctx) }, data: { done: body.done, doneAt: body.done ? new Date() : null, updatedAt: new Date() } })
    return Response.json(row)
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') return Response.json({ error: 'Task not found' }, { status: 404 })
    console.error('Toggle task error:', error)
    return Response.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    await prisma.trainingTask.delete({ where: { id: await parseId(ctx) } })
    return Response.json({ success: true })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') return Response.json({ error: 'Task not found' }, { status: 404 })
    console.error('Delete task error:', error)
    return Response.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
