'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TRAINER_STATS, CREDENTIALS_OBTAINED, REVIEWS_SUMMARY } from '@/data/training'
import { IconBrain, IconCode, IconGraduation, IconGlobe, IconStar } from './Icons'
import { TrainerPortrait } from './TrainerPortrait'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const PILLARS = [
  { href: '#ai-catalog',    label: 'AI Business Training', desc: '9 programs · Business Teams, Developers & Governance — incl. Microsoft Copilot (AB-730) & AI + Finance', icon: IconBrain, color: '#00FF94' },
  { href: '#dev-catalog',   label: 'Development Training', desc: 'Web, Java, Python, PHP, SQL', icon: IconCode,  color: '#4A9EFF' },
]

export function TrainerHero() {
  const ref     = useRef<HTMLDivElement>(null)
  const inView  = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        paddingTop:    '140px',
        paddingBottom: 'clamp(48px,6vw,88px)',
        paddingLeft:   'clamp(24px,10vw,160px)',
        paddingRight:  'clamp(24px,10vw,160px)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
          background: 'radial-gradient(circle at 85% 0%, rgba(0,212,255,0.08) 0%, transparent 45%), radial-gradient(circle at 10% 100%, rgba(0,255,148,0.06) 0%, transparent 50%)',
        }}
      />

      <div className="relative lg:min-h-[520px]">
        <TrainerPortrait visible={inView} />

        <div className="lg:max-w-[58%]" style={{ position: 'relative', zIndex: 1 }}>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: EASE }}
            className="font-mono font-bold"
            style={{ fontSize: 'clamp(34px,5vw,64px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: '#E8E8E0', marginBottom: '16px' }}
          >
            SAMIH HABBANI
          </motion.h1>

          <motion.a
            href="#testimonials"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.04, duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2"
            style={{ marginBottom: '16px', textDecoration: 'none' }}
          >
            <IconStar size={14} color="#00D4FF" />
            <span className="font-mono text-[12px]">
              <span style={{ color: '#E8E8E0', fontWeight: 700 }}>{REVIEWS_SUMMARY.rating}/5</span>
              <span style={{ color: '#ffffff', opacity: 0.55 }}> · {REVIEWS_SUMMARY.count} student reviews (Google)</span>
            </span>
          </motion.a>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08, duration: 0.55, ease: EASE }}
            className="font-mono"
            style={{ fontSize: 'clamp(15px,1.8vw,20px)', color: '#00FF94', letterSpacing: '-0.01em', marginBottom: '18px' }}
          >
            Corporate AI Trainer · Microsoft Copilot Trainer (AB-730)
            <br />
            Full-Stack Developer
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.14, duration: 0.55, ease: EASE }}
            className="font-sans"
            style={{ fontSize: '14px', color: '#ffffff', opacity: 0.85, lineHeight: 1.7, maxWidth: '620px', marginBottom: '28px' }}
          >
            10+ years of engineering experience, 7+ years delivering corporate training.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="flex items-center gap-2"
            style={{ marginBottom: '22px' }}
          >
            <IconGlobe size={13} color="#ffffff" />
            <span className="font-mono text-[11px]" style={{ color: '#ffffff', opacity: 0.6, letterSpacing: '0.06em' }}>
              Training delivered in French · English · Spanish
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="flex flex-wrap gap-2"
            style={{ marginBottom: '28px' }}
          >
            {CREDENTIALS_OBTAINED.filter(c => c.title !== 'Microsoft Certified Trainer (MCT)').map(c => (
              <span
                key={c.title}
                className="font-mono text-[10px]"
                style={{ color: '#00FF94', border: '1px solid rgba(0,255,148,0.25)', backgroundColor: 'rgba(0,255,148,0.06)', padding: '5px 10px', letterSpacing: '0.04em' }}
              >
                ✓ {c.title}{c.year ? ` · ${c.year}` : ''}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.22, duration: 0.5, ease: EASE }}
            className="flex flex-wrap items-center gap-4"
            style={{ marginBottom: '48px' }}
          >
            <a href="#contact" className="font-mono text-[11px] font-bold tracking-[0.15em]" style={{ backgroundColor: '#00FF94', color: '#030303', padding: '14px 24px' }}>
              DISCUSS A MISSION
            </a>
            <a href="#credentials" className="font-mono text-[11px] font-bold tracking-[0.15em] border" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#E8E8E0', padding: '14px 24px' }}>
              FULL CREDENTIALS ↓
            </a>
          </motion.div>
        </div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.26, duration: 0.55, ease: EASE }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.05)',
          marginBottom: '64px',
        }}
      >
        {TRAINER_STATS.map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#0A0A0A', padding: '18px 16px' }}>
            <div className="font-mono font-bold" style={{ fontSize: 'clamp(20px,2.2vw,26px)', color: '#00FF94', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div className="font-mono text-[9px]" style={{ color: '#ffffff', opacity: 0.6, letterSpacing: '0.06em', lineHeight: 1.4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Overview pillars: the map for the rest of the page ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center gap-3"
        style={{ marginBottom: '18px' }}
      >
        <IconBrain size={16} />
        <p className="font-mono text-xs font-medium tracking-[0.25em] uppercase" style={{ color: '#00D4FF', margin: 0 }}>
          WHAT I DELIVER
        </p>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
        {PILLARS.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.a
              key={p.label}
              href={p.href}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.34 + i * 0.06, duration: 0.5, ease: EASE }}
              className="group"
              style={{ backgroundColor: '#0A0A0A', padding: '24px 22px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <Icon size={26} color={p.color} />
              <div>
                <p className="font-mono font-semibold" style={{ fontSize: '13px', color: '#E8E8E0', marginBottom: '5px' }}>{p.label}</p>
                <p className="font-sans text-[11px]" style={{ color: '#ffffff', opacity: 0.55, lineHeight: 1.5 }}>{p.desc}</p>
              </div>
              <span className="font-mono text-[10px]" style={{ color: p.color, opacity: 0.8 }}>EXPLORE ↓</span>
            </motion.a>
          )
        })}
      </div>

      {/* Full credentials */}
      <div id="credentials" style={{ marginTop: '72px', scrollMarginTop: '96px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-3"
          style={{ marginBottom: '24px' }}
        >
          <IconGraduation size={16} />
          <span className="font-mono text-xs font-medium tracking-[0.25em] uppercase" style={{ color: '#00D4FF' }}>
            EDUCATION & CERTIFICATIONS
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
          {CREDENTIALS_OBTAINED.map(cred => (
            <div key={cred.title} style={{ backgroundColor: '#0A0A0A', padding: '18px 20px' }}>
              <p className="font-mono font-semibold" style={{ fontSize: '13px', color: '#E8E8E0', marginBottom: '5px', lineHeight: 1.4 }}>
                {cred.title}
              </p>
              <p className="font-mono text-[10px]" style={{ color: '#ffffff', opacity: 0.55 }}>
                {cred.institution}{cred.year ? ` · ${cred.year}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
