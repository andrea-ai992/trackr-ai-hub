import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  ArrowLeft, Bot, Mic, MicOff, Send, Volume2, VolumeX,
  Trash2, Copy, Check, Cpu, ChevronDown, ChevronUp, Zap, Maximize2, Minimize2,
} from 'lucide-react'

// ─── Storage ──────────────────────────────────────────────────────────────────
const HISTORY_KEY = 'trackr_andy_v2'
const MAX_MSGS = 60
const GALAXY_KEY = 'trackr_andy_galaxy'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(msgs) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-MAX_MSGS)))
}
function loadGalaxyData() {
  try { return JSON.parse(localStorage.getItem(GALAXY_KEY) || '{"exchanges":0}') }
  catch { return { exchanges: 0 } }
}
function saveGalaxyData(d) {
  localStorage.setItem(GALAXY_KEY, JSON.stringify(d))
}

// ─── Galaxy Canvas — Interactive 2D Galaxy ────────────────────────────────────
function GalaxyCanvas({ exchanges, active, mini = false }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const stateRef = useRef({
    stars: [], nebulas: [], particles: [], shooters: [],
    time: 0, rotation: 0,
    // pan/zoom
    panX: 0, panY: 0, zoom: 1,
    dragging: false, lastX: 0, lastY: 0,
    pinchDist: null,
  })

  // Galaxy params — rich from the start, grows with exchanges
  const growth = Math.min(exchanges / 150, 1)
  const BASE_STARS = 350
  const starCount = Math.floor(BASE_STARS + growth * 650)  // 350 → 1000
  const nebulaCount = Math.floor(4 + growth * 8)           // 4 → 12
  const armCount = Math.floor(3 + growth * 3)              // 3 → 6 arms
  const coreIntensity = 0.55 + growth * 0.45

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = stateRef.current

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      initGalaxy(rect.width, rect.height)
    }

    function initGalaxy(w, h) {
      const cx = w / 2, cy = h / 2
      const maxR = Math.min(w, h) * (mini ? 0.36 : 0.44)

      // Spiral arm stars
      s.stars = Array.from({ length: starCount }, (_, i) => {
        const arm = i % armCount
        const progress = i / starCount
        const t = progress * Math.PI * 10 + (arm / armCount) * Math.PI * 2
        const r = (Math.pow(progress, 0.55) * 0.92 + 0.04) * maxR
        const spread = 0.14 + progress * 0.12
        const noiseA = (Math.random() - 0.5) * spread
        const noiseR = (Math.random() - 0.5) * r * 0.15
        const angle = t + noiseA
        const flattenY = 0.35 + growth * 0.1
        const x = cx + Math.cos(angle) * (r + noiseR)
        const y = cy + Math.sin(angle) * (r + noiseR) * flattenY

        const colors = [
          '#ffffff', '#c3f5ff', '#00daf3', '#63f7ff',
          '#d1bcff', '#ecb2ff', '#a78bfa', '#7dd3fc',
          '#fde68a', '#fca5a5',
        ]
        const color = colors[Math.floor(Math.random() * colors.length)]
        const brightness = 0.3 + Math.random() * 0.7
        const size = Math.random() < 0.08 ? 2.2 + Math.random() * 1.4 : 0.4 + Math.random() * 1.4
        return {
          x, y, color, size, brightness,
          twinkleSpeed: 0.6 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          arm,
        }
      })

      // Background dust
      s.particles = Array.from({ length: 200 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        size: Math.random() * 0.9 + 0.1,
        opacity: Math.random() * 0.35 + 0.05,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.01,
      }))

      // Nebulas
      const nebulaColors = [
        ['#6600ea', '#00e5ff'], ['#cf5cff', '#6600ea'],
        ['#00daf3', '#0044aa'], ['#9945FF', '#ff006e'],
        ['#00b4d8', '#6600ea'], ['#ff006e', '#9945FF'],
        ['#fbbf24', '#6600ea'], ['#34d399', '#00daf3'],
      ]
      s.nebulas = Array.from({ length: nebulaCount }, (_, i) => {
        const angle = (i / nebulaCount) * Math.PI * 2 + Math.random() * 0.8
        const r = (0.15 + Math.random() * 0.55) * maxR
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r * 0.38
        const [c1, c2] = nebulaColors[i % nebulaColors.length]
        return {
          x, y,
          rx: 35 + Math.random() * 80 * (0.4 + growth * 0.6),
          ry: 20 + Math.random() * 45 * (0.4 + growth * 0.6),
          rot: Math.random() * Math.PI,
          c1, c2,
          opacity: 0.07 + growth * 0.12,
        }
      })
    }

    function spawnShooter(w, h) {
      const side = Math.random() < 0.5 ? 0 : 1
      const x = side === 0 ? -10 : Math.random() * w
      const y = side === 0 ? Math.random() * h * 0.5 : -10
      s.shooters.push({
        x, y,
        vx: 2 + Math.random() * 4,
        vy: 1.5 + Math.random() * 3,
        life: 1, maxLen: 60 + Math.random() * 80,
        color: Math.random() < 0.5 ? '#c3f5ff' : '#ecb2ff',
      })
    }

    function draw() {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (!w || !h) { animRef.current = requestAnimationFrame(draw); return }
      const cx = w / 2, cy = h / 2
      s.time += 0.012
      if (!mini) s.rotation += 0.00015

      // Shooting stars spawn
      if (!mini && Math.random() < 0.004) spawnShooter(w, h)

      ctx.clearRect(0, 0, w, h)

      // Deep space bg — full solid
      ctx.fillStyle = '#060a16'
      ctx.fillRect(0, 0, w, h)

      // Radial depth gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.75)
      bgGrad.addColorStop(0, 'rgba(25,10,55,0.75)')
      bgGrad.addColorStop(0.45, 'rgba(11,19,35,0.45)')
      bgGrad.addColorStop(1, 'rgba(6,10,22,0)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Apply pan + zoom transform
      ctx.save()
      ctx.translate(cx + s.panX, cy + s.panY)
      ctx.scale(s.zoom, s.zoom)
      ctx.rotate(s.rotation)
      ctx.translate(-cx, -cy)

      // Background particles
      for (const p of s.particles) {
        p.twinkle += p.speed
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(195,245,255,${alpha})`
        ctx.fill()
      }

      // Nebulas
      for (const n of s.nebulas) {
        ctx.save()
        ctx.translate(n.x, n.y)
        ctx.rotate(n.rot)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx)
        const a1 = Math.round(n.opacity * 255).toString(16).padStart(2, '0')
        grad.addColorStop(0, n.c1 + a1)
        grad.addColorStop(0.45, n.c2 + '1a')
        grad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.ellipse(0, 0, n.rx, n.ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }

      // Stars
      for (const star of s.stars) {
        const tw = 0.5 + 0.5 * Math.sin(s.time * star.twinkleSpeed + star.twinkleOffset)
        const alpha = (0.35 + 0.65 * tw) * star.brightness

        if (star.size > 1.4) {
          // Glow halo for bright stars
          const glowR = star.size * 5
          const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowR)
          g.addColorStop(0, star.color + Math.round(alpha * 90).toString(16).padStart(2, '0'))
          g.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(star.x, star.y, glowR, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()

          // Cross sparkle for very bright
          if (star.size > 2.5) {
            ctx.strokeStyle = star.color + Math.round(alpha * 100).toString(16).padStart(2, '0')
            ctx.lineWidth = 0.5
            const len = star.size * 4
            ctx.beginPath(); ctx.moveTo(star.x - len, star.y); ctx.lineTo(star.x + len, star.y); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(star.x, star.y - len); ctx.lineTo(star.x, star.y + len); ctx.stroke()
          }
        }

        // Star core
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * (0.7 + 0.3 * tw), 0, Math.PI * 2)
        ctx.fillStyle = star.color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      // Galaxy core glow (layered)
      const coreR = 22 + growth * 38
      const layers = [
        { r: coreR * 5, a: 0.04 * coreIntensity, c: '#6600ea' },
        { r: coreR * 3, a: 0.1 * coreIntensity, c: '#00daf3' },
        { r: coreR * 1.8, a: 0.3 * coreIntensity, c: '#c3f5ff' },
        { r: coreR,       a: 0.7 * coreIntensity, c: '#ffffff' },
      ]
      for (const l of layers) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, l.r)
        g.addColorStop(0, `${l.c}${Math.round(l.a * 255).toString(16).padStart(2, '0')}`)
        g.addColorStop(0.4, `${l.c}${Math.round(l.a * 0.4 * 255).toString(16).padStart(2, '0')}`)
        g.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.ellipse(cx, cy, l.r, l.r * 0.42, 0, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }

      // Pulsing ring when AI active
      if (active) {
        const pulse = 0.3 + 0.25 * Math.sin(s.time * 4)
        const pR = 50 + growth * 25 + Math.sin(s.time * 3.5) * 10
        ctx.beginPath()
        ctx.ellipse(cx, cy, pR, pR * 0.4, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,218,243,${pulse})`
        ctx.lineWidth = 1.5
        ctx.stroke()
        // Outer ring
        ctx.beginPath()
        ctx.ellipse(cx, cy, pR * 1.4, pR * 0.56, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(102,0,234,${pulse * 0.5})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      ctx.restore()

      // Shooting stars (not affected by pan/zoom)
      if (!mini) {
        s.shooters = s.shooters.filter(sh => {
          sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.025
          if (sh.life <= 0) return false
          const tail = sh.maxLen * sh.life
          const grad = ctx.createLinearGradient(sh.x - sh.vx * tail / sh.vx, sh.y - sh.vy * tail / sh.vy, sh.x, sh.y)
          grad.addColorStop(0, 'transparent')
          grad.addColorStop(1, sh.color + Math.round(sh.life * 200).toString(16).padStart(2, '0'))
          ctx.beginPath()
          ctx.moveTo(sh.x - sh.vx * (tail / sh.vx), sh.y - sh.vy * (tail / sh.vy))
          ctx.lineTo(sh.x, sh.y)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.2
          ctx.stroke()
          return true
        })
      }

      // Level label (bottom center, not mini)
      if (!mini && exchanges > 0) {
        ctx.font = `700 11px 'Space Grotesk', system-ui`
        ctx.fillStyle = 'rgba(195,245,255,0.3)'
        ctx.textAlign = 'center'
        ctx.fillText(`LVL ${Math.floor(exchanges / 5) + 1} · ${exchanges} échanges`, w / 2, h - 20)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    // Use ResizeObserver for reliable sizing
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animRef.current)
      resize()
      animRef.current = requestAnimationFrame(draw)
    })
    ro.observe(canvas)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [exchanges, active, growth, starCount, nebulaCount, armCount, coreIntensity, mini])

  // ── Touch/Mouse interaction (pan + zoom) ─────────────────────────────────
  useEffect(() => {
    if (mini) return
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    function getPos(e) {
      const r = canvas.getBoundingClientRect()
      const t = e.touches ? e.touches[0] : e
      return { x: t.clientX - r.left, y: t.clientY - r.top }
    }

    function onMouseDown(e) {
      const p = getPos(e)
      s.dragging = true; s.lastX = p.x; s.lastY = p.y
    }
    function onMouseMove(e) {
      if (!s.dragging) return
      const p = getPos(e)
      s.panX += (p.x - s.lastX); s.panY += (p.y - s.lastY)
      s.lastX = p.x; s.lastY = p.y
      // Limit pan
      const maxPan = 300
      s.panX = Math.max(-maxPan, Math.min(maxPan, s.panX))
      s.panY = Math.max(-maxPan, Math.min(maxPan, s.panY))
    }
    function onMouseUp() { s.dragging = false }

    function onWheel(e) {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.1 : 0.91
      s.zoom = Math.max(0.4, Math.min(4, s.zoom * factor))
    }

    function pinchDist(e) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      return Math.hypot(dx, dy)
    }
    function onTouchStart(e) {
      if (e.touches.length === 2) { s.pinchDist = pinchDist(e); return }
      const p = getPos(e)
      s.dragging = true; s.lastX = p.x; s.lastY = p.y
    }
    function onTouchMove(e) {
      e.preventDefault()
      if (e.touches.length === 2) {
        const d = pinchDist(e)
        if (s.pinchDist) {
          const factor = d / s.pinchDist
          s.zoom = Math.max(0.4, Math.min(4, s.zoom * factor))
        }
        s.pinchDist = d; return
      }
      if (!s.dragging) return
      const p = getPos(e.touches[0])
      s.panX += (p.x - s.lastX); s.panY += (p.y - s.lastY)
      s.lastX = p.x; s.lastY = p.y
    }
    function onTouchEnd(e) { if (e.touches.length < 2) s.pinchDist = null; if (e.touches.length === 0) s.dragging = false }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [mini])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%', height: '100%', display: 'block',
        cursor: mini ? 'default' : 'grab',
      }}
    />
  )
}

