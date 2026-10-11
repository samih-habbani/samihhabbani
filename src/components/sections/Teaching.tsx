'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ── Data ───────────────────────────────────────────────────

const AUDIENCES = [
  {
    id:        '01',
    label:     'Children & Schools',
    color:     '#FFB800',
    objective: 'Spark curiosity, creativity and confidence with technology.',
    methods:   ['Creative AI workshops', 'Storytelling & visual projects', 'Simple prompts & games', 'Group challenges'],
    outcomes:  ['AI artwork', 'Mini project', 'Story', 'Comic'],
  },
  {
    id:        '02',
    label:     'Students & Job Seekers',
    color:     '#4A9EFF',
    objective: 'Build employable, job-ready digital and AI skills.',
    methods:   ['Project-based learning', 'AI-assisted workflows', 'Mock client briefs', 'Portfolio projects'],
    outcomes:  ['Website', 'App', 'Dashboard', 'Portfolio'],
  },
  {
    id:        '03',
    label:     'Entrepreneurs & Creators',
    color:     '#00FF94',
    objective: 'Launch, communicate and grow faster with AI tools.',
    methods:   ['Websites & landing pages', 'Content systems', 'Automation workflows', 'Personal branding'],
    outcomes:  ['Landing page', 'Content system', 'Pitch deck', 'Social plan'],
  },
  {
    id:        '04',
    label:     'Companies & Teams',
    color:     '#00D4FF',
    objective: 'Upskill employees and adopt AI inside real workflows.',
    methods:   ['Needs analysis', 'Custom workshops', 'Internal AI assistants', 'Productivity workflows'],
    outcomes:  ['Productivity gains', 'Automation', 'AI adoption', 'Confident teams'],
  },
]

const METHOD_STEPS = [
  { id: '01', label: 'UNDERSTAND', color: '#4A9EFF' },
  { id: '02', label: 'BUILD',      color: '#00D4FF' },
  { id: '03', label: 'PRACTICE',   color: '#FFB800' },
  { id: '04', label: 'PRESENT',    color: '#00FF94' },
  { id: '05', label: 'DEPLOY',     color: '#00FF94' },
]

const STATS = [
  { value: 10,   suffix: '+', label: 'Years Teaching',     duration: 1.2, delay: 0   },
  { value: 5000, suffix: '+', label: 'Learners Trained',   duration: 2.0, delay: 0.2 },
  { value: 40,   suffix: '+', label: 'Programs Designed',  duration: 1.0, delay: 0.4 },
  { value: 1000, suffix: '+', label: 'Educational Videos', duration: 1.6, delay: 0.6 },
]

// ── Animated counter ───────────────────────────────────────
function CountUp({
  to, duration = 1.8, delay = 0, suffix = '', start,
}: {
  to: number; duration?: number; delay?: number; suffix?: string; start: boolean
}) {
  const count   = useMotionValue(0)
  const display = useTransform(count, (v) => {
    const n = Math.round(v)
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K' + suffix
    return n + suffix
  })
  useEffect(() => {
    if (!start) return
    const ctrl = animate(count, to, { duration, delay, ease: 'easeOut' })
    return ctrl.stop
  }, [start, to, duration, delay, count])
  return <motion.span>{display}</motion.span>
}

// ── Notebook lines background ──────────────────────────────
function NotebookLines() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(74,158,255,0.018) 1px, transparent 1px)',
        backgroundSize: '100% 52px',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

