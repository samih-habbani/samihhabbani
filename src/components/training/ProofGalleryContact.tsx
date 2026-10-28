'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { PROOF_LINKS, GALLERY_PHOTOS, LOCATION } from '@/data/training'
import { IconShield, IconGraduation, IconPlay, IconPin } from './Icons'
import { VideoWall } from './VideoWall'
import { PlatformShowcase } from './PlatformShowcase'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function ProofGalleryContact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: '-60px' })
  const videoRef    = useRef<HTMLDivElement>(null)
  const videoInView = useInView(videoRef, { once: true, margin: '200px' })

  return (
    <>
      {/* ── Proof ─────────────────────────────────────────── */}
      <section
        id="proof"
        ref={sectionRef}
        className="relative w-full"
        style={{
          paddingTop:    'clamp(48px,6vw,88px)',
          paddingBottom: 'clamp(48px,6vw,88px)',
          paddingLeft:   'clamp(24px,10vw,160px)',
          paddingRight:  'clamp(24px,10vw,160px)',
          scrollMarginTop: '80px',
          backgroundColor: '#0A0A0A',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
          style={{ marginBottom: '24px' }}
        >
          <IconShield size={16} color="#00FF94" />
          <span className="font-mono text-xs font-medium tracking-[0.25em] uppercase" style={{ color: '#00FF94' }}>
            05 · VISIBLE PROOF
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(0,255,148,0.3)' }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.05, duration: 0.6, ease: EASE }}
          className="font-mono font-bold"
          style={{ fontSize: 'clamp(32px,4.5vw,64px)', lineHeight: 1.0, letterSpacing: '-0.03em', color: '#E8E8E0', marginBottom: '40px' }}
        >
          DON&apos;T TAKE MY WORD.
          <br />
          <span style={{ color: '#00FF94' }}>SEE IT LIVE.</span>
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Platform showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
          >
            <PlatformShowcase />
            <div className="flex items-center justify-between" style={{ marginTop: '14px' }}>
              <div>
                <p className="font-mono font-semibold" style={{ fontSize: '13px', color: '#00FF94', marginBottom: '4px' }}>Académie WS — My e-Learning Platform</p>
                <p className="font-sans text-[11px]" style={{ color: '#ffffff', opacity: 0.55, lineHeight: 1.5 }}>Founded and built 2022–2025. A real, custom LMS — not a template.</p>
              </div>
              <a href={PROOF_LINKS.elearningPlatform.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-bold flex-shrink-0" style={{ color: '#00FF94', letterSpacing: '0.1em', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                VISIT ↗
              </a>
            </div>
          </motion.div>

          {/* Video wall */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.18, duration: 0.55, ease: EASE }}
          >
            <VideoWall />
            <div className="flex items-center justify-between" style={{ marginTop: '14px' }}>
              <div>
                <p className="font-mono font-semibold" style={{ fontSize: '13px', color: '#00D4FF', marginBottom: '4px' }}>Discover my YouTube Channel</p>
                <p className="font-sans text-[11px]" style={{ color: '#ffffff', opacity: 0.55, lineHeight: 1.5 }}>1,000+ educational videos across programming and digital marketing.</p>
              </div>
              <a href={PROOF_LINKS.youtube.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-bold flex-shrink-0" style={{ color: '#00D4FF', letterSpacing: '0.1em', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                VISIT ↗
              </a>
            </div>
          </motion.div>
        </div>

        {/* Gallery */}
        <p className="font-mono text-[10px] font-semibold" style={{ color: '#ffffff', letterSpacing: '0.18em', marginBottom: '16px' }}>
          FROM THE CLASSROOM
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {GALLERY_PHOTOS.map(photo => (
            <div key={photo.src} style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${photo.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 40%)' }} />
              <p className="font-mono text-[10px]" style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', color: '#ffffff', letterSpacing: '0.05em' }}>
                {photo.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────── */}
      <section
        id="contact"
        className="relative w-full"
        style={{
          paddingTop:    'clamp(56px,7vw,100px)',
          paddingBottom: 'clamp(56px,7vw,100px)',
          paddingLeft:   'clamp(24px,10vw,160px)',
          paddingRight:  'clamp(24px,10vw,160px)',
          scrollMarginTop: '80px',
          backgroundColor: '#050505',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 'clamp(32px,4vw,64px)' }}>
          {/* Left — text content */}
          <div style={{ flex: '1.15 1 380px', minWidth: '320px' }}>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE }}
              className="font-mono"
              style={{ fontSize: 'clamp(26px,3.4vw,44px)', color: '#E8E8E0', letterSpacing: '-0.02em', marginBottom: '18px' }}
            >
              <span style={{ color: '#00FF94' }}>{'>'}</span> Looking for an AI or development trainer?
            </motion.p>
            <p className="font-sans" style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7, marginBottom: '40px', lineHeight: 1.75 }}>
              Available for corporate training missions, academy partnerships and recurring programs — onsite or
              fully remote. Let&apos;s talk about your team&apos;s needs.
            </p>

            <div className="flex flex-wrap gap-4" style={{ marginBottom: '40px' }}>
              <a
                href={PROOF_LINKS.trainingCatalogue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] font-bold tracking-[0.15em] border"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#E8E8E0', padding: '14px 24px' }}
              >
                DOWNLOAD FULL CATALOGUE
              </a>
              <a
                href="mailto:samihhabbani@gmail.com"
                className="font-mono text-[11px] font-bold tracking-[0.15em] border"
                style={{ borderColor: 'rgba(0,212,255,0.4)', color: '#00D4FF', padding: '14px 24px' }}
              >
                EMAIL ME →
              </a>
              <a
                href={PROOF_LINKS.elearningPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] font-bold tracking-[0.15em] border"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', borderColor: 'rgba(0,255,148,0.4)', color: '#00FF94', padding: '14px 24px' }}
              >
                <IconGraduation size={14} color="#00FF94" />
                ACCESS E-LEARNING PLATFORM ↗
              </a>
              <a
                href={PROOF_LINKS.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] font-bold tracking-[0.15em] border"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', borderColor: 'rgba(255,255,255,0.2)', color: '#E8E8E0', padding: '14px 24px' }}
              >
                <IconPlay size={14} color="#E8E8E0" />
                VISIT YOUTUBE CHANNEL ↗
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <a href="mailto:samihhabbani@gmail.com" className="font-mono text-[12px]" style={{ color: '#ffffff', opacity: 0.7, textDecoration: 'none' }}>
                samihhabbani@gmail.com
              </a>
              <a href="tel:+971505548034" className="font-mono text-[12px]" style={{ color: '#ffffff', opacity: 0.7, textDecoration: 'none' }}>
                +971 50 554 8034
              </a>
              <a href={PROOF_LINKS.linkedin.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px]" style={{ color: '#ffffff', opacity: 0.7, textDecoration: 'none' }}>
                linkedin.com/in/samih-habbani ↗
              </a>
            </div>

            <div className="flex items-center gap-2" style={{ marginTop: '32px', marginBottom: '10px' }}>
              <IconPin size={14} color="#00FF94" />
              <p className="font-mono text-[10px] font-semibold" style={{ color: '#ffffff', letterSpacing: '0.18em', margin: 0 }}>
                AVAILABILITY
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-sans text-[12px]" style={{ color: '#ffffff', opacity: 0.75 }}>{LOCATION.virtual}</span>
              <span className="font-sans text-[12px]" style={{ color: '#ffffff', opacity: 0.75 }}>{LOCATION.pricing}</span>
            </div>
          </div>

          {/* Right — intro video, same treatment as the homepage contact form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
            style={{ flex: '0.85 1 280px', minWidth: '260px', maxWidth: '440px', backgroundColor: '#080808', padding: 'clamp(20px,2.5vw,32px)' }}
          >
            <div
              ref={videoRef}
              style={{
                position: 'relative', width: '100%', aspectRatio: '9 / 16',
                border: '1px solid rgba(0,255,148,0.15)', backgroundColor: '#000000', overflow: 'hidden',
              }}
            >
              {videoInView ? (
                <video
                  src="/samih-intro.mp4"
                  poster="/samih-intro-poster.jpg"
                  controls
                  autoPlay
                  muted
                  loop
                  preload="auto"
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'contrast(1.08) saturate(1.2) hue-rotate(-6deg) brightness(0.95)' }}
                />
              ) : (
                // Poster only until the video scrolls near-into-view — avoids downloading the full clip on initial page load
                <img
                  src="/samih-intro-poster.jpg"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'contrast(1.08) saturate(1.2) hue-rotate(-6deg) brightness(0.95)' }}
                />
              )}

              {/* Scanlines */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,148,0.06) 0px, rgba(0,255,148,0.06) 1px, transparent 1px, transparent 3px)', mixBlendMode: 'overlay' }} />
              {/* Vignette */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 50px 14px rgba(0,0,0,0.55)' }} />
              {/* Corner brackets */}
              {[
                { top: '8px', left: '8px', borderWidth: '1px 0 0 1px' },
                { top: '8px', right: '8px', borderWidth: '1px 1px 0 0' },
                { bottom: '8px', left: '8px', borderWidth: '0 0 1px 1px' },
                { bottom: '8px', right: '8px', borderWidth: '0 1px 1px 0' },
              ].map((pos, i) => (
                <div key={i} style={{ position: 'absolute', width: '14px', height: '14px', borderColor: 'rgba(0,255,148,0.6)', borderStyle: 'solid', pointerEvents: 'none', ...pos }} />
              ))}
              {/* REC badge */}
              <div style={{ position: 'absolute', top: '14px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none' }}>
                <motion.span
                  style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FF5C5C' }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
                />
                <span className="font-mono" style={{ fontSize: '8px', color: '#ffffff', letterSpacing: '0.2em' }}>REC</span>
              </div>
              {/* Feed label */}
              <div style={{ position: 'absolute', bottom: '14px', left: '20px', pointerEvents: 'none' }}>
                <span className="font-mono" style={{ fontSize: '8px', color: '#00FF94', letterSpacing: '0.15em', opacity: 0.85 }}>FEED::SAMIH_HABBANI</span>
              </div>
            </div>

            {/* Filming credit */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <a
                href="https://adatech.ae/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono"
                style={{ fontSize: '9px', color: '#ffffff', letterSpacing: '0.1em', textDecoration: 'none', opacity: 0.5, transition: 'color 0.2s, opacity 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#00FF94'; e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.opacity = '0.5' }}
              >
                Filmed at ADATECH ↗
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
