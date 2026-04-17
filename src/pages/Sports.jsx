src/utils/motionConfig.ts

export const springs = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  snappy: { tension: 300, friction: 20, mass: 0.8 },
  bouncy: { tension: 400, friction: 18, mass: 0.6 },
  slow:   { tension: 80,  friction: 20, mass: 1.2 },
  stiff:  { tension: 500, friction: 30, mass: 0.5 },
}

export const easings = {
  easeOutExpo:   'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOutBack:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeOutQuart:  'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
  easeOutElastic:'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  linear:        'linear',
  snappy:        'cubic-bezier(0.2, 0, 0, 1)',
}

export const durations = {
  instant:  80,
  fast:     150,
  normal:   300,
  medium:   450,
  slow:     600,
  verySlow: 900,
}

export const stagger = {
  fast:   (i: number) => i * 40,
  normal: (i: number) => i * 70,
  slow:   (i: number) => i * 120,
  wave:   (i: number, total: number) => Math.sin((i / total) * Math.PI) * 200 + i * 50,
}

export const pageTransition = {
  duration: durations.normal,
  easing: easings.easeOutExpo,
  fadeIn: {
    from: { opacity: 0, transform: 'translateY(12px)' },
    to:   { opacity: 1, transform: 'translateY(0px)' },
  },
  fadeOut: {
    from: { opacity: 1, transform: 'translateY(0px)' },
    to:   { opacity: 0, transform: 'translateY(-8px)' },
  },
}

export const skeletonAnimation = {
  duration: '1.6s',
  easing: easings.easeInOutSine,
  gradient: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)',
}

export const toastAnimation = {
  enter: {
    duration: durations.normal,
    easing: easings.easeOutBack,
    from: { opacity: 0, transform: 'translateX(110%) scale(0.9)' },
    to:   { opacity: 1, transform: 'translateX(0%) scale(1)' },
  },
  exit: {
    duration: durations.fast,
    easing: easings.easeInOutSine,
    from: { opacity: 1, transform: 'translateX(0%) scale(1)' },
    to:   { opacity: 0, transform: 'translateX(110%) scale(0.9)' },
  },
}

export const ripple = {
  duration: 550,
  easing: easings.easeOutExpo,
  color: 'rgba(255,255,255,0.25)',
}

export const scrollReveal = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
  variants: {
    fadeUp: {
      hidden:  { opacity: 0, transform: 'translateY(24px)' },
      visible: { opacity: 1, transform: 'translateY(0px)' },
    },
    fadeIn: {
      hidden:  { opacity: 0, transform: 'scale(0.96)' },
      visible: { opacity: 1, transform: 'scale(1)' },
    },
    slideLeft: {
      hidden:  { opacity: 0, transform: 'translateX(-24px)' },
      visible: { opacity: 1, transform: 'translateX(0px)' },
    },
    slideRight: {
      hidden:  { opacity: 0, transform: 'translateX(24px)' },
      visible: { opacity: 1, transform: 'translateX(0px)' },
    },
  },
  duration: durations.medium,
  easing: easings.easeOutExpo,
}

export type SpringConfig  = typeof springs[keyof typeof springs]
export type EasingConfig  = typeof easings[keyof typeof easings]
export type RevealVariant = keyof typeof scrollReveal.variants


src/hooks/useScrollReveal.ts

import { useEffect, useRef, useState } from 'react'
import { scrollReveal } from '../utils/motionConfig'

interface UseScrollRevealOptions {
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight'
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export function useScrollReveal({
  variant = 'fadeUp',
  delay = 0,
  duration = scrollReveal.duration,
  threshold = scrollReveal.threshold,
  once = true,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const v = scrollReveal.variants[variant]
    Object.assign(el.style, v.hidden, { transition: 'none' })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (!el) return
            el.style.transition = `opacity ${duration}ms ${scrollReveal.easing}, transform ${duration}ms ${scrollReveal.easing}`
            Object.assign(el.style, v.visible)
            setVisible(true)
          }, delay)
          if (once) observer.disconnect()
        } else if (!once) {
          Object.assign(el.style, v.hidden)
          setVisible(false)
        }
      },
      { threshold, rootMargin: scrollReveal.rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [variant, delay, duration, threshold, once])

  return { ref, visible }
}


src/hooks/useRipple.ts

import { useCallback, useRef } from 'react'
import { ripple as rippleConfig } from '../utils/motionConfig'

export function useRipple() {
  const containerRef = useRef<HTMLElement>(null)

  const createRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top
    const radius = Math.max(rect.width, rect.height) * 1.4
    const rippleEl = document.createElement('span')

    Object.assign(rippleEl.style, {
      position: 'absolute',
      borderRadius: '50%',
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
      left: `${x - radius}px`,
      top: `${y - radius}px`,
      background: rippleConfig.color,
      transform: 'scale(0)',
      pointerEvents: 'none',
      transition: `transform ${rippleConfig.duration}ms ${rippleConfig.easing}, opacity ${rippleConfig.duration * 0.8}ms ease`,
      opacity: '1',
    })

    container.style.position = 'relative'
    container.style.overflow = 'hidden'
    container.appendChild(rippleEl)

    requestAnimationFrame(() => {
      rippleEl.style.transform = 'scale(1)'
      rippleEl.style.opacity = '0'
    })

    setTimeout(() => {
      if (container.contains(rippleEl)) container.removeChild(rippleEl)
    }, rippleConfig.duration + 100)
  }, [])

  return { ref: containerRef, createRipple }
}


