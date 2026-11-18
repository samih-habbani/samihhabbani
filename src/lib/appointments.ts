import { prisma } from '@/lib/prisma'

const str = (v: unknown, max = 2000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const time = (v: unknown) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null)

export function parseAppointmentBody(body: unknown) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' }
  const b = body as Record<string, unknown>
  const title = str(b.title, 200)
  if (!title) return { error: 'Title is required' }
  if (typeof b.date !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(b.date)) return { error: 'A date is required' }
  const date = new Date(`${b.date.slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return { error: 'Invalid date' }
  const rawProvider = b.providerId === null || b.providerId === undefined || b.providerId === '' ? null : parseInt(String(b.providerId))
  if (rawProvider !== null && (!Number.isInteger(rawProvider) || rawProvider <= 0)) return { error: 'Invalid provider' }
  return { data: { title, date, providerId: rawProvider, startTime: time(b.startTime), endTime: time(b.endTime), location: str(b.location, 300), notes: str(b.notes, 4000) } }
}

// Provider is an optional loose reference — attach its display name for the UI
export async function withProviderNames<T extends { providerId: number | null }>(rows: T[]) {
  const ids = [...new Set(rows.map((r) => r.providerId).filter((id): id is number => id != null))]
  const providers = ids.length ? await prisma.provider.findMany({ where: { id: { in: ids } }, select: { id: true, company: true, name: true, firstName: true } }) : []
  const real = (v?: string | null) => (v && v.trim() && !/^-+$/.test(v.trim()) ? v.trim() : null)
  const byId = new Map(providers.map((p) => [p.id, real(p.company) || [real(p.firstName), real(p.name)].filter(Boolean).join(' ') || `#${p.id}`]))
  return rows.map((r) => ({ ...r, providerName: r.providerId != null ? byId.get(r.providerId) ?? null : null }))
}
