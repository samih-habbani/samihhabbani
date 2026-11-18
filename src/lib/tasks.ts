import { prisma } from '@/lib/prisma'

const str = (v: unknown, max = 2000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const optId = (v: unknown) => (v === null || v === undefined || v === '' ? null : parseInt(String(v)))

export function parseTaskBody(body: unknown) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' }
  const b = body as Record<string, unknown>
  const title = str(b.title, 200)
  if (!title) return { error: 'Title is required' }
  if (typeof b.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(b.dueDate)) return { error: 'A due date is required' }
  const dueDate = new Date(`${b.dueDate.slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(dueDate.getTime())) return { error: 'Invalid date' }
  const providerId = optId(b.providerId), missionId = optId(b.missionId)
  if (providerId !== null && (!Number.isInteger(providerId) || providerId <= 0)) return { error: 'Invalid client' }
  if (missionId !== null && (!Number.isInteger(missionId) || missionId <= 0)) return { error: 'Invalid mission' }
  const done = b.done === true
  return { data: { title, description: str(b.description, 4000), dueDate, providerId, missionId, done, doneAt: done ? new Date() : null } }
}

// Check the optional links exist
export async function checkLinks(d: { providerId: number | null; missionId: number | null }) {
  if (d.providerId && !(await prisma.provider.findUnique({ where: { id: d.providerId }, select: { id: true } }))) return 'Client not found'
  if (d.missionId && !(await prisma.trainingMission.findUnique({ where: { id: d.missionId }, select: { id: true } }))) return 'Mission not found'
  return null
}

// Attach the display names of the linked client (provider) and mission for the UI
export async function withLinks<T extends { providerId: number | null; missionId: number | null }>(rows: T[]) {
  const pIds = [...new Set(rows.map((r) => r.providerId).filter((id): id is number => id != null))]
  const mIds = [...new Set(rows.map((r) => r.missionId).filter((id): id is number => id != null))]
  const [providers, missions] = await Promise.all([
    pIds.length ? prisma.provider.findMany({ where: { id: { in: pIds } }, select: { id: true, company: true, name: true, firstName: true } }) : [],
    mIds.length ? prisma.trainingMission.findMany({ where: { id: { in: mIds } }, select: { id: true, title: true, startDate: true } }) : [],
  ])
  const real = (v?: string | null) => (v && v.trim() && !/^-+$/.test(v.trim()) ? v.trim() : null)
  const pName = new Map(providers.map((p) => [p.id, real(p.company) || [real(p.firstName), real(p.name)].filter(Boolean).join(' ') || `#${p.id}`]))
  const mInfo = new Map(missions.map((m) => [m.id, { title: m.title, date: m.startDate }]))
  return rows.map((r) => ({
    ...r,
    providerName: r.providerId != null ? pName.get(r.providerId) ?? null : null,
    missionTitle: r.missionId != null ? mInfo.get(r.missionId)?.title ?? null : null,
    missionDate: r.missionId != null ? mInfo.get(r.missionId)?.date ?? null : null,
  }))
}
