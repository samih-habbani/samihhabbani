import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'

// Providers are the SAME rows as in syrama-yachting (shared `provider` table),
// but this backoffice only ever shows/edits the training ones.
const TRAINING: Prisma.ProviderWhereInput = { type: { contains: 'training', mode: 'insensitive' } }
export async function GET(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
    const where: Prisma.ProviderWhereInput = { ...TRAINING }

    const search = searchParams.get('search')?.trim()
    if (search) {
      // Prisma can't do a case-insensitive substring match inside a String[]
      // column, so services are matched with a parameterized raw ILIKE.
      const serviceMatches = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM provider
        WHERE EXISTS (SELECT 1 FROM unnest(services) AS s WHERE s ILIKE ${'%' + search + '%'})
      `
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        ...(serviceMatches.length > 0 ? [{ id: { in: serviceMatches.map((r) => r.id) } }] : []),
      ]
    }

    const countries = searchParams.getAll('country')
    if (countries.length > 0) where.country = { in: countries }
    const cities = searchParams.getAll('city')
    if (cities.length > 0) where.city = { in: cities }
    const activeParam = searchParams.get('active')
    if (activeParam === 'true') where.isActive = true
    if (activeParam === 'false') where.isActive = false

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.provider.count({ where }),
    ])

    return Response.json({ providers, currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return Response.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

const str = (v: unknown, max = 2000) => (typeof v === 'string' && v.trim() !== '' ? v.trim().slice(0, max) : null)

function buildData(d: Record<string, unknown>) {
  return {
    name: str(d.name, 200), company: str(d.company, 200), email: str(d.email, 200), phone: str(d.phone, 100),
    city: str(d.city, 200), country: str(d.country, 200), type: str(d.type, 200),
    services: Array.isArray(d.services) ? d.services.filter((s): s is string => typeof s === 'string' && s.trim() !== '').map((s) => s.trim().slice(0, 200)) : [],
    description: str(d.description, 4000),
    isActive: typeof d.isActive === 'boolean' ? d.isActive : null,
    website: str(d.website, 500), instagram: str(d.instagram, 200), catalogUrl: str(d.catalogUrl, 1000),
    notes: str(d.notes, 4000), position: str(d.position, 200), firstContact: str(d.firstContact, 500),
    firstName: str(d.firstName, 200), region: str(d.region, 200), manager: str(d.manager, 200),
    address: str(d.address, 500), postalCode: str(d.postalCode, 50),
    updatedAt: new Date(),
  }
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const body = await request.json()
    const data = buildData(body)
    if (!data.type || !/training/i.test(data.type)) data.type = 'Training'
    const provider = await prisma.provider.create({ data })
    return Response.json(provider, { status: 201 })
  } catch (error) {
    console.error('Create provider error:', error)
    return Response.json({ error: 'Failed to create provider' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const body = await request.json()
    const id = parseInt(body?.id)
    if (!id) return Response.json({ error: 'Provider ID is required' }, { status: 400 })
    if (!(await prisma.provider.findFirst({ where: { id, ...TRAINING }, select: { id: true } }))) return Response.json({ error: 'Training provider not found' }, { status: 404 })
    const data = buildData(body)
    if (!data.type || !/training/i.test(data.type)) data.type = 'Training'
    const provider = await prisma.provider.update({ where: { id }, data })
    return Response.json(provider)
  } catch (error) {
    console.error('Update provider error:', error)
    return Response.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await requireSession()
  if (session instanceof Response) return session
  const id = parseInt(new URL(request.url).searchParams.get('id') || '')
  if (!id) return Response.json({ error: 'Provider ID is required' }, { status: 400 })
  try {
    if (!(await prisma.provider.findFirst({ where: { id, ...TRAINING }, select: { id: true } }))) return Response.json({ error: 'Training provider not found' }, { status: 404 })
    await prisma.provider.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    // P2003 = a yacht in syrama-yachting still references this provider.
    if ((error as { code?: string }).code === 'P2003') {
      return Response.json({ error: 'This provider is still referenced (e.g. by a yacht in syrama-yachting) and cannot be deleted.' }, { status: 409 })
    }
    console.error('Delete provider error:', error)
    return Response.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}
