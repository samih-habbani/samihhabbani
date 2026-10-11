'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, Building2 } from 'lucide-react'
import { fieldStyle } from './ui'

export interface ProviderLite {
  id: number
  name: string | null
  firstName: string | null
  company: string | null
  city: string | null
  country: string | null
  type: string | null
}

const isPlaceholder = (v?: string | null) => !v || /^-+$/.test(v.trim())
const real = (v?: string | null) => (isPlaceholder(v) ? null : v!.trim())

export function providerLabel(p: ProviderLite) {
  const person = [real(p.firstName), real(p.name)].filter(Boolean).join(' ')
  return real(p.company) || person || `Provider #${p.id}`
}
const providerSub = (p: ProviderLite) =>
  [real(p.company) && [real(p.firstName), real(p.name)].filter(Boolean).join(' '), real(p.type), real(p.city), real(p.country)].filter(Boolean).join(' · ')

// Async search over the shared provider table (type to search, pick one).
export default function ProviderPicker({ value, onChange }: { value: ProviderLite | null; onChange: (p: ProviderLite | null) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProviderLite[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/providers?limit=12&search=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        if (res.ok) setResults((await res.json()).providers)
      } catch { /* aborted */ } finally { setLoading(false) }
    }, 250)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query, open])

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (value) {
    return (
      <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Building2 size={15} color="#d4b472" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {providerLabel(value)} <span style={{ color: '#6b6b60', fontSize: 11.5 }}>{providerSub(value)}</span>
          </span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Change provider" style={{ background: 'none', border: 'none', color: '#8f8f7f', cursor: 'pointer', display: 'flex' }}>
          <X size={15} />
        </button>
      </div>
    )
  }

  return (
    <div ref={box} style={{ position: 'relative' }}>
      <Search size={15} color="#6b6b60" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Search a provider (company, name, email…)"
        style={{ ...fieldStyle, paddingLeft: 38 }}
      />
      {open && (
        <div style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 6px)', left: 0, right: 0, maxHeight: 280, overflowY: 'auto', background: '#0b0f17', border: '1px solid rgba(184,151,74,0.3)', borderRadius: 8, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
          {loading && results.length === 0 ? (
            <div style={{ padding: '12px 14px', fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f' }}>Searching…</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '12px 14px', fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f' }}>No provider found — add it from the Providers page first.</div>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onChange(p); setOpen(false); setQuery('') }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(184,151,74,0.08)', padding: '10px 14px', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,151,74,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd' }}>{providerLabel(p)}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f' }}>{providerSub(p) || '—'}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
