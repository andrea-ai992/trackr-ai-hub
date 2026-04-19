import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Locate, Loader2, Plane, RefreshCw, Navigation, ArrowUp, Map, List } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
// OpenSky states: [icao24, callsign, origin_country, time_position, last_contact,
//   longitude, latitude, baro_altitude, on_ground, velocity, true_track,
//   vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
function parseState(s) {
  if (!s || s[5] == null || s[6] == null) return null
  return {
    icao: s[0],
    callsign: s[1]?.trim() || s[0]?.toUpperCase(),
    country: s[2],
    lon: s[5],
    lat: s[6],
    altitude: s[7] != null ? Math.round(s[7] * 3.28084) : null, // m → ft
    onGround: s[8],
    speed: s[9] != null ? Math.round(s[9] * 1.944) : null, // m/s → kt
    heading: s[10] != null ? Math.round(s[10]) : null,
    vertRate: s[11] != null ? Math.round(s[11] * 196.85) : null, // m/s → ft/min
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
function HeadingArrow({ deg, color = '#818cf8', size = 18 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ArrowUp size={size} color={color} style={{ transform: `rotate(${deg}deg)`, transition: 'transform 0.4s ease' }} />
    </div>
  )
}

// ─── Leaflet aircraft icon ────────────────────────────────────────────────────
function makeAcIcon(heading, onGround) {
  const color = onGround ? '#64748b' : '#818cf8'
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
    <circle cx="12" cy="12" r="10" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="#06b6d4"/>
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

  return (
    <button
      onClick={() => onSelect(isSelected ? null : ac)}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 18, cursor: 'pointer',
        background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
        marginBottom: 10, transition: 'all 200ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isSelected ? 12 : 0 }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: ac.onGround ? 'rgba(100,116,139,0.2)' : 'rgba(99,102,241,0.15)',
          border: `1px solid ${ac.onGround ? 'rgba(100,116,139,0.3)' : 'rgba(99,102,241,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {ac.heading != null
            ? <HeadingArrow deg={ac.heading} color={ac.onGround ? '#64748b' : '#818cf8'} size={20} />
            : <Plane size={18} color={ac.onGround ? '#64748b' : '#818cf8'} />}
        </div>
        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{ac.callsign}</span>
            <span style={{ fontSize: 12 }}>{flag}</span>
            {ac.onGround && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                background: 'rgba(100,116,139,0.2)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8' }}>
                SOL
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            {ac.country}{ac.altitude != null && !ac.onGround ? ` · ${ac.altitude.toLocaleString()} ft` : ''}
          </p>
        </div>
        {/* Distance */}
        {dist != null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#818cf8' }}>{dist} km</p>
            {bear != null && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 }}>
                <Navigation size={11} color="#4b5563" style={{ transform: `rotate(${bear-45}deg)` }} />
                <span style={{ fontSize: 11, color: '#4b5563' }}>{Math.round(bear)}°</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {isSelected && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { label: 'Altitude', val: ac.altitude != null ? `${ac.altitude.toLocaleString()} ft` : '—' },
            { label: 'Vitesse', val: ac.speed != null ? `${ac.speed} kt` : '—' },
            { label: 'Cap', val: ac.heading != null ? `${ac.heading}°` : '—' },
            { label: 'ICAO24', val: ac.icao?.toUpperCase() || '—' },
            { label: 'Pays', val: ac.country || '—' },
            { label: 'Vario', val: ac.vertRate != null ? `${ac.vertRate > 0 ? '+' : ''}${ac.vertRate} fpm` : '—' },
          ].map(({ label, val }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 10px',
            }}>
              <p style={{ fontSize: 10, color: '#4b5563', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{val}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}

// ─── Search result card ───────────────────────────────────────────────────────
function SearchResult({ ac, onSelect }) {
  const flag = FLAGS[ac.country] || '✈️'
  return (
    <button
      onClick={() => onSelect(ac)}
      style={{
        width: '100%', textAlign: 'left', padding: '12px 16px', cursor: 'pointer',
        background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {ac.heading != null
          ? <HeadingArrow deg={ac.heading} color="#818cf8" size={16} />
          : <Plane size={14} color="#818cf8" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{ac.callsign} <span style={{ fontSize: 12 }}>{flag}</span></p>
        <p style={{ fontSize: 12, color: '#6b7280' }}>
          {ac.country}{ac.altitude != null && !ac.onGround ? ` · ${ac.altitude.toLocaleString()} ft` : ' · Au sol'}
        </p>
      </div>
      {ac.speed != null && <p style={{ fontSize: 12, color: '#818cf8' }}>{ac.speed} kt</p>}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FlightTracker() {
  const [userLoc, setUserLoc] = useState(null)
  const [locError, setLocError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aircraft, setAircraft] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [radius, setRadius] = useState(100) // km
  const [lastUpdate, setLastUpdate] = useState(null)
  const [sortBy, setSortBy] = useState('dist') // 'dist' | 'alt' | 'speed'
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
  const searchRef = useRef(null)

  // ─── Get user location ──────────────────────────────────────────────────────
  function getLocation() {
    setLocError(null)
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLoading(false)
      },
      err => {
        setLocError('Localisation refusée. Activez la géolocalisation.')
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  // ─── Fetch aircraft around user ─────────────────────────────────────────────
  const fetchAround = useCallback(async (loc, km) => {
    if (!loc) return
    setLoading(true)
    const deg = km / 111
    const { lat, lon } = loc
    const url = `${OPENSKY}/states/all?lamin=${lat-deg}&lomin=${lon-deg}&lamax=${lat+deg}&lomax=${lon+deg}`
    const data = await fetchJSON(url)
    setLoading(false)
    if (!data?.states) { setAircraft([]); return }
    const parsed = data.states.map(parseState).filter(Boolean)
    setAircraft(parsed)
    setLastUpdate(new Date())
  }, [])

  // ─── Auto-fetch when location changes ──────────────────────────────────────
  useEffect(() => {
    if (userLoc) fetchAround(userLoc, radius)
  }, [userLoc, radius, fetchAround])

  // ─── Auto-refresh every 30s ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userLoc) return
    const id = setInterval(() => fetchAround(userLoc, radius), 30000)
    return () => clearInterval(id)
  }, [userLoc, radius, fetchAround])

  // ─── Search by callsign ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSearchResults([]); return }
    const q = search.trim().toUpperCase()
    setSearchLoading(true)
    // Search in currently loaded aircraft first
    const local = aircraft.filter(ac =>
      ac.callsign.toUpperCase().includes(q) || ac.icao.toUpperCase().includes(q)
    )
    if (local.length > 0) { setSearchResults(local.slice(0, 10)); setSearchLoading(false); return }
    // Otherwise search by callsign via API (all states, filter client-side)
    // OpenSky doesn't have a callsign search endpoint but we can search globally (no bounding box)
    fetchJSON(`${OPENSKY}/states/all`).then(data => {
      setSearchLoading(false)
      if (!data?.states) return
      const results = data.states
        .map(parseState)
        .filter(Boolean)
        .filter(ac => ac.callsign.toUpperCase().includes(q) || ac.icao.toUpperCase().includes(q))
        .slice(0, 10)
      setSearchResults(results)
    })
  }, [search, aircraft])

  // ─── Sort aircraft ──────────────────────────────────────────────────────────
  const sorted = [...aircraft]
    .filter(ac => !ac.onGround)
    .sort((a, b) => {
      if (sortBy === 'alt') return (b.altitude || 0) - (a.altitude || 0)
      if (sortBy === 'speed') return (b.speed || 0) - (a.speed || 0)
      // dist
      if (userLoc) {
        return distance(userLoc.lat, userLoc.lon, a.lat, a.lon) - distance(userLoc.lat, userLoc.lon, b.lat, b.lon)
      }
      return 0
    })

  const onGround = aircraft.filter(ac => ac.onGround).length
  const inAir = aircraft.filter(ac => !ac.onGround).length

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 32px', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 2 }}>Flight Radar</h1>
          <p style={{ fontSize: 13, color: '#4b5563' }}>Avions autour de vous · OpenSky</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {userLoc && aircraft.length > 0 && (
            <button
              onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
              style={{
                padding: '8px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: viewMode === 'map' ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${viewMode === 'map' ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: viewMode === 'map' ? '#06b6d4' : '#9ca3af',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {viewMode === 'map' ? <List size={14} /> : <Map size={14} />}
              {viewMode === 'map' ? 'Liste' : 'Carte'}
            </button>
          )}
          <button
            onClick={() => userLoc ? fetchAround(userLoc, radius) : getLocation()}
            disabled={loading}
            style={{
              padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
            {userLoc ? 'Refresh' : 'Localiser'}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} color="#4b5563" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Chercher un vol (ex: AFR123, BA456…)"
          style={{
            width: '100%', padding: '13px 40px 13px 42px', borderRadius: 16, fontSize: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', outline: 'none', boxSizing: 'border-box',
          }}
        />
        {search && (
          <button onClick={() => { setSearch(''); setSearchResults([]) }} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4,
          }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search results */}
      {search.length >= 2 && (
        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          {searchLoading && (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <Loader2 size={20} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {!searchLoading && searchResults.length === 0 && (
            <p style={{ padding: '16px 20px', fontSize: 14, color: '#4b5563', textAlign: 'center' }}>Aucun vol trouvé pour "{search}"</p>
          )}
          {searchResults.map(ac => (
            <SearchResult key={ac.icao} ac={ac} onSelect={sel => { setSelected(sel); setSearch(''); setSearchResults([]) }} />
          ))}
        </div>
      )}

      {/* No location yet */}
      {!userLoc && !loading && (
        <div style={{
          borderRadius: 24, padding: '40px 24px', textAlign: 'center',
          background: 'rgba(255,255,255,0.02)', border: '1.5px dashed rgba(255,255,255,0.1)', marginBottom: 24,
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 22, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Locate size={28} color="#06b6d4" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Voir les vols autour de vous</p>
          <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 20, lineHeight: 1.5 }}>
            Autorisez la géolocalisation pour afficher les avions en temps réel dans votre zone.
          </p>
          <button
            onClick={getLocation}
            style={{
              padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', color: '#06b6d4',
            }}
          >
            Activer la localisation
          </button>
          {locError && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 12 }}>{locError}</p>}
        </div>
      )}

      {/* Location loading */}
      {loading && !userLoc && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Loader2 size={32} color="#818cf8" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: '#6b7280' }}>Chargement des données…</p>
        </div>
      )}

      {/* Stats bar */}
      {userLoc && aircraft.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'En vol', val: inAir, color: '#818cf8' },
              { label: 'Au sol', val: onGround, color: '#64748b' },
              { label: 'Rayon', val: `${radius} km`, color: '#06b6d4' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                borderRadius: 14, padding: '12px 14px', textAlign: 'center',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color }}>{val}</p>
                <p style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Radius selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[50, 100, 200, 500].map(r => (
              <button key={r} onClick={() => setRadius(r)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: radius === r ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${radius === r ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: radius === r ? '#06b6d4' : '#6b7280',
              }}>{r} km</button>
            ))}
          </div>

          {/* Sort tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'dist', label: 'Distance' },
              { id: 'alt', label: 'Altitude' },
              { id: 'speed', label: 'Vitesse' },
            ].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)} style={{
                padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: sortBy === s.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${sortBy === s.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: sortBy === s.id ? '#818cf8' : '#6b7280',
              }}>{s.label}</button>
            ))}
            {lastUpdate && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#374151', alignSelf: 'center' }}>
                {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          {/* MAP VIEW */}
          {viewMode === 'map' && userLoc && (
            <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, height: 420, border: '1px solid rgba(255,255,255,0.1)' }}>
              <MapContainer
                center={[userLoc.lat, userLoc.lon]}
                zoom={9}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <MapRecenter lat={userLoc.lat} lon={userLoc.lon} />
                {/* User position */}
                <Marker position={[userLoc.lat, userLoc.lon]} icon={makeUserIcon()}>
                  <Popup>Vous êtes ici</Popup>
                </Marker>
                {/* Aircraft */}
                {sorted.map(ac => (
                  <Marker
                    key={ac.icao}
                    position={[ac.lat, ac.lon]}
                    icon={makeAcIcon(ac.heading, ac.onGround)}
                    eventHandlers={{ click: () => setSelected(ac) }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'system-ui', minWidth: 140 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{ac.callsign}</div>
                        <div style={{ fontSize: 12, color: '#555' }}>{ac.country}</div>
                        {ac.altitude != null && <div style={{ fontSize: 12 }}>Alt: {ac.altitude.toLocaleString()} ft</div>}
                        {ac.speed != null && <div style={{ fontSize: 12 }}>Vitesse: {ac.speed} kt</div>}
                        {ac.heading != null && <div style={{ fontSize: 12 }}>Cap: {ac.heading}°</div>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && <>

          {/* Selected aircraft highlighted */}
          {selected && !aircraft.find(ac => ac.icao === selected.icao) && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: '#818cf8', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vol sélectionné</p>
              <AircraftCard ac={selected} userLat={userLoc?.lat} userLon={userLoc?.lon} selected={selected} onSelect={setSelected} />
            </div>
          )}

          {/* Aircraft list */}
          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Plane size={32} color="#374151" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: '#4b5563' }}>Aucun avion en vol dans ce rayon</p>
            </div>
          )}

          {sorted.map(ac => (
            <AircraftCard
              key={ac.icao}
              ac={ac}
              userLat={userLoc?.lat}
              userLon={userLoc?.lon}
              selected={selected}
              onSelect={setSelected}
            />
          ))}

          {onGround > 0 && (
            <p style={{ fontSize: 12, color: '#374151', textAlign: 'center', marginTop: 8 }}>
              + {onGround} appareil{onGround > 1 ? 's' : ''} au sol non affiché{onGround > 1 ? 's' : ''}
            </p>
          )}
          </>}
        </>
      )}

      {/* Loaded but empty */}
      {userLoc && !loading && aircraft.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Plane size={32} color="#374151" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: '#4b5563' }}>Aucun avion détecté dans {radius} km</p>
          <button onClick={() => setRadius(r => Math.min(r * 2, 500))} style={{
            marginTop: 12, padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8',
          }}>Élargir la zone</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