// ── Audience card ──────────────────────────────────────────
function AudienceCard({ aud, index }: { aud: typeof AUDIENCES[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: EASE }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        backgroundColor:  hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border:           `1px solid ${hovered ? aud.color + '30' : 'rgba(255,255,255,0.07)'}`,
        overflow:         'hidden',
        display:          'flex',
        flexDirection:    'column',
        transform:        hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow:        hovered ? `0 12px 40px ${aud.color}12` : 'none',
        transition:       'background-color 0.25s, border-color 0.25s, transform 0.25s, box-shadow 0.25s',
        cursor:           'default',
      }}
    >
      {/* Top accent line */}
      <div style={{
        height:          '2px',
        backgroundColor: aud.color,
        opacity:         hovered ? 1 : 0.35,
        transition:      'opacity 0.25s',
        flexShrink:      0,
      }} />

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* ID + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: aud.color, opacity: 0.6, letterSpacing: '0.15em' }}>
            [{aud.id}]
          </span>
          <span className="font-mono" style={{
            fontSize:   '11px',
            color:      hovered ? '#E8E8E0' : '#C8C8C0',
            fontWeight: 700,
            letterSpacing: '0.04em',
            transition: 'color 0.25s',
          }}>
            {aud.label.toUpperCase()}
          </span>
        </div>

        {/* Objective */}
        <p className="font-sans" style={{
          fontSize:    '11px',
          color:       aud.color,
          opacity:     0.75,
          lineHeight:  1.55,
          marginBottom: '14px',
          fontStyle:   'italic',
        }}>
          {aud.objective}
        </p>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

        {/* Method */}
        <div style={{ marginBottom: '14px' }}>
          <p className="font-mono" style={{
            fontSize: '9px', color: '#ffffff',
            letterSpacing: '0.2em', fontWeight: 700, marginBottom: '8px',
          }}>
            METHOD
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {aud.methods.map(m => (
              <div key={m} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <span className="font-mono" style={{ fontSize: '10px', color: aud.color, opacity: 0.45, flexShrink: 0, marginTop: '1px' }}>›</span>
                <span className="font-mono" style={{ fontSize: '10px', color: '#ffffff', lineHeight: 1.45 }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

        {/* Outcomes */}
        <div style={{ marginTop: 'auto' }}>
          <p className="font-mono" style={{
            fontSize: '9px', color: '#ffffff',
            letterSpacing: '0.2em', fontWeight: 700, marginBottom: '8px',
          }}>
            OUTCOMES
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {aud.outcomes.map(o => (
              <span key={o} className="font-mono" style={{
                fontSize:        '9px',
                color:           hovered ? aud.color : '#ffffff',
                border:          `1px solid ${hovered ? aud.color + '40' : 'rgba(255,255,255,0.07)'}`,
                backgroundColor: hovered ? aud.color + '0A' : 'transparent',
                padding:         '2px 7px',
                letterSpacing:   '0.08em',
                transition:      'color 0.25s, border-color 0.25s, background-color 0.25s',
              }}>
                {o}
              </span>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────
export function Teaching() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef   = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: '-60px' })
  const statsInView = useInView(statsRef,  { once: true, margin: '-40px' })

  return (
    <section
      id="teaching"
      ref={sectionRef}
      style={{
        position:      'relative',
        width:         '100%',
        backgroundColor: '#040404',
        paddingTop:    'clamp(40px,4.5vw,72px)',
        paddingBottom: 'clamp(40px,4.5vw,72px)',
        paddingLeft:   'clamp(48px,10vw,160px)',
        paddingRight:  'clamp(48px,10vw,160px)',
        overflow:      'hidden',
      }}
    >
      <NotebookLines />

      {/* ── Classroom photo — right side (desktop only) ──── */}
      <div
        aria-hidden
        className="hidden lg:block"
        style={{
          position:      'absolute',
          top:           0,
          left:          '50%',
          right:         0,
          height:        'clamp(560px,72%,820px)',
          zIndex:        0,
          pointerEvents: 'none',
        }}
      >
        {/* Photo */}
        <div style={{
          position:           'absolute',
          inset:              0,
          backgroundImage:    'url(/samih-class.webp)',
          backgroundSize:     'cover',
          backgroundPosition: 'center 20%',
          filter:             'grayscale(1) brightness(0.3) contrast(1.05)',
        }} />

        {/* Blueprint grid overlay */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundImage: [
            'linear-gradient(rgba(74,158,255,0.06) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(74,158,255,0.06) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '34px 34px',
        }} />

        {/* Left fade — blends into section bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #040404 0%, #040404 4%, transparent 40%)',
        }} />
        {/* Top fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, #040404 0%, transparent 22%)',
        }} />
        {/* Bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #040404 0%, transparent 26%)',
        }} />
        {/* Blue atmospheric tint */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom left, rgba(74,158,255,0.06) 0%, transparent 55%)',
        }} />

        {/* ── Corner frame — top right ────────────────────── */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', width: '36px', height: '36px' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '1px', backgroundColor: '#4A9EFF', opacity: 0.55 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '1px',   height: '100%', backgroundColor: '#4A9EFF', opacity: 0.55 }} />
        </div>
        {/* Corner frame — top left (subtle) */}
        <div style={{ position: 'absolute', top: '24px', left: 0, width: '28px', height: '28px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', backgroundColor: '#4A9EFF', opacity: 0.2 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '1px',   height: '100%', backgroundColor: '#4A9EFF', opacity: 0.2 }} />
        </div>
        {/* Corner frame — bottom right (subtle) */}
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '28px', height: '28px' }}>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: '1px', backgroundColor: '#4A9EFF', opacity: 0.25 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '1px',   height: '100%', backgroundColor: '#4A9EFF', opacity: 0.25 }} />
        </div>
      </div>

      {/* Watermark */}
      <div
        aria-hidden
        className="font-mono font-bold hidden lg:block"
        style={{
          position:    'absolute',
          right:       '0',
          bottom:      'clamp(80px,9vw,144px)',
          fontSize:    'clamp(160px,18vw,260px)',
          lineHeight:  1,
          color:       'rgba(74,158,255,0.02)',
          letterSpacing: '-0.05em',
          userSelect:  'none',
          pointerEvents: 'none',
          zIndex:      0,
        }}
      >
        05
      </div>

      {/* ── Section strip ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, marginBottom: '64px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: '#4A9EFF', letterSpacing: '0.25em' }}>//</span>
          <span className="font-mono" style={{ fontSize: '11px', color: '#4A9EFF', letterSpacing: '0.25em', fontWeight: 500, textTransform: 'uppercase' }}>
            05 · TEACH
          </span>
          <span className="font-mono" style={{
            fontSize:        '9px',
            color:           '#4A9EFF',
            border:          '1px solid rgba(74,158,255,0.25)',
            backgroundColor: 'rgba(74,158,255,0.06)',
            padding:         '2px 8px',
            letterSpacing:   '0.15em',
            fontWeight:      600,
          }}>
            ACTIVE
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        </div>
      </motion.div>

      {/* ── Title ──────────────────────────────────────── */}
      <motion.h2
        className="font-mono font-bold"
        style={{
          fontSize:     'clamp(34px,3.8vw,56px)',
          letterSpacing: '-0.025em',
          lineHeight:   1.0,
          marginBottom: '24px',
          position:     'relative',
          zIndex:       1,
        }}
        initial={{ opacity: 0, x: -28 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
      >
        <span style={{ color: '#E8E8E0' }}>DIGITAL & AI</span><br />
        <span style={{ color: '#4A9EFF' }}>INSTRUCTOR</span>
      </motion.h2>

      {/* ── Intro text ─────────────────────────────────── */}
      <motion.p
        className="font-sans"
        style={{
          fontSize:     '14px',
          color:        '#ffffff',
          lineHeight:   1.8,
          maxWidth:     '580px',
          marginBottom: '16px',
          position:     'relative',
          zIndex:       1,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.55, ease: EASE }}
      >
        I design job-ready digital, AI and entrepreneurship programs built around real-world projects, practical execution and measurable skill growth.
      </motion.p>

      <motion.p
        className="font-sans"
        style={{
          fontSize:     '13px',
          color:        '#ffffff',
          lineHeight:   1.75,
          maxWidth:     '560px',
          marginBottom: '56px',
          position:     'relative',
          zIndex:       1,
        }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.28, duration: 0.5 }}
      >
        I don't just teach tools. I create practical learning systems adapted to each audience — helping children, students, entrepreneurs and companies turn digital and AI knowledge into real-world execution.
      </motion.p>

      <motion.a
        href="/training-expertise"
        className="font-mono"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.34, duration: 0.5 }}
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          gap:             '10px',
          marginBottom:    '56px',
          fontSize:        '11px',
          letterSpacing:   '0.18em',
          color:           '#4A9EFF',
          border:          '1px solid rgba(74,158,255,0.35)',
          backgroundColor: 'rgba(74,158,255,0.07)',
          padding:         '10px 20px',
          textDecoration:  'none',
          position:        'relative',
          zIndex:          1,
          transition:      'background-color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(74,158,255,0.14)'
          ;(e.currentTarget as HTMLElement).style.borderColor    = 'rgba(74,158,255,0.6)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(74,158,255,0.07)'
          ;(e.currentTarget as HTMLElement).style.borderColor    = 'rgba(74,158,255,0.35)'
        }}
      >
        DISCOVER MY EXPERTISE AS A TRAINER
        <span style={{ fontSize: '13px' }}>→</span>
      </motion.a>

      {/* ── Stats strip ────────────────────────────────── */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.32, duration: 0.6, ease: EASE }}
        style={{
          position:        'relative',
          zIndex:          1,
          border:          '1px solid rgba(255,255,255,0.07)',
          backgroundColor: '#0A0A0A',
          marginBottom:    '56px',
          overflow:        'hidden',
        }}
      >
        {/* Blue accent top line */}
        <motion.div
          style={{
            position:        'absolute',
            top: 0, left: 0, right: 0,
            height:          '2px',
            backgroundColor: '#4A9EFF',
            opacity:         0.35,
          }}
          initial={{ scaleX: 0, originX: '0%' }}
          animate={statsInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.9, ease: EASE }}
        />

        {/* 4-col grid: 2×2 on mobile, 4×1 on desktop */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4"
          style={{ gap: '0' }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           '6px',
              padding:       'clamp(22px,3vw,36px) clamp(22px,3vw,36px)',
              borderRight:   i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div className="font-mono font-bold" style={{
                fontSize:      'clamp(32px,4.5vw,56px)',
                color:         '#E8E8E0',
                letterSpacing: '-0.04em',
                lineHeight:    1,
              }}>
                <CountUp to={stat.value} duration={stat.duration} delay={stat.delay} suffix={stat.suffix} start={statsInView} />
              </div>
              <span className="font-mono" style={{
                fontSize:      '10px',
                color:         '#ffffff',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Methodology flow ───────────────────────────── */}
      <motion.div
        style={{ position: 'relative', zIndex: 1, marginBottom: '56px' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.42, duration: 0.5 }}
      >
        <p className="font-mono" style={{
          fontSize: '10px', color: '#ffffff', letterSpacing: '0.2em',
          fontWeight: 700, marginBottom: '20px',
        }}>
          LEARNING METHODOLOGY
        </p>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:flex" style={{ alignItems: 'center' }}>
          {METHOD_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.52 + i * 0.1, duration: 0.4, ease: EASE }}
                style={{
                  display:         'flex',
                  flexDirection:   'column',
                  alignItems:      'center',
                  gap:             '5px',
                  padding:         '12px 24px',
                  border:          `1px solid ${step.color}20`,
                  backgroundColor: `${step.color}06`,
                }}
              >
                <span className="font-mono" style={{ fontSize: '9px', color: step.color, opacity: 0.45, letterSpacing: '0.15em' }}>
                  [{step.id}]
                </span>
                <span className="font-mono" style={{
                  fontSize: '11px', color: step.color,
                  fontWeight: 700, letterSpacing: '0.12em',
                }}>
                  {step.label}
                </span>
              </motion.div>

              {i < METHOD_STEPS.length - 1 && (
                <div style={{ position: 'relative', width: '36px', height: '1px', flexShrink: 0 }}>
                  <motion.div
                    style={{ width: '100%', height: '1px', backgroundColor: METHOD_STEPS[i + 1].color, opacity: 0.2 }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: EASE }}
                  />
                  <div style={{
                    position:    'absolute',
                    right:       0,
                    top:         '50%',
                    transform:   'translateY(-50%)',
                    width:       0,
                    height:      0,
                    borderTop:   '3px solid transparent',
                    borderBottom: '3px solid transparent',
                    borderLeft:  `5px solid ${METHOD_STEPS[i + 1].color}`,
                    opacity:     0.25,
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: wrapped tags */}
        <div className="flex flex-wrap lg:hidden" style={{ gap: '8px', alignItems: 'center' }}>
          {METHOD_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-mono" style={{
                fontSize: '11px', color: step.color,
                fontWeight: 700, letterSpacing: '0.1em',
              }}>
                {step.label}
              </span>
              {i < METHOD_STEPS.length - 1 && (
                <span className="font-mono" style={{ fontSize: '11px', color: '#ffffff' }}>→</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Audience cards ─────────────────────────────── */}
      <motion.div
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <p className="font-mono" style={{
          fontSize: '10px', color: '#ffffff',
          letterSpacing: '0.2em', fontWeight: 700, marginBottom: '16px',
        }}>
          TARGET AUDIENCES
        </p>

        <div
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{ gap: '1px', backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          {AUDIENCES.map((aud, i) => (
            <AudienceCard key={aud.id} aud={aud} index={i} />
          ))}
        </div>
      </motion.div>

    </section>
  )
}
