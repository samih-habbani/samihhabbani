'use client'

// Backoffice UI primitives — same visual language as the syrama-yachting
// admin (navy + gold, Cormorant headings, Lora body), condensed in one file.
import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const GOLD = '#b8974a'
export const GOLD_LIGHT = '#d4b472'
export const CREAM = '#f5eedd'
export const BG = '#06090f'

// ── Button ────────────────────────────────────────────────────
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const VARIANTS: Record<Variant, { bg: string; hover: string; color: string; border: string }> = {
  primary:   { bg: GOLD, hover: GOLD_LIGHT, color: BG, border: 'transparent' },
  secondary: { bg: 'transparent', hover: 'rgba(184,151,74,0.1)', color: GOLD_LIGHT, border: 'rgba(184,151,74,0.35)' },
  ghost:     { bg: 'transparent', hover: 'rgba(245,238,221,0.06)', color: '#a8a89a', border: 'transparent' },
  danger:    { bg: 'transparent', hover: 'rgba(196,94,94,0.12)', color: '#e08080', border: 'rgba(196,94,94,0.35)' },
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', style, children, disabled, ...rest },
  ref,
) {
  const v = VARIANTS[variant]
  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--font-lora)', fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, letterSpacing: '0.04em',
        color: v.color, background: v.bg, border: `1px solid ${v.border}`, borderRadius: 7,
        padding: size === 'sm' ? '8px 14px' : '11px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'background 0.2s ease', whiteSpace: 'nowrap', ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = v.hover }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = v.bg }}
      {...rest}
    >
      {children}
    </button>
  )
})

// A link styled like a Button (e.g. PDF downloads)
export function ButtonLink({ href, children, variant = 'secondary', size = 'sm', newTab = true }: {
  href: string; children: ReactNode; variant?: Variant; size?: 'sm' | 'md'; newTab?: boolean
}) {
  const v = VARIANTS[variant]
  return (
    <a
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none',
        fontFamily: 'var(--font-lora)', fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, letterSpacing: '0.04em',
        color: v.color, background: v.bg, border: `1px solid ${v.border}`, borderRadius: 7,
        padding: size === 'sm' ? '8px 14px' : '11px 20px', whiteSpace: 'nowrap', transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = v.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = v.bg)}
    >
      {children}
    </a>
  )
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(184,151,74,0.05) 0%, rgba(212,180,114,0.015) 100%)',
        border: '1px solid rgba(184,151,74,0.12)', borderRadius: 10, ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────
export type Tone = 'gold' | 'blue' | 'green' | 'red' | 'neutral'
const TONES: Record<Tone, { bg: string; border: string; text: string }> = {
  gold:    { bg: 'rgba(184,151,74,0.12)',  border: 'rgba(184,151,74,0.3)',  text: GOLD_LIGHT },
  blue:    { bg: 'rgba(124,147,173,0.12)', border: 'rgba(124,147,173,0.3)', text: '#9db3cc' },
  green:   { bg: 'rgba(122,168,116,0.12)', border: 'rgba(122,168,116,0.3)', text: '#8fc088' },
  red:     { bg: 'rgba(196,94,94,0.12)',   border: 'rgba(196,94,94,0.3)',   text: '#e08080' },
  neutral: { bg: 'rgba(143,143,127,0.1)',  border: 'rgba(143,143,127,0.25)', text: '#a8a89a' },
}

export function Badge({ children, tone = 'neutral', dot = false }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  const t = TONES[tone]
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.04em', color: t.text, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 999,
        padding: '4px 12px', whiteSpace: 'nowrap',
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.text, flexShrink: 0 }} />}
      {children}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, tone = 'gold' }: {
  label: string; value: ReactNode; sub?: ReactNode; icon: LucideIcon; tone?: Tone
}) {
  const t = TONES[tone]
  return (
    <Card style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: t.bg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={t.text} strokeWidth={1.75} />
        </div>
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a8a89a' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 38, lineHeight: 1.05, color: CREAM }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', marginTop: 8 }}>{sub}</div>}
      <Icon size={92} strokeWidth={1} style={{ position: 'absolute', right: -18, bottom: -18, color: t.text, opacity: 0.06, pointerEvents: 'none' }} />
    </Card>
  )
}

// ── PageHeader ────────────────────────────────────────────────
export function PageHeader({ title, description, breadcrumbs, action }: {
  title: string; description?: string; breadcrumbs?: { label: string; href?: string }[]; action?: ReactNode
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      {breadcrumbs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {breadcrumbs.map((c, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <ChevronRight size={12} color="#5a5a52" />}
              {c.href ? (
                <Link href={c.href} style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', textDecoration: 'none' }}>{c.label}</Link>
              ) : (
                <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: GOLD_LIGHT }}>{c.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 34, color: CREAM, margin: 0, lineHeight: 1.15 }}>{title}</h1>
          {description && <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '8px 0 0' }}>{description}</p>}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(184,151,74,0.08)', border: '1px solid rgba(184,151,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color="#8f8f7f" strokeWidth={1.5} />
      </div>
      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: CREAM, marginBottom: description ? 6 : 0 }}>{title}</div>
      {description && <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: 0 }}>{description}</p>}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  const nav = (disabled: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6,
    color: disabled ? '#4a4a44' : GOLD_LIGHT, background: 'transparent', border: '1px solid rgba(184,151,74,0.2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
  })
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid rgba(184,151,74,0.1)' }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={nav(currentPage === 1)} aria-label="Previous page"><ChevronLeft size={15} /></button>
      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f' }}>Page {currentPage} / {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={nav(currentPage === totalPages)} aria-label="Next page"><ChevronRight size={15} /></button>
    </div>
  )
}

// ── Form fields ───────────────────────────────────────────────
export const fieldStyle: React.CSSProperties = {
  width: '100%', fontFamily: 'var(--font-lora)', fontSize: 13, color: CREAM, background: 'rgba(6,9,15,0.5)',
  border: '1px solid rgba(184,151,74,0.2)', borderRadius: 7, padding: '10px 14px', outline: 'none', transition: 'border-color 0.2s ease',
}
const focus = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)')
const blur = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.2)')

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8f8f7f', display: 'block', marginBottom: 8 }}>{label}</label>
      {children}
      {hint && <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...fieldStyle, ...props.style }} onFocus={focus} onBlur={blur} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...fieldStyle, minHeight: 80, resize: 'vertical', ...props.style }} onFocus={focus} onBlur={blur} />
}

export function SelectField({ value, onChange, children, disabled }: { value: string; onChange: (v: string) => void; children: ReactNode; disabled?: boolean }) {
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
      {children}
    </select>
  )
}

export function Notice({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const c = tone === 'error'
    ? { bg: 'rgba(196,94,94,0.1)', border: 'rgba(196,94,94,0.35)', color: '#e08080' }
    : { bg: 'rgba(122,168,116,0.1)', border: 'rgba(122,168,116,0.35)', color: '#8fc088' }
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 20 }}>
      {children}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(184,151,74,0.1)' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>{children}</div>
    </div>
  )
}