src/hooks/usePageTransition.ts

import { useEffect, useRef } from 'react'
import { pageTransition } from '../utils/motionConfig'

export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { from, to } = pageTransition.fadeIn
    Object.assign(el.style, from, { transition: 'none' })

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `opacity ${pageTransition.duration}ms ${pageTransition.easing}, transform ${pageTransition.duration}ms ${pageTransition.easing}`
        Object.assign(el.style, to)
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return ref
}


src/components/ui/SkeletonLoader.tsx

import React from 'react'
import { skeletonAnimation, durations, easings } from '../../utils/motionConfig'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: number | string
  style?: React.CSSProperties
  animate?: boolean
}

const shimmerKeyframes = `
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
@keyframes skeletonFadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to   { opacity: 1; transform: scale(1); }
}
`

if (typeof document !== 'undefined') {
  const existing = document.getElementById('skeleton-styles')
  if (!existing) {
    const style = document.createElement('style')
    style.id = 'skeleton-styles'
    style.textContent = shimmerKeyframes
    document.head.appendChild(style)
  }
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {}, animate = true }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: skeletonAnimation.gradient,
        backgroundSize: '200% 100%',
        animation: animate
          ? `shimmer ${skeletonAnimation.duration} ${skeletonAnimation.easing} infinite, skeletonFadeIn ${durations.medium}ms ${easings.easeOutExpo} forwards`
          : undefined,
        ...style,
      }}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{
      borderRadius: 20,
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: `skeletonFadeIn ${durations.medium}ms ${easings.easeOutExpo} forwards`,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton width={44} height={44} borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '70%' : '100%'} height={12} style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  )
}

export function SkeletonScorecard() {
  return (
    <div style={{
      borderRadius: 16,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      animation: `skeletonFadeIn ${durations.medium}ms ${easings.easeOutExpo} forwards`,
    }}>
      <Skeleton width={32} height={32} borderRadius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="50%" height={12} />
        <Skeleton width="30%" height={10} />
      </div>
      <Skeleton width={40} height={28} borderRadius={8} />
      <Skeleton width={40} height={28} borderRadius={8} />
    </div>
  )
}


src/components/ui/RippleButton.tsx

import React, { useRef, useCallback } from 'react'
import { ripple as rippleConfig } from '../../utils/motionConfig'

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  rippleColor?: string
  style?: React.CSSProperties
}

export function RippleButton({ children, rippleColor, style = {}, onClick, onMouseDown, onTouchStart, ...props }: RippleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const spawnRipple = useCallback((x: number, y: number) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = x - rect.left
    const cy = y - rect.top
    const radius = Math.max(rect.width, rect.height) * 1.4
    const el = document.createElement('span')
    Object.assign(el.style, {
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
      left: `${cx - radius}px`,
      top: `${cy - radius}px`,
      background: rippleColor || rippleConfig.color,
      transform: 'scale(0)',
      opacity: '1',
      transition: `transform ${rippleConfig.duration}ms ${rippleConfig.easing}, opacity ${Math.round(rippleConfig.duration * 0.7)}ms ease ${Math.round(rippleConfig.duration * 0.3)}ms`,
    })
    btn.appendChild(el)
    requestAnimationFrame(() => {
      el.style.transform = 'scale(1)'
      el.style.opacity = '0'
    })
    setTimeout(() => btn.contains(el) && btn.removeChild(el), rippleConfig.duration + 200)
  }, [rippleColor])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    spawnRipple(e.clientX, e.clientY)
    onMouseDown?.(e)
  }, [spawnRipple, onMouseDown])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    spawnRipple(e.touches[0].clientX, e.touches[0].clientY)
    onTouchStart?.(e)
  }, [spawnRipple, onTouchStart])

  return (
    <button
      ref={btnRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}


src/components/ui/Toast.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toastAnimation, durations } from '../../utils/motionConfig'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  add: (message: string, type?: ToastType, duration?: number) => void
  remove: (id: string) => void
}

let _setState: React.Dispatch<React.SetStateAction<ToastItem[]>> | null = null

export const toast = {
  show: (message: string, type: ToastType = 'info', duration = 3500) => {
    if (!_setState) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    _setState(prev => [...prev, { id, message, type, duration }])
  },
  success: (msg: string, dur?: number) => toast.show(msg, 'success', dur),
  error:   (msg: string, dur?: number) => toast.show(msg, 'error', dur),
  info:    (msg: string, dur?: number) => toast.show(msg, 'info', dur),
  warning: (msg: string, dur?: number) => toast.show(msg, 'warning', dur),
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)',  icon: '✓' },
  error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',   icon: '✕' },
  info:    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)',  icon: 'ℹ' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', icon: '⚠' },
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [