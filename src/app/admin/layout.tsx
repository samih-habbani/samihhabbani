import type { Metadata } from 'next'
import { Cormorant_Garamond, Lora } from 'next/font/google'

const cormorant = Cormorant_Garamond({ variable: '--font-cormorant', subsets: ['latin'], display: 'swap' })
const lora = Lora({ variable: '--font-lora', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} ${lora.variable}`} style={{ minHeight: '100vh', background: '#06090f', color: '#f5eedd', fontFamily: 'var(--font-lora), serif' }}>
      {children}
    </div>
  )
}
