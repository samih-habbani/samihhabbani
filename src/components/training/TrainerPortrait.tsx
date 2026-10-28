'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ── Portrait panel — same visual treatment as the homepage Hero ──
export function TrainerPortrait({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="hidden lg:block"
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : {}}
      transition={{ delay: 0.3, duration: 1.1, ease: EASE }}
      style={{
        position: 'absolute',
        top:      0,
        right:    0,
        width:    '38%',
        height:   '100%',
        zIndex:   0,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          src="/samih.webp"
          alt="Samih Habbani"
          fill
          priority
          sizes="38vw"
          style={{
            objectFit:      'cover',
            objectPosition: 'center top',
            filter:         'grayscale(100%) contrast(1.1) brightness(0.65)',
          }}
        />
      </div>

      {/* Green chromatic tint */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,255,148,0.06)', mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 2 }} />

      {/* Horizontal scan lines */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 3px)',
        }}
      />

      {/* Left-edge fade — blends photo into background */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
          background: 'linear-gradient(to right, #050505 0%, rgba(5,5,5,0.82) 12%, rgba(5,5,5,0.3) 32%, transparent 58%)',
        }}
      />
      {/* Top-edge fade */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '15%', zIndex: 4, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #0A0A0A 0%, transparent 100%)',
        }}
      />
      {/* Bottom-edge fade */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 4, pointerEvents: 'none',
          background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.7) 40%, transparent 100%)',
        }}
      />

      {/* Animated scan sweep */}
      <motion.div
        style={{
          position: 'absolute', left: 0, right: 0, height: '2px', zIndex: 5, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.25) 50%, transparent 100%)',
        }}
        animate={{ top: ['-2%', '102%'] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'linear', repeatDelay: 3 }}
      />

      {/* TUI corner brackets */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', width: '16px', height: '16px', borderTop: '1px solid rgba(0,212,255,0.35)', borderRight: '1px solid rgba(0,212,255,0.35)', zIndex: 6 }} />
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '16px', height: '16px', borderBottom: '1px solid rgba(0,212,255,0.35)', borderRight: '1px solid rgba(0,212,255,0.35)', zIndex: 6 }} />

      {/* Meta readout */}
      <div style={{ position: 'absolute', bottom: '28px', right: '40px', zIndex: 7, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
        {[
          ['STATUS',   'AVAILABLE'],
          ['ROLE',     'AI-TRAINER'],
        ].map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono uppercase" style={{ fontSize: '8px', letterSpacing: '0.18em', color: key === 'STATUS' ? '#00FF94' : '#ffffff' }}>
              {value}
            </span>
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.15)' }}>──·</span>
            <span className="font-mono uppercase" style={{ fontSize: '8px', color: '#ffffff', letterSpacing: '0.18em', width: '52px', textAlign: 'right' }}>
              {key}
            </span>
          </div>
        ))}
        <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.2em' }}>
            AB-730 · VERIFIED
          </span>
        </div>
      </div>
    </motion.div>
  )
}
