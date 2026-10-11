import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { docToPdfData } from '@/lib/training-docs'
import { generateDocumentPdf } from '@/lib/document-pdf'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (session instanceof Response) return session
  try {
    const quote = await prisma.trainingQuote.findUnique({ where: { id: parseInt((await ctx.params).id) } })
    if (!quote) return Response.json({ error: 'Quote not found' }, { status: 404 })

    const pdf = await generateDocumentPdf(docToPdfData('quote', quote))
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${quote.quoteNumber}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Quote PDF error:', error)
    return Response.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
