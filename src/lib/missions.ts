import type { TrainingMission } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CURRENCIES } from '@/lib/training-docs'

const str = (v: unknown, max = 2000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const time = (v: unknown) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null)
const round2 = (n: number) => Math.round(n * 100) / 100

function num(v: unknown): number | null | 'invalid' {
  if (v === undefined || v === null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? n : 'invalid'
}
function day(v: unknown): Date | null | 'invalid' {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(v)) return 'invalid'
  const d = new Date(`${v.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? 'invalid' : d
}

export function parseMissionBody(body: unknown) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' }
  const b = body as Record<string, unknown>
  const providerId = parseInt(String(b.providerId ?? ''))
  if (!Number.isInteger(providerId) || providerId <= 0) return { error: 'Please select the provider you work for' }
  const title = str(b.title, 200)
  if (!title) return { error: 'Title is required' }

  const startDate = day(b.startDate), endDate = day(b.endDate)
  if (!(startDate instanceof Date)) return { error: 'A start date is required' }
  if (endDate === 'invalid') return { error: 'Invalid end date' }
  if (endDate instanceof Date && endDate < startDate) return { error: 'End date is before start date' }

  const participants = num(b.participants), hours = num(b.hours), hourlyRate = num(b.hourlyRate)
  let priceTotal = num(b.priceTotal)
  if ([participants, hours, hourlyRate, priceTotal].includes('invalid')) return { error: 'Participants, hours, rate and price must be positive numbers' }
  if (priceTotal === null && typeof hours === 'number' && typeof hourlyRate === 'number') priceTotal = round2(hours * hourlyRate)

  const currency = String(b.currency || 'AED')
  if (!(CURRENCIES as readonly string[]).includes(currency)) return { error: 'Unsupported currency' }
  const status = String(b.status || 'planned')
  if (!['planned', 'done', 'cancelled', 'tbc'].includes(status)) return { error: 'Invalid status' }

  const missionUrl = str(b.missionUrl, 1000)
  if (missionUrl) {
    try {
      const u = new URL(missionUrl)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error()
    } catch { return { error: 'The mission link must be a valid http(s) URL' } }
  }

  return {
    data: {
      providerId, title, description: str(b.description, 4000), clientName: str(b.clientName, 200),
      location: str(b.location, 300), missionUrl,
      participants: participants === null ? null : Math.round(participants as number),
      startDate, endDate: endDate as Date | null, startTime: time(b.startTime), endTime: time(b.endTime),
      hours: hours as number | null, hourlyRate: hourlyRate as number | null, priceTotal: priceTotal as number | null,
      currency, status,
    },
  }
}

// Attach the billed provider's display name to missions (providers are a loose reference).
export async function withProviderNames(missions: TrainingMission[]) {
  const ids = [...new Set(missions.map((m) => m.providerId))]
  const providers = ids.length ? await prisma.provider.findMany({ where: { id: { in: ids } }, select: { id: true, company: true, name: true, firstName: true } }) : []
  const real = (v?: string | null) => (v && v.trim() && !/^-+$/.test(v.trim()) ? v.trim() : null)
  const byId = new Map(providers.map((p) => [p.id, real(p.company) || [real(p.firstName), real(p.name)].filter(Boolean).join(' ') || `#${p.id}`]))
  return missions.map((m) => ({ ...m, providerName: byId.get(m.providerId) ?? null }))
}