// ─── TradingView ──────────────────────────────────────────────────────────────
const TV_SYMBOL_MAP = {
  'BTC-USD': 'COINBASE:BTCUSD', 'ETH-USD': 'COINBASE:ETHUSD',
  'SOL-USD': 'COINBASE:SOLUSD', '^GSPC': 'SP:SPX', '^DJI': 'DJ:DJI',
  'GC=F': 'TVC:GOLD', 'CL=F': 'TVC:USOIL',
}
const TV_INT = { '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'D' }

let tvLoaded = false
function TVChart({ symbol, interval }) {
  const ref = useRef(null)
  const uid = useRef(`tv_${Date.now()}`)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const sym = TV_SYMBOL_MAP[symbol] || `NASDAQ:${symbol}`
    const int = TV_INT[interval] || 'D'
    function init() {
      if (!window.TradingView || !container) return
      container.innerHTML = `<div id="${uid.current}" style="height:100%;width:100%"></div>`
      new window.TradingView.widget({
        container_id: uid.current, autosize: true, symbol: sym, interval: int,
        timezone: 'Europe/Paris', theme: 'dark', style: '1', locale: 'fr',
        backgroundColor: 'rgba(6,10,22,1)', gridColor: 'rgba(132,147,150,0.05)',
        enable_publishing: false, hide_side_toolbar: true,
        studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
        overrides: { 'paneProperties.background': '#060a16' },
      })
    }
    if (tvLoaded && window.TradingView) { init() }
    else if (!tvLoaded) {
      tvLoaded = true
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.onload = init; document.head.appendChild(s)
    } else {
      const t = setInterval(() => { if (window.TradingView) { clearInterval(t); init() } }, 200)
      return () => clearInterval(t)
    }
    return () => { if (container) container.innerHTML = '' }
  }, [symbol, interval])
  return <div style={{ width: '100%', height: 340, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(132,147,150,0.12)', marginBottom: 8, background: '#060a16' }}><div ref={ref} style={{ height: '100%', width: '100%' }} /></div>
}

// ─── Tool display ─────────────────────────────────────────────────────────────
const TOOL_CFG = {
  navigate:              { icon: '📍', label: 'Navigation',       color: '#00daf3', bg: 'rgba(0,218,243,0.08)'   },
  fetch_price:           { icon: '📊', label: 'Prix live',         color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
  fetch_crypto_price:    { icon: '₿',  label: 'Prix live',         color: '#fcd34d', bg: 'rgba(252,211,77,0.08)'  },
  technical_analysis:    { icon: '📈', label: 'Analyse technique', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  scan_market:           { icon: '🔍', label: 'Scanner marché',    color: '#ecb2ff', bg: 'rgba(236,178,255,0.08)' },
  add_stock:             { icon: '📈', label: 'Action ajoutée',    color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
  remove_stock:          { icon: '📉', label: 'Action retirée',    color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  add_crypto:            { icon: '₿',  label: 'Crypto ajoutée',    color: '#fcd34d', bg: 'rgba(252,211,77,0.08)'  },
  remove_crypto:         { icon: '₿',  label: 'Crypto retirée',    color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  create_alert:          { icon: '🔔', label: 'Alerte créée',      color: '#ecb2ff', bg: 'rgba(236,178,255,0.08)' },
  delete_alert:          { icon: '🔕', label: 'Alerte supprimée',  color: '#4b6070', bg: 'rgba(75,96,112,0.08)'   },
  add_to_watchlist:      { icon: '👁️', label: 'Watchlist',         color: '#00daf3', bg: 'rgba(0,218,243,0.08)'   },
  remove_from_watchlist: { icon: '👁️', label: 'Retiré watchlist',  color: '#4b6070', bg: 'rgba(75,96,112,0.08)'   },
  add_sneaker:           { icon: '👟', label: 'Sneaker ajoutée',   color: '#ecb2ff', bg: 'rgba(236,178,255,0.08)' },
}

function toolSummary(name, input, result) {
  const fmt = (n, d = 2) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  switch (name) {
    case 'navigate': return `→ ${input.path}`
    case 'fetch_price': return result?.price ? `${result.name || input.symbol} · $${fmt(result.price)} · ${parseFloat(result.changePct) >= 0 ? '+' : ''}${result.changePct}%` : input.symbol
    case 'fetch_crypto_price': return result?.price ? `${input.coinId} · $${fmt(result.price)} · ${parseFloat(result.change24h) >= 0 ? '+' : ''}${result.change24h}%` : input.coinId
    case 'technical_analysis': return result?.trend ? `${result.assetName || input.symbol} · ${input.interval} · ${result.trend} · RSI ${result.rsi}` : `${input.symbol} ${input.interval}`
    case 'scan_market': return `${result?.count || 0} actifs scannés`
    case 'add_stock': return `${input.symbol} · ${input.quantity} @ $${input.buyPrice}`
    case 'remove_stock': return input.symbol
    case 'add_crypto': return `${input.coinName} · ${input.quantity} @ $${input.buyPrice}`
    case 'remove_crypto': return input.coinId
    case 'create_alert': return `${input.symbol} ${input.direction === 'above' ? '>' : '<'} $${input.targetPrice}`
    case 'delete_alert': return `${input.symbol} ${input.direction === 'above' ? '>' : '<'} $${input.targetPrice}`
    case 'add_to_watchlist': return `${input.symbol} (${input.name})`
    case 'remove_from_watchlist': return input.symbol
    case 'add_sneaker': return `${input.brand} ${input.model} T${input.size}`
    default: return JSON.stringify(input)
  }
}

function ToolCard({ name, input, result }) {
  const [exp, setExp] = useState(false)
  const cfg = TOOL_CFG[name] || { icon: '⚙️', label: name, color: '#4b6070', bg: 'rgba(75,96,112,0.08)' }
  const summary = toolSummary(name, input, result)
  const hasDetail = result && !result.error && Object.keys(result).length > 1
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', borderRadius: 10, margin: '2px 0', background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
      <span style={{ fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ color: cfg.color, fontWeight: 700, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Grotesk', system-ui" }}>{cfg.label}</span>
          <span style={{ fontSize: 9, color: '#4b6070', background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: 4 }}>{result?.error ? '✗' : '✓'}</span>
        </div>
        <div style={{ color: '#bac9cc', marginTop: 2, wordBreak: 'break-word', lineHeight: 1.4 }}>{summary}</div>
        {hasDetail && (
          <>
            <button onClick={() => setExp(e => !e)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#4b6070', fontSize: 10, marginTop: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              {exp ? <ChevronUp size={9} /> : <ChevronDown size={9} />} {exp ? 'Moins' : 'Détails'}
            </button>
            {exp && <pre style={{ marginTop: 5, fontSize: 10, color: '#4b6070', background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: 6, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(result, null, 2)}</pre>}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Markdown ──────────────────────────────────────────────────────────────────
const CHART_RE = /\[CHART:([^:]+):([^\]]+)\]/g

function inlineMd(text) {
  const parts = []; const re = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g; let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2]) parts.push(<strong key={m.index} style={{ color: '#c3f5ff', fontWeight: 700 }}>{m[2]}</strong>)
    else if (m[3]) parts.push(<code key={m.index} style={{ background: 'rgba(0,218,243,0.1)', borderRadius: 4, padding: '1px 5px', fontSize: '0.88em', fontFamily: 'monospace', color: '#00daf3' }}>{m[3]}</code>)
    else if (m[4]) parts.push(<em key={m.index} style={{ color: '#ecb2ff' }}>{m[4]}</em>)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? text : parts
}

function renderLine(line, key) {
  const lm = line.match(/^[-*•]\s(.+)/)
  if (lm) return <div key={key} style={{ display: 'flex', gap: 8, margin: '2px 0' }}><span style={{ color: '#00daf3', flexShrink: 0 }}>·</span><span>{inlineMd(lm[1])}</span></div>
  const gm = line.match(/^🟢\s(.+)/); if (gm) return <div key={key} style={{ background: 'rgba(52,211,153,0.07)', borderLeft: '2px solid #34d399', borderRadius: '0 8px 8px 0', padding: '5px 10px', margin: '3px 0', color: '#6ee7b7', fontSize: 13.5 }}>🟢 {inlineMd(gm[1])}</div>
  const rm = line.match(/^🔴\s(.+)/); if (rm) return <div key={key} style={{ background: 'rgba(248,113,113,0.07)', borderLeft: '2px solid #f87171', borderRadius: '0 8px 8px 0', padding: '5px 10px', margin: '3px 0', color: '#fca5a5', fontSize: 13.5 }}>🔴 {inlineMd(rm[1])}</div>
  const ym = line.match(/^🟡\s(.+)/); if (ym) return <div key={key} style={{ background: 'rgba(252,211,77,0.07)', borderLeft: '2px solid #fcd34d', borderRadius: '0 8px 8px 0', padding: '5px 10px', margin: '3px 0', color: '#fcd34d', fontSize: 13.5 }}>🟡 {inlineMd(ym[1])}</div>
  const em = line.match(/^⚡\s(.+)/); if (em) return <div key={key} style={{ background: 'rgba(0,218,243,0.07)', borderLeft: '2px solid #00daf3', borderRadius: '0 8px 8px 0', padding: '5px 10px', margin: '3px 0', color: '#c3f5ff', fontSize: 13.5 }}>⚡ {inlineMd(em[1])}</div>
  return <div key={key} style={{ lineHeight: 1.65, margin: '1px 0' }}>{inlineMd(line)}</div>
}

function renderContent(text) {
  const segments = []; let last = 0; let m
  CHART_RE.lastIndex = 0
  while ((m = CHART_RE.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: 'text', content: text.slice(last, m.index) })
    segments.push({ type: 'chart', symbol: m[1], interval: m[2] })
    last = CHART_RE.lastIndex
  }
  if (last < text.length) segments.push({ type: 'text', content: text.slice(last) })

  return segments.map((seg, si) => {
    if (seg.type === 'chart') return <TVChart key={si} symbol={seg.symbol} interval={seg.interval} />
    const lines = seg.content.split('\n'); const out = []; let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim(); const code = []
        i++
        while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++ }
        out.push(<pre key={`${si}-${i}`} style={{ background: 'rgba(6,10,22,0.8)', border: '1px solid rgba(132,147,150,0.1)', borderRadius: 10, padding: '12px 14px', overflowX: 'auto', margin: '8px 0', fontSize: 12.5, lineHeight: 1.6 }}>{lang && <div style={{ color: '#4b6070', fontSize: 10, marginBottom: 6, fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lang}</div>}<code style={{ fontFamily: 'monospace', color: '#c3f5ff', whiteSpace: 'pre' }}>{code.join('\n')}</code></pre>)
        i++; continue
      }
      const hm = line.match(/^(#{1,3})\s(.+)/)
      if (hm) { const sz = hm[1].length === 1 ? 17 : hm[1].length === 2 ? 15 : 13.5; out.push(<div key={`${si}-${i}`} style={{ fontSize: sz, fontWeight: 700, color: '#c3f5ff', margin: '12px 0 4px', fontFamily: "'Space Grotesk', system-ui" }}>{hm[2]}</div>); i++; continue }
      if (line.match(/^---+$/)) { out.push(<div key={`${si}-${i}`} style={{ height: 1, background: 'rgba(132,147,150,0.1)', margin: '10px 0' }} />); i++; continue }
      if (line.trim() === '') { out.push(<div key={`${si}-${i}`} style={{ height: 5 }} />); i++; continue }
      out.push(renderLine(line, `${si}-${i}`)); i++
    }
    return <div key={si}>{out}</div>
  })
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, onSpeak }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)
  const allTools = [...(msg.serverTools || []), ...(msg.clientActions || []).map(a => ({ ...a, isClient: true }))]

  if (isUser) return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '3px 0' }}>
      <div style={{ maxWidth: '78%', padding: '11px 15px', borderRadius: '18px 18px 4px 18px', background: 'linear-gradient(135deg, rgba(0,100,130,0.8) 0%, rgba(102,0,234,0.8) 100%)', border: '1px solid rgba(0,218,243,0.2)', color: '#dbe2f8', fontSize: 14.5, lineHeight: 1.55, wordBreak: 'break-word', backdropFilter: 'blur(8px)' }}>
        {msg.content}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: 10, padding: '3px 0', alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg, #00a3b8, #6600ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,218,243,0.25)' }}>
        <Bot size={13} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {allTools.length > 0 && <div style={{ marginBottom: 6 }}>{allTools.map((t, i) => <ToolCard key={t.id || i} name={t.name} input={t.input} result={t.result} />)}</div>}
        {(msg.content || msg.streaming) && (
          <div style={{ background: 'rgba(19,28,43,0.6)', border: '1px solid rgba(132,147,150,0.1)', borderRadius: '4px 16px 16px 16px', padding: '12px 15px', fontSize: 14.5, color: '#dbe2f8', lineHeight: 1.6, wordBreak: 'break-word', backdropFilter: 'blur(12px)' }}>
            {msg.content ? renderContent(msg.content) : null}
            {msg.streaming && (
              <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#00daf3', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'borderGlow 0.8s ease-in-out infinite alternate', borderRadius: 1 }} />
            )}
          </div>
        )}
        {msg.content && !msg.streaming && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button onClick={() => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b6070', padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              {copied ? <><Check size={10} style={{ color: '#34d399' }} /> Copié</> : <><Copy size={10} /> Copier</>}
            </button>
            <button onClick={() => onSpeak(msg.content)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b6070', padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <Volume2 size={10} /> Écouter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Voice ────────────────────────────────────────────────────────────────────
function useSpeech(onResult) {
  const ref = useRef(null); const [listening, setListening] = useState(false); const [interim, setInterim] = useState(''); const [supported, setSupported] = useState(false)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return; setSupported(true)
    const r = new SR(); r.lang = 'fr-FR'; r.continuous = false; r.interimResults = true
    r.onresult = e => { let f = '', inter = ''; for (const res of e.results) { if (res.isFinal) f += res[0].transcript; else inter += res[0].transcript }; setInterim(inter); if (f) { setInterim(''); onResult(f.trim()) } }
    r.onend = () => { setListening(false); setInterim('') }; r.onerror = () => { setListening(false); setInterim('') }; ref.current = r
  }, [])
  const toggle = useCallback(() => { if (!ref.current) return; if (listening) ref.current.stop(); else { try { ref.current.start(); setListening(true) } catch {} } }, [listening])
  return { listening, interim, supported, toggle }
}

function speakText(text) {
  window.speechSynthesis?.cancel()
  const clean = text.replace(/[🟢🔴🟡📊📈📉🔔⚡₿]/gu, '').replace(/\*\*/g, '').replace(/`[^`]*`/g, '').replace(/```[\s\S]*?```/g, 'code').replace(/\[CHART:[^\]]+\]/g, '').slice(0, 600)
  const u = new SpeechSynthesisUtterance(clean); u.lang = 'fr-FR'; u.rate = 1.05; u.pitch = 1
  const fr = window.speechSynthesis.getVoices().find(v => /thomas|amélie|nicolas/i.test(v.name) && v.lang?.startsWith('fr'))
  if (fr) u.voice = fr; window.speechSynthesis.speak(u)
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { text: 'Analyse technique Apple 1h', icon: '📈' },
  { text: 'Scanne mon portfolio', icon: '🔍' },
  { text: 'Combien vaut Bitcoin ?', icon: '₿' },
  { text: 'Crée alertes NVDA aux niveaux clés', icon: '🔔' },
  { text: 'Meilleur setup du marché ?', icon: '⚡' },
  { text: 'Analyse S&P500 tendance', icon: '🌐' },
]

// ─── Input bar ────────────────────────────────────────────────────────────────
function InputBar({ input, onInput, onSend, onMic, listening, interim, supported, loading, offline, textareaRef }) {
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }
  const canSend = input.trim() && !loading && !offline

  return (
    <div>
      {interim && <div style={{ fontSize: 12, color: '#00daf3', marginBottom: 7, padding: '5px 10px', background: 'rgba(0,218,243,0.08)', borderRadius: 8, border: '1px solid rgba(0,218,243,0.15)' }}>🎤 {interim}</div>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'rgba(19,28,43,0.75)', border: `1px solid ${listening ? 'rgba(248,113,113,0.4)' : 'rgba(0,218,243,0.15)'}`, borderRadius: 18, padding: '8px 8px 8px 14px', backdropFilter: 'blur(20px)', boxShadow: '0 0 20px rgba(0,218,243,0.06)' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder={listening ? 'Écoute…' : 'Commande neurale… (Entrée)'}
          rows={1}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#dbe2f8', fontSize: 14, resize: 'none', lineHeight: 1.5, fontFamily: 'inherit', maxHeight: 120, overflowY: 'auto' }}
        />
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {supported && (
            <button onClick={onMic} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: listening ? 'rgba(248,113,113,0.2)' : 'rgba(132,147,150,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: listening ? '#f87171' : '#4b6070', transition: 'all 200ms' }}>
              {listening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          )}
          <button onClick={onSend} disabled={!canSend} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: canSend ? 'linear-gradient(135deg, #007a90, #5500c0)' : 'rgba(132,147,150,0.06)', cursor: canSend ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: canSend ? '#c3f5ff' : '#374151', transition: 'all 200ms', boxShadow: canSend ? '0 0 14px rgba(0,218,243,0.3)' : 'none' }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Andy() {
  const navigate = useNavigate()
  const {
    stocks, cryptoHoldings, sneakers, alerts, stockWatchlist,
    addStock, deleteStock, addCryptoHolding, deleteCryptoHolding,
    addAlert, deleteAlert, addToWatchlist, removeFromWatchlist, addSneaker,
  } = useApp()

  const [messages, setMessages] = useState(loadHistory)
  const [galaxyData, setGalaxyData] = useState(loadGalaxyData)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState('') // e.g. "📈 Analyse technique…"
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [view, setView] = useState('galaxy') // 'galaxy' | 'chat'
  const streamTextRef = useRef('')

  const listRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => { saveHistory(messages) }, [messages])
  useEffect(() => { saveGalaxyData(galaxyData) }, [galaxyData])

  useEffect(() => {
    if (view === 'chat' && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading, view])

  const { listening, interim, supported, toggle: toggleMic } = useSpeech(useCallback(t => sendMessage(t), [messages]))

  function handleInput(e) {
    setInput(e.target.value)
    const ta = e.target; ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  async function executeClientActions(actions) {
    for (const { name, input: inp } of actions) {
      try {
        switch (name) {
          case 'navigate': navigate(inp.path); break
          case 'add_stock': addStock({ symbol: inp.symbol, name: inp.name, quantity: inp.quantity, buyPrice: inp.buyPrice, buyDate: inp.buyDate || '' }); break
          case 'remove_stock': { const s = stocks.find(x => x.symbol?.toUpperCase() === inp.symbol?.toUpperCase()); if (s) deleteStock(s.id); break }
          case 'add_crypto': addCryptoHolding({ coinId: inp.coinId, coinName: inp.coinName, symbol: inp.symbol, quantity: inp.quantity, buyPrice: inp.buyPrice }); break
          case 'remove_crypto': { const c = cryptoHoldings.find(x => x.coinId === inp.coinId); if (c) deleteCryptoHolding(c.id); break }
          case 'create_alert': addAlert({ symbol: inp.symbol, name: inp.name || inp.symbol, targetPrice: inp.targetPrice, direction: inp.direction }); break
          case 'delete_alert': { const a = alerts.find(x => x.symbol === inp.symbol && x.direction === inp.direction && Math.abs(x.targetPrice - inp.targetPrice) < 0.01); if (a) deleteAlert(a.id); break }
          case 'add_to_watchlist': addToWatchlist({ symbol: inp.symbol, name: inp.name }); break
          case 'remove_from_watchlist': removeFromWatchlist(inp.symbol); break
          case 'add_sneaker': addSneaker({ brand: inp.brand, model: inp.model, size: inp.size, buyPrice: inp.buyPrice }); break
        }
      } catch (e) { console.warn('Tool error:', name, e) }
    }
  }

  async function sendMessage(text) {
    const trimmed = (text || input).trim()
    if (!trimmed || loading || offline) return
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    if (view === 'galaxy') setView('chat')

    const userMsg = { role: 'user', content: trimmed }
    const newMsgs = [...messages, userMsg]

    // Add streaming placeholder immediately
    const placeholder = { role: 'assistant', content: '', streaming: true, serverTools: [], clientActions: [] }
    setMessages([...newMsgs, placeholder])
    setLoading(true)
    setGalaxyData(prev => ({ ...prev, exchanges: prev.exchanges + 1 }))
    streamTextRef.current = ''

    const apiMsgs = newMsgs.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMsgs, portfolio: stocks.filter(s => !s.salePrice), crypto: cryptoHoldings.filter(c => !c.salePrice), sneakers, alerts, watchlist: stockWatchlist }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let finalClientActions = []
      let finalServerTools = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let ev
          try { ev = JSON.parse(line.slice(6)) } catch { continue }

          if (ev.type === 'token') {
            streamTextRef.current += ev.text
            const t = streamTextRef.current
            setMessages(prev => {
              const copy = [...prev]
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: t }
              return copy
            })
          } else if (ev.type === 'tool_start') {
            setToolStatus(ev.label || ev.name)
          } else if (ev.type === 'tool_done') {
            setToolStatus('')
          } else if (ev.type === 'done') {
            finalClientActions = ev.clientActions || []
            finalServerTools = ev.executedServerTools || []
          } else if (ev.type === 'error') {
            throw new Error(ev.message)
          }
        }
      }

      // Finalize message
      const finalText = streamTextRef.current
      if (finalClientActions.length > 0) await executeClientActions(finalClientActions)
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: finalText, streaming: false, serverTools: finalServerTools, clientActions: finalClientActions }
        return copy
      })
      setGalaxyData(prev => ({ ...prev, exchanges: prev.exchanges + 1 }))
      if (autoSpeak && finalText) speakText(finalText)
    } catch (e) {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: `Erreur : ${e.message}`, streaming: false, serverTools: [], clientActions: [] }
        return copy
      })
    } finally {
      setLoading(false)
      setToolStatus('')
    }
  }

  function clearAll() {
    setMessages([]); localStorage.removeItem(HISTORY_KEY)
    setGalaxyData({ exchanges: 0 }); localStorage.removeItem(GALAXY_KEY)
    setView('galaxy')
  }

  const level = Math.floor(galaxyData.exchanges / 5) + 1
  const xp = galaxyData.exchanges % 5
  const growth = Math.min(galaxyData.exchanges / 150, 1)

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060a16', display: 'flex', flexDirection: 'column', color: '#dbe2f8', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', paddingTop: 'max(14px, env(safe-area-inset-top, 0px))', paddingBottom: 12, borderBottom: '1px solid rgba(132,147,150,0.08)', background: 'rgba(6,10,22,0.85)', backdropFilter: 'blur(20px)', flexShrink: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b6070', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, #00a3b8, #6600ea)', opacity: 0.2, animation: 'andySpin 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: 'linear-gradient(135deg, #00a3b8, #6600ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={15} color="white" />
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: offline ? '#ef4444' : '#00daf3', border: '2px solid #060a16', boxShadow: offline ? 'none' : '0 0 5px #00daf3' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#c3f5ff', fontFamily: "'Space Grotesk', system-ui" }}>AnDy AI</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#00daf3', background: 'rgba(0,218,243,0.1)', border: '1px solid rgba(0,218,243,0.2)', padding: '1px 6px', borderRadius: 999, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LVL {level}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{ width: 60, height: 2, background: 'rgba(132,147,150,0.15)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${(xp / 5) * 100}%`, background: 'linear-gradient(90deg, #00daf3, #6600ea)', borderRadius: 2, transition: 'width 600ms ease' }} />
              </div>
              <span style={{ fontSize: 9, color: '#4b6070' }}>{offline ? 'hors ligne' : 'sonnet · actif'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setView(v => v === 'galaxy' ? 'chat' : 'galaxy')}
            style={{ background: view === 'chat' ? 'rgba(0,218,243,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${view === 'chat' ? 'rgba(0,218,243,0.3)' : 'rgba(132,147,150,0.12)'}`, borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: view === 'chat' ? '#00daf3' : '#bac9cc', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui", letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {view === 'galaxy' ? <><Maximize2 size={11} /> Chat</> : <><Minimize2 size={11} /> Galaxie</>}
          </button>
          <button onClick={() => setAutoSpeak(v => !v)} style={{ background: autoSpeak ? 'rgba(0,218,243,0.12)' : 'rgba(255,255,255,0.04)', border: autoSpeak ? '1px solid rgba(0,218,243,0.25)' : '1px solid rgba(132,147,150,0.1)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: autoSpeak ? '#00daf3' : '#4b6070' }}>
            {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button onClick={() => sendMessage('Scanne mon portfolio et donne-moi les signaux importants.')} style={{ background: 'rgba(236,178,255,0.08)', border: '1px solid rgba(236,178,255,0.18)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ecb2ff' }}>
            <Zap size={14} />
          </button>
          {messages.length > 0 && (
            <button onClick={clearAll} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(132,147,150,0.1)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b6070' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {offline && <div style={{ background: 'rgba(248,113,113,0.1)', color: '#fca5a5', fontSize: 12, textAlign: 'center', padding: '7px 16px', borderBottom: '1px solid rgba(248,113,113,0.15)', flexShrink: 0 }}>Hors ligne — connexion requise</div>}

      {/* ── Galaxy View — Full immersive ─────────────────────────────────────── */}
      {view === 'galaxy' && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Full page galaxy */}
          <GalaxyCanvas exchanges={galaxyData.exchanges} active={loading} />

          {/* Hint to explore */}
          <div style={{ position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ fontSize: 10, color: 'rgba(195,245,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui" }}>
              Glisse · Pince pour zoomer
            </div>
          </div>

          {/* Center info overlay */}
          <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#00daf3', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui", marginBottom: 6, opacity: 0.65 }}>Neural Core</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', system-ui", background: 'linear-gradient(135deg, #c3f5ff, #ecb2ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 2 }}>
              {galaxyData.exchanges === 0 ? 'Dormant' : `${galaxyData.exchanges} échanges`}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(75,96,112,0.8)' }}>
              {galaxyData.exchanges === 0
                ? `${350} étoiles · Galaxie prête`
                : `${Math.floor(350 + growth * 650)} étoiles · ${Math.round(growth * 100)}% évolué`}
            </div>
          </div>

          {/* Bottom: suggestions + input */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 16px 16px', background: 'linear-gradient(to top, rgba(6,10,22,0.97) 55%, rgba(6,10,22,0.5) 80%, transparent)' }}>
            {messages.length === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text)} style={{ background: 'rgba(19,28,43,0.75)', border: '1px solid rgba(0,218,243,0.1)', backdropFilter: 'blur(16px)', borderRadius: 14, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', color: '#bac9cc', fontSize: 12, lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 7, transition: 'all 150ms' }}>
                    <span style={{ fontSize: 15 }}>{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            )}
            <InputBar
              input={input} onInput={handleInput}
              onSend={() => sendMessage()} onMic={toggleMic}
              listening={listening} interim={interim}
              supported={supported} loading={loading} offline={offline}
              textareaRef={textareaRef}
            />
          </div>
        </div>
      )}

      {/* ── Chat View ───────────────────────────────────────────────────────── */}
      {view === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Mini galaxy strip — tappable to go back */}
          <div
            onClick={() => setView('galaxy')}
            style={{ height: 90, flexShrink: 0, position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(132,147,150,0.08)', cursor: 'pointer' }}
          >
            <GalaxyCanvas exchanges={galaxyData.exchanges} active={loading} mini />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(195,245,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', system-ui" }}>
                  {galaxyData.exchanges} échanges · {Math.round(growth * 100)}% évolué
                </div>
                <div style={{ fontSize: 8, color: 'rgba(75,96,112,0.6)', marginTop: 1 }}>Toucher pour explorer</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', overscrollBehavior: 'contain' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b6070' }}>
                <div style={{ fontSize: 13, marginBottom: 20 }}>Démarre une conversation</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {SUGGESTIONS.slice(0, 4).map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s.text)} style={{ background: 'rgba(19,28,43,0.5)', border: '1px solid rgba(132,147,150,0.1)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', color: '#bac9cc', fontSize: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 15 }}>{s.icon}</span><span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => <Bubble key={i} msg={msg} onSpeak={speakText} />)}
            {loading && (
              <div style={{ display: 'flex', gap: 10, padding: '3px 0', marginTop: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #00a3b8, #6600ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,218,243,0.25)' }}>
                  <Bot size={13} color="white" />
                </div>
                <div style={{ background: 'rgba(19,28,43,0.6)', border: '1px solid rgba(132,147,150,0.1)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <Cpu size={12} style={{ color: '#00daf3', animation: 'andySpin 1s linear infinite' }} />
                  <span style={{ fontSize: 12, color: '#4b6070', fontFamily: "'Space Grotesk', system-ui", letterSpacing: '0.1em', textTransform: 'uppercase' }}>Synthèse en cours…</span>
                </div>
              </div>
            )}
            <div style={{ height: 8 }} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid rgba(132,147,150,0.08)', padding: '10px 16px', paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))', background: 'rgba(6,10,22,0.92)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
            {toolStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, padding: '5px 10px', background: 'rgba(0,218,243,0.06)', border: '1px solid rgba(0,218,243,0.15)', borderRadius: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00daf3', animation: 'ping 1.2s ease-in-out infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#00daf3' }}>{toolStatus}</span>
              </div>
            )}
            <InputBar
              input={input} onInput={handleInput}
              onSend={() => sendMessage()} onMic={toggleMic}
              listening={listening} interim={interim}
              supported={supported} loading={loading} offline={offline}
              textareaRef={textareaRef}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes andySpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
