import { useState, useCallback } from 'react'

const FLIGHT_CACHE = {}
const TTL = 60 * 1000

export function useFlight() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query) => {
    if (!query?.trim()) return
    const key = query.trim().toUpperCase()
    const cached = FLIGHT_CACHE[key]
    if (cached && Date.now() - cached.ts < TTL) { setResult(cached.data); return }
    setLoading(true); setError(null); setResult(null)
    try {
      // Try adsb.lol - free, no auth
      // First try callsign (flight number like AF001)
      // Then try registration (tail number like F-GSPA)
      let data = null

      // Try callsign
      const resCall = await fetch(`https://api.adsb.lol/v2/callsign/${key}`, { signal: AbortSignal.timeout(8000) })
      if (resCall.ok) {
        const json = await resCall.json()
        const ac = json.ac?.[0]
        if (ac) {
          data = parseAircraft(ac, key)
        }
      }

      // Fallback to registration
      if (!data) {
        const resReg = await fetch(`https://api.adsb.lol/v2/registration/${key}`, { signal: AbortSignal.timeout(8000) })
        if (resReg.ok) {
          const json = await resReg.json()
          const ac = json.ac?.[0]
          if (ac) data = parseAircraft(ac, key)
        }
      }

      if (!data) throw new Error('Vol non trouvé — vérifier le numéro de vol ou l\'immatriculation')
      FLIGHT_CACHE[key] = { data, ts: Date.now() }
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, search }
}

function parseAircraft(ac, query) {
  return {
    hex: ac.hex,
    callsign: ac.flight?.trim() || query,
    registration: ac.r || ac.reg || '—',
    type: ac.t || ac.type || 'Inconnu',
    description: ac.desc || '—',
    operator: ac.ownop || '—',
    altitude: ac.alt_baro != null ? `${ac.alt_baro.toLocaleString()} ft` : (ac.alt_geom != null ? `${ac.alt_geom.toLocaleString()} ft` : '—'),
    speed: ac.gs != null ? `${Math.round(ac.gs)} kts` : '—',
    heading: ac.track != null ? `${Math.round(ac.track)}°` : '—',
    lat: ac.lat,
    lon: ac.lon,
    origin: ac.orig || ac.from || '—',
    destination: ac.dest || ac.to || '—',
    status: ac.on_ground ? 'Au sol' : 'En vol',
    emergency: ac.emergency && ac.emergency !== 'none' ? ac.emergency : null,
    seen: ac.seen != null ? `Il y a ${Math.round(ac.seen)}s` : '—',
    category: ac.category || '—',
    squawk: ac.squawk || '—',
  }
}
