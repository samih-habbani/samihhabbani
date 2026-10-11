'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { TextField, Field, Notice, Button } from '@/components/admin/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Login failed')
        return
      }
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,151,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28, letterSpacing: '0.08em', color: '#f5eedd' }}>SAMIH HABBANI</div>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10, letterSpacing: '0.28em', color: '#8f8f7f', marginTop: 4 }}>TRAINING ADMIN</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(184,151,74,0.06) 0%, rgba(212,180,114,0.02) 100%)', border: '1px solid rgba(184,151,74,0.15)', borderRadius: 12, padding: 36 }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, margin: '0 auto 20px', background: 'rgba(184,151,74,0.1)', border: '1px solid rgba(184,151,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={17} color="#d4b472" strokeWidth={1.75} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 24, color: '#f5eedd', textAlign: 'center', margin: '0 0 28px' }}>Sign in to continue</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <Field label="Email">
                <TextField type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              </Field>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Field label="Password">
                <TextField type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </Field>
            </div>
            {error && <Notice tone="error">{error}</Notice>}
            <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#6b6b60', textDecoration: 'none' }}>
            <ArrowLeft size={13} strokeWidth={2} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
