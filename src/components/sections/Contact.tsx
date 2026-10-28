'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import emailjs from '@emailjs/browser'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type Status = 'idle' | 'sending' | 'sent'

// ── Terminal input ─────────────────────────────────────────
function TerminalInput({
  prefix,
  type      = 'text',
  placeholder,
  value,
  onChange,
  multiline = false,
  disabled  = false,
}: {
  prefix:      string
  type?:       string
  placeholder: string
  value:       string
  onChange:    (v: string) => void
  multiline?:  boolean
  disabled?:   boolean
}) {
  const [focused, setFocused] = useState(false)

  const sharedStyle: React.CSSProperties = {
    background:    'transparent',
    border:        'none',
    outline:       'none',
    color:         '#E8E8E0',
    fontFamily:    'var(--font-mono)',
    fontSize:      '13px',
    letterSpacing: '0.02em',
    width:         '100%',
    resize:        'none' as const,
    padding:       '0',
    caretColor:    '#00FF94',
  }

  return (
    <div
      style={{
        border:          `1px solid ${focused ? 'rgba(0,255,148,0.35)' : 'rgba(255,255,255,0.07)'}`,
        backgroundColor: focused ? 'rgba(0,255,148,0.02)' : '#0A0A0A',
        boxShadow:       focused ? '0 0 0 3px rgba(0,255,148,0.04)' : 'none',
        padding:         '14px 16px',
        display:         'flex',
        alignItems:      multiline ? 'flex-start' : 'center',
        gap:             '12px',
        transition:      'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <span
        className="font-mono flex-shrink-0"
        style={{
          fontSize:      '11px',
          color:         focused ? '#00FF94' : '#ffffff',
          letterSpacing: '0.1em',
          transition:    'color 0.2s',
          paddingTop:    multiline ? '2px' : '0',
        }}
      >
        {prefix}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...sharedStyle, lineHeight: 1.7 }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={sharedStyle}
        />
      )}
      {!multiline && focused && (
        <motion.span
          style={{ width: '1px', height: '14px', backgroundColor: '#00FF94', flexShrink: 0 }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      )}
    </div>
  )
}

