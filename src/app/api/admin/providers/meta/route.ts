import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'

const isPlaceholder = (v: string) => /^-+$/.test(v.trim())

export async function GET() {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const training = { type: { contains: 'training', mode: 'insensitive' as const } }
    const [countries, total, active] = await Promise.all([
      prisma.provider.findMany({ where: { ...training, country: { not: null } }, select: { country: true }, distinct: ['country'] }),
      prisma.provider.count({ where: training }),
      prisma.provider.count({ where: { ...training, isActive: true } }),
    ])
    const clean = (vals: (string | null)[]) =>
      Array.from(new Set(vals.filter((v): v is string => !!v && !isPlaceholder(v)))).sort((a, b) => a.localeCompare(b))
    return Response.json({
      countries: clean(countries.map((c) => c.country)),
      stats: { total, active, inactive: total - active },
    })
  } catch (error) {
    console.error('Error fetching provider meta:', error)
    return Response.json({ error: 'Failed to fetch provider metadata' }, { status: 500 })
  }
}
