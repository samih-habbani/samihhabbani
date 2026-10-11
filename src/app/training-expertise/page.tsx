import type { Metadata } from 'next'
import { TrainingNav }         from '@/components/training/TrainingNav'
import { TrainerHero }         from '@/components/training/TrainerHero'
import { AICatalog }           from '@/components/training/AICatalog'
import { DevCatalog }          from '@/components/training/DevCatalog'
import { ApproachFormats }     from '@/components/training/ApproachFormats'
import { Testimonials }        from '@/components/training/Testimonials'
import { TrustNetwork }        from '@/components/sections/TrustNetwork'
import { ProofGalleryContact } from '@/components/training/ProofGalleryContact'

const TITLE = 'Samih Habbani — Corporate AI Trainer & Development Trainer | Dubai, UAE'
const DESCRIPTION =
  'Corporate AI Trainer, Microsoft Copilot Trainer (AB-730) and Full-Stack Developer based in Dubai. Generative AI, Microsoft Copilot, AI + Finance and full-stack development training for corporate teams. 5,000+ learners trained, 40+ programs designed.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/training-expertise',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/training-expertise',
    siteName: 'Samih Habbani',
    images: ['/samih.webp'],
    locale: 'en_US',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/samih.webp'],
  },
}

export default function AITrainerPage() {
  return (
    <main>
      <TrainingNav />
      <TrainerHero />
      <AICatalog />
      <DevCatalog />
      <ApproachFormats />
      <Testimonials />
      <TrustNetwork />
      <ProofGalleryContact />
    </main>
  )
}
