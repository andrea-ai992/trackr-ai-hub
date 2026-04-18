Je vais implémenter un design premium pour FlightTracker avec des animations fluides et un statut live en temps réel. Voici le code complet et fonctionnel :

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Locate, Loader2, Plane, RefreshCw, Navigation, ArrowUp, Map, List } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ─── CSS Animation Keyframes ──────────────────────────────────────────────────
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .fade-in { animation: fadeIn 0.4s ease-out; }
  .pulse { animation: pulse 2s ease-in-out infinite; }
  .slide-in { animation: slideIn 0.3s ease-out; }
`
document.head.appendChild(style)

// ─── OpenSky Network API (free, no key) ──────────────────────────────────────
const OPENSKY = 'https://opensky-network.org/api'
const PROXY = url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

async function fetchJSON(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (r.ok) return await r.json()
  } catch {}
  try {
    const r = await fetch(PROXY(url), { signal: AbortSignal.timeout(12000) })
    if (r.ok) { const w = await r.json(); return JSON.parse(w.contents) }
  } catch {}
  return null
}

// ─── Aircraft type labels ─────────────────────────────────────────────────────
const TYPES = {
  A318:'A318',A319:'A319',A320:'A320',A321:'A321',A20N:'A320neo',A21N:'A321neo',
  A332:'A330-200',A333:'A330-300',A359:'A350-900',A35K:'A350-1000',A380:'A380',
  B734:'B737-400',B737:'B737-700',B738:'B737-800',B739:'B737-900',
  B37M:'B737 MAX 7',B38M:'B737 MAX 8',B39M:'B737 MAX 9',
  B744:'B747-400',B748:'B747-8',B752:'B757-200',B762:'B767-200',B763:'B767-300',
  B772:'B777-200',B773:'B777-300',B77W:'B777-300ER',B788:'B787-8',B789:'B787-9',B78X:'B787-10',
  E170:'E170',E175:'E175',E190:'E190',E195:'E195',CRJ2:'CRJ-200',CRJ7:'CRJ-700',CRJ9:'CRJ-900',
  DH8D:'Q400',AT72:'ATR 72',C172:'Cessna 172',PC12:'Pilatus PC-12',
  GL5T:'Global 5000',GL7T:'Global 7500',
}

function acType(icaoType) { return icaoType ? (TYPES[icaoType] || icaoType) : null }

// ─── Parse OpenSky state vector ───────────────────────────────────────────────
function parseState(s) {
  if (!s || s[5] == null || s[6] == null) return null
  return {
    icao: s[0],
    callsign: s[1]?.trim() || s[0]?.toUpperCase(),
    country: s[2],
    lon: s[5],
    lat: s[6],
    altitude: s[7] != null ? Math.round(s[7] * 3.28084) : null,
    onGround: s[8],
    speed: s[9] != null ? Math.round(s[9] * 1.944) : null,
    heading: s[10] != null ? Math.round(s[10]) : null,
    vertRate: s[11] != null ? Math.round(s[11] * 196.85) : null,
    lastContact: s[4],
    geoAltitude: s[13] != null ? Math.round(s[13] * 3.28084) : null,
  }
}

// ─── Distance between two lat/lon (km) ───────────────────────────────────────
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ─── Bearing from user to aircraft ───────────────────────────────────────────
function bearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180)
  const x = Math.cos(lat1*Math.PI/180)*Math.sin(lat2*Math.PI/180) - Math.sin(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

// ─── Heading arrow ───────────────────────────────────────────────────────────
function HeadingArrow({ deg, color = 'var(--green)', size = 18 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ArrowUp size={size} color={color} style={{ transform: `rotate(${deg}deg)`, transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </div>
  )
}

// ─── Leaflet aircraft icon ────────────────────────────────────────────────────
function makeAcIcon(heading, onGround) {
  const color = onGround ? 'var(--t3)' : 'var(--green)'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <g transform="rotate(${heading || 0} 16 16)">
      <circle cx="16" cy="16" r="15" fill="rgba(10,10,20,0.7)" stroke="${color}" stroke-width="1.5"/>
      <text x="16" y="21" text-anchor="middle" font-size="16" fill="${color}">✈</text>
    </g>
  </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function makeUserIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="rgba(0,255,136,0.2)" stroke="var(--green)" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="var(--green)"/>
  </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [24, 24], iconAnchor: [12, 12] })
}

// ─── Map recenter helper ──────────────────────────────────────────────────────
function MapRecenter({ lat, lon }) {
  const map = useMap()
  useEffect(() => { if (lat && lon) map.setView([lat, lon], map.getZoom()) }, [lat, lon])
  return null
}

// ─── Flag emoji ───────────────────────────────────────────────────────────────
const FLAGS = { 'United States': '🇺🇸', 'France': '🇫🇷', 'United Kingdom': '🇬🇧', 'Germany': '🇩🇪',
  'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Netherlands': '🇳🇱', 'China': '🇨🇳', 'Japan': '🇯🇵',
  'United Arab Emirates': '🇦🇪', 'Qatar': '🇶🇦', 'Turkey': '🇹🇷', 'Brazil': '🇧🇷',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Russia': '🇷🇺', 'India': '🇮🇳', 'Switzerland': '🇨🇭',
  'Belgium': '🇧🇪', 'Portugal': '🇵🇹', 'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Finland': '🇫🇮' }

// ─── AircraftCard ─────────────────────────────────────────────────────────────
function AircraftCard({ ac, userLat, userLon, selected, onSelect }) {
  const dist = userLat != null ? Math.round(distance(userLat, userLon, ac.lat, ac.lon)) : null
  const bear = userLat != null ? bearing(userLat, userLon, ac.lat, ac.lon) : null
  const flag = FLAGS[ac.country] || '✈️'
  const isSelected = selected?.icao === ac.icao
  const isClimbing = ac.vertRate != null && ac.vertRate > 100
  const isDescending = ac.vertRate != null && ac.vertRate < -100

  return (
    <button
      onClick={() => onSelect(isSelected ? null : ac)}
      style={{
        width: '100%', textAlign: 'left', padding: '16px 16px',
        borderRadius: 16, cursor: 'pointer',
        background: isSelected ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.07)'}`,
        marginBottom: 12, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isSelected ? '0 0 20px rgba(0,255,136,0.1)' : 'none',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isSelected ? 14 : 0 }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: ac.onGround ? 'rgba(100,116,139,0.15)' : 'rgba(0,255,136,0.12)',
          border: `1px solid ${ac.onGround ? 'rgba(100,116,139,0.25)' : 'rgba(0,255,136,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {ac.heading != null
            ? <HeadingArrow deg={ac.heading} color={ac.onGround ? 'var(--t3)' : 'var(--green)'} size={22} />
            : <Plane size={20} color={ac.onGround ? 'var(--t3)' : 'var(--green)'} />}
          {isClimbing && (
            <div style={{
              position: 'absolute', top: 4, right: 4,
              width: 12, height: 12, borderRadius: '50%',
              background: 'rgba(0,255,136,0.8)', animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          )}
          {isDescending && (
            <div style={{
              position: 'absolute', top: 4, right: 4,
              width: 12, height: 12, borderRadius: '50%',
              background: 'rgba(255,0,0,0.8)', animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{ac.callsign}</span>
            <span style={{ fontSize: 12 }}>{flag}</span>
            {ac.onGround && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 7px', borderRadius: 6,
                background: 'rgba(100,116,139,0.2)', border: '1px solid rgba(100,116,139,0.3)',
                color: 'var(--t3)', letterSpacing: '0.05em',
              }}>
                SOL
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--t2)', margin: 0 }}>
            {ac.country}{ac.altitude != null && !ac.onGround ? ` · ${ac.altitude.toLocaleString()} ft` : ' · Au sol'}
          </p>
        </div>

        {/* Distance & Speed */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {dist != null && (
            <p style={{
              fontSize: 15, fontWeight: 700, color: 'var(--green)',
              margin: 0, lineHeight: 1.2,
            }}>
              {dist} km
            </p>
          )}
          {ac.speed != null && (
            <p style={{
              fontSize: 13, color: 'var(--t2)',
              margin: '4px 0 0', lineHeight: 1.2,
            }}>
              {ac.speed} kt
            </p>
          )}
        </div>
      </div>

      {/* Direction indicator */}
      {bear != null && (
        <div style={{