// ── Main section ───────────────────────────────────────────
export function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: '-60px' })
  const videoRef    = useRef<HTMLDivElement>(null)
  const videoInView = useInView(videoRef, { once: true, margin: '200px' })

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message || status !== 'idle') return
    setStatus('sending')
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: name, from_email: email, message },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      )
      setStatus('sent')
    } catch {
      setStatus('idle')
      alert('Something went wrong. Please try again or email me directly.')
    }
  }

  const disabled = status !== 'idle'

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full py-36 overflow-hidden"
      style={{
        paddingTop:    'clamp(40px,4.5vw,72px)',
        overflow:      'hidden',
      }}
    >
      <div style={{ paddingLeft: 'clamp(48px,10vw,160px)', paddingRight: 'clamp(48px,10vw,160px)' }}>

        {/* ── Section header ───────────────────────────── */}
        <motion.div
          className="flex items-center gap-3"
          style={{ marginBottom: '64px' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-xs" style={{ color: '#00FF94', letterSpacing: '0.25em' }}>//</span>
          <span className="font-mono text-xs font-medium tracking-[0.25em] uppercase" style={{ color: '#00FF94' }}>
            11 · CONTACT
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <span
            className="font-mono text-[9px] px-3 py-1 tracking-[0.2em]"
            style={{ color: '#00FF94', border: '1px solid rgba(0,255,148,0.2)', backgroundColor: 'rgba(0,255,148,0.06)' }}
          >
            AVAILABLE
          </span>
        </motion.div>

        {/* ── Headline ─────────────────────────────────── */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
        >
          <p
            className="font-mono"
            style={{ fontSize: 'clamp(22px,3vw,38px)', color: '#E8E8E0', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '16px' }}
          >
            <span style={{ color: '#00FF94' }}>{'>'}</span> Initiate a connection
            <motion.span
              style={{ color: '#00FF94' }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
            >
              _
            </motion.span>
          </p>
          <p
            className="font-sans"
            style={{ fontSize: 'clamp(14px,1.4vw,16px)', color: '#ffffff', lineHeight: 1.6, maxWidth: '480px' }}
          >
            You have a project, a training need, an idea.
            <br />
            Let's build it together.
          </p>
        </motion.div>

        {/* ── Two-col layout ────────────────────────────── */}
        <div
          style={{
            display:      'flex',
            alignItems:   'stretch',
            gap:          '1px',
            background:   'rgba(255,255,255,0.04)',
            marginBottom: '0',
          }}
          className="flex-col-on-mobile"
        >
          {/* ── Left col: form + info ───────────────────── */}
          <div
            style={{
              flex:          '1.15 1 0%',
              display:       'flex',
              flexDirection: 'column',
              gap:           '1px',
            }}
          >
          {/* ── Form ─────────────────────────────── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.55, ease: EASE }}
            style={{
              backgroundColor: '#0A0A0A',
              padding:         'clamp(28px,4vw,48px)',
              display:         'flex',
              flexDirection:   'column',
              gap:             '12px',
            }}
          >
            <TerminalInput
              prefix="$ IDENT:"
              placeholder="your name"
              value={name}
              onChange={setName}
              disabled={disabled}
            />
            <TerminalInput
              prefix="$ ADDR: "
              type="email"
              placeholder="your email"
              value={email}
              onChange={setEmail}
              disabled={disabled}
            />
            <TerminalInput
              prefix="$ MSG:  "
              placeholder="describe your project, idea or request…"
              value={message}
              onChange={setMessage}
              multiline
              disabled={disabled}
            />

            {/* Submit */}
            <div style={{ marginTop: '8px' }}>
              <motion.button
                type="submit"
                disabled={disabled || !name || !email || !message}
                whileHover={status === 'idle' ? { scale: 1.01 } : {}}
                whileTap={status === 'idle' ? { scale: 0.99 } : {}}
                style={{
                  backgroundColor: status === 'sent' ? 'rgba(0,255,148,0.12)' : status === 'sending' ? 'transparent' : 'transparent',
                  border:          `1px solid ${status === 'sent' ? 'rgba(0,255,148,0.5)' : 'rgba(0,255,148,0.3)'}`,
                  color:           status === 'sent' ? '#00FF94' : '#00FF94',
                  fontFamily:      'var(--font-mono)',
                  fontSize:        '11px',
                  letterSpacing:   '0.2em',
                  padding:         '14px 32px',
                  cursor:          disabled || !name || !email || !message ? 'not-allowed' : 'pointer',
                  opacity:         !name || !email || !message ? 0.4 : 1,
                  transition:      'background-color 0.2s, border-color 0.2s, opacity 0.2s',
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '10px',
                }}
              >
                {status === 'idle' && '[ SEND_REQUEST ]'}
                {status === 'sending' && (
                  <>
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    >
                      SENDING
                    </motion.span>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ display: 'inline-block', fontSize: '12px' }}
                    >
                      ◌
                    </motion.span>
                  </>
                )}
                {status === 'sent' && '[ REQUEST_SENT ✓ ]'}
              </motion.button>

              {status === 'sent' && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono"
                  style={{ fontSize: '10px', color: '#00FF94', letterSpacing: '0.15em', marginTop: '10px', opacity: 0.7 }}
                >
                  {'>'} Message received. Response within 24h.
                </motion.p>
              )}
            </div>
          </motion.form>

          {/* ── Info panel ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.55, ease: EASE }}
            style={{
              backgroundColor: '#080808',
              padding:         'clamp(28px,4vw,48px)',
              display:         'flex',
              flexDirection:   'column',
              gap:             '24px',
            }}
          >
            {/* Email */}
            <div>
              <span className="font-mono" style={{ fontSize: '9px', color: '#ffffff', letterSpacing: '0.2em', display: 'block', marginBottom: '8px' }}>
                EMAIL
              </span>
              <a
                href="mailto:samihhabbani@gmail.com"
                className="font-mono"
                style={{ fontSize: '12px', color: '#C8C8C0', letterSpacing: '0.04em', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00FF94')}
                onMouseLeave={e => (e.currentTarget.style.color = '#C8C8C0')}
              >
                samihhabbani@gmail.com
              </a>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

            {/* Links */}
            <div>
              <span className="font-mono" style={{ fontSize: '9px', color: '#ffffff', letterSpacing: '0.2em', display: 'block', marginBottom: '12px' }}>
                LINKS
              </span>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/samih-habbani' },
                  { label: 'GitHub',   href: 'https://github.com/samihhabbani' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono"
                    style={{
                      fontSize:      '11px',
                      color:         '#ffffff',
                      letterSpacing: '0.1em',
                      textDecoration:'none',
                      display:       'flex',
                      alignItems:    'center',
                      gap:           '8px',
                      transition:    'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E8E8E0')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
                  >
                    <span style={{ color: '#ffffff', fontSize: '10px' }}>↗</span>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
          </div>

          {/* ── Video col ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.55, ease: EASE }}
            style={{
              flex:            '0.85 1 0%',
              backgroundColor: '#080808',
              position:        'relative',
            }}
          >
            {/* Video feed — absolutely positioned so it inherits the stretched
                column height instead of dictating its own via aspect-ratio */}
            <div
              ref={videoRef}
              style={{
                position:        'absolute',
                top:             'clamp(28px,4vw,48px)',
                left:            'clamp(28px,4vw,48px)',
                right:           'clamp(28px,4vw,48px)',
                bottom:          'calc(clamp(28px,4vw,48px) + 22px)',
                border:          '1px solid rgba(0,255,148,0.15)',
                backgroundColor: '#000000',
                overflow:        'hidden',
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
                  style={{
                    width:    '100%',
                    height:   '100%',
                    objectFit:'cover',
                    display:  'block',
                    filter:   'contrast(1.08) saturate(1.2) hue-rotate(-6deg) brightness(0.95)',
                  }}
                />
              ) : (
                // Poster only until the video scrolls near-into-view — avoids downloading the full clip on initial page load
                <img
                  src="/samih-intro-poster.jpg"
                  alt=""
                  style={{
                    width:    '100%',
                    height:   '100%',
                    objectFit:'cover',
                    display:  'block',
                    filter:   'contrast(1.08) saturate(1.2) hue-rotate(-6deg) brightness(0.95)',
                  }}
                />
              )}

              {/* Scanlines */}
              <div
                style={{
                  position:        'absolute',
                  inset:           0,
                  pointerEvents:   'none',
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,148,0.06) 0px, rgba(0,255,148,0.06) 1px, transparent 1px, transparent 3px)',
                  mixBlendMode:    'overlay',
                }}
              />

              {/* Vignette */}
              <div
                style={{
                  position:      'absolute',
                  inset:         0,
                  pointerEvents: 'none',
                  boxShadow:     'inset 0 0 50px 14px rgba(0,0,0,0.55)',
                }}
              />

              {/* Corner brackets */}
              {[
                { top: '8px', left: '8px', borderWidth: '1px 0 0 1px' },
                { top: '8px', right: '8px', borderWidth: '1px 1px 0 0' },
                { bottom: '8px', left: '8px', borderWidth: '0 0 1px 1px' },
                { bottom: '8px', right: '8px', borderWidth: '0 1px 1px 0' },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position:      'absolute',
                    width:         '14px',
                    height:        '14px',
                    borderColor:   'rgba(0,255,148,0.6)',
                    borderStyle:   'solid',
                    pointerEvents: 'none',
                    ...pos,
                  }}
                />
              ))}

              {/* REC badge */}
              <div
                style={{
                  position:      'absolute',
                  top:           '14px',
                  left:          '20px',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '6px',
                  pointerEvents: 'none',
                }}
              >
                <motion.span
                  style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FF5C5C' }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
                />
                <span className="font-mono" style={{ fontSize: '8px', color: '#ffffff', letterSpacing: '0.2em' }}>
                  REC
                </span>
              </div>

              {/* Feed label */}
              <div
                style={{
                  position:      'absolute',
                  bottom:        '14px',
                  left:          '20px',
                  pointerEvents: 'none',
                }}
              >
                <span className="font-mono" style={{ fontSize: '8px', color: '#00FF94', letterSpacing: '0.15em', opacity: 0.85 }}>
                  FEED::SAMIH_HABBANI
                </span>
              </div>
            </div>

            {/* Filming credit */}
            <div
              style={{
                position:  'absolute',
                left:      'clamp(28px,4vw,48px)',
                right:     'clamp(28px,4vw,48px)',
                bottom:    'clamp(8px,1.2vw,14px)',
                textAlign: 'center',
              }}
            >
              <a
                href="https://adatech.ae/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono"
                style={{
                  fontSize:      '9px',
                  color:         '#ffffff',
                  letterSpacing: '0.1em',
                  textDecoration:'none',
                  opacity:       0.5,
                  transition:    'color 0.2s, opacity 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#00FF94'; e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.opacity = '0.5' }}
              >
                Filmed at ADATECH ↗
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{
          marginTop:    '80px',
          borderTop:    '1px solid rgba(255,255,255,0.05)',
          padding:      'clamp(20px,3vw,32px) clamp(48px,10vw,160px)',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'space-between',
          gap:          '16px',
          flexWrap:     'wrap',
        }}
      >
        <span className="font-mono" style={{ fontSize: '10px', color: '#ffffff', letterSpacing: '0.2em' }}>
          © 2026 SAMIH HABBANI
        </span>
        <a
          href="/quiz"
          className="font-mono"
          style={{
            fontSize:      '10px',
            color:         '#ffffff',
            letterSpacing: '0.15em',
            textDecoration:'none',
            display:       'flex',
            alignItems:    'center',
            gap:           '6px',
            transition:    'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00FF94')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
        >
          <span style={{ fontSize: '9px' }}>↗</span>
          EXAM QUIZ BUILDER
        </a>
        <span className="font-mono" style={{ fontSize: '10px', color: '#ffffff', letterSpacing: '0.15em' }}>
          BUILT WITH NEXT.JS · FRAMER MOTION
        </span>
      </motion.footer>
    </section>
  )
}
