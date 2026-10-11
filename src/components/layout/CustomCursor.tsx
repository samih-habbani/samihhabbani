'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const pathname = usePathname()
  const [visible,  setVisible]  = useState(false)
  const [hovering, setHovering] = useState(false)

  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)

  const x = useSpring(rawX, { stiffness: 400, damping: 30, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 400, damping: 30, mass: 0.4 })

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      setHovering(!!(el.closest('a') || el.closest('button')))
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover',  onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover',  onOver)
    }
  }, [rawX, rawY, visible])

  if (!visible || pathname.startsWith('/admin')) return null

  return (
    <motion.div
      style={{ left: x, top: y }}
      className="fixed z-[99999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      animate={{
        width:           hovering ? 28 : 5,
        height:          hovering ? 28 : 5,
        backgroundColor: hovering ? 'transparent' : '#E8E8E0',
        border:          hovering ? '1px solid #00FF94' : '1px solid transparent',
      }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}
