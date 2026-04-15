import { useState, useEffect, useRef } from 'react'

/**
 * Attaches pull-to-refresh touch listeners to the document.
 * Only activates when the page is scrolled to the top.
 * @param {() => Promise<void>} onRefresh - async function called when pull threshold is met
 * @param {{ threshold?: number }} options
 */
export function usePullToRefresh(onRefresh, { threshold = 72 } = {}) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const startYRef = useRef(0)
  const pullYRef = useRef(0)
  const pullingRef = useRef(false)
  const refreshingRef = useRef(false)

  useEffect(() => {
    function onTouchStart(e) {
      if (refreshingRef.current) return
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop > 4) return
      startYRef.current = e.touches[0].clientY
      pullingRef.current = false
    }

    function onTouchMove(e) {
      if (!startYRef.current || refreshingRef.current) return
      const delta = e.touches[0].clientY - startYRef.current
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      if (delta > 0 && scrollTop <= 4) {
        pullingRef.current = true
        const clamped = Math.min(delta * 0.55, threshold * 1.6)
        pullYRef.current = clamped
        setPullY(clamped)
      } else if (delta <= 0) {
        startYRef.current = 0
        pullingRef.current = false
        pullYRef.current = 0
        setPullY(0)
      }
    }

    async function onTouchEnd() {
      const y = pullYRef.current
      const wasPulling = pullingRef.current
      startYRef.current = 0
      pullingRef.current = false
      pullYRef.current = 0
      setPullY(0)

      if (!wasPulling) return
      if (y >= threshold) {
        navigator.vibrate?.([10, 50, 10])
        refreshingRef.current = true
        setRefreshing(true)
        try { await onRefresh() } catch {}
        refreshingRef.current = false
        setRefreshing(false)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [onRefresh, threshold])

  return {
    pulling: pullY > 0,
    pullY,
    progress: Math.min(pullY / threshold, 1),
    refreshing,
  }
}
