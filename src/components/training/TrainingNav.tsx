'use client'

import { motion } from 'framer-motion'
import { PROOF_LINKS } from '@/data/training'

const LINKS = [
  { label: 'AI CATALOG',    href: '#ai-catalog'  },
  { label: 'CODING',        href: '#dev-catalog' },
  { label: 'APPROACH',      href: '#approach'    },
  { label: 'REVIEWS',       href: '#testimonials'},
  { label: 'NETWORK',       href: '#trust'       },
  { label: 'VISIBLE PROOF', href: '#proof'       },
  { label: 'CONTACT',       href: '#contact'     },
]

export function TrainingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ backgroundColor: 'rgba(5,5,5,0.85)', paddingLeft: '1rem', paddingRight: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="fixed top-0 left-0 right-0 z-[1000] h-16 px-10 flex items-center justify-between backdrop-blur-md"
    >
      <a
        href="/"
        className="font-mono text-xs font-semibold tracking-[0.15em] text-fg-primary hover:text-[#00FF94] transition-colors duration-200 flex items-center gap-2"
      >
        <span style={{ color: '#00FF94' }}>←</span> PORTFOLIO
      </a>

      <div className="flex items-center gap-7">
        <ul className="hidden md:flex items-center gap-7 list-none">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="font-mono text-[11px] font-semibold tracking-[0.18em] text-fg-primary hover:text-[#00D4FF] transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={PROOF_LINKS.trainingCatalogue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] font-bold tracking-[0.15em]"
            style={{ backgroundColor: '#00D4FF', color: '#030303', padding: '6px 12px' }}
          >
            CATALOGUE
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
