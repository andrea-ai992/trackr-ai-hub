import { useState, useEffect } from 'react'

// ticker → company domain for Clearbit logo API
const DOMAINS = {
  // Mega-cap Tech
  AAPL: 'apple.com', MSFT: 'microsoft.com', NVDA: 'nvidia.com',
  GOOGL: 'google.com', GOOG: 'google.com', AMZN: 'amazon.com',
  META: 'meta.com', TSLA: 'tesla.com', AVGO: 'broadcom.com',
  ORCL: 'oracle.com', ADBE: 'adobe.com', CRM: 'salesforce.com',
  INTC: 'intel.com', CSCO: 'cisco.com', QCOM: 'qualcomm.com',
  AMD: 'amd.com', AMAT: 'appliedmaterials.com', TXN: 'ti.com',
  MU: 'micron.com', KLAC: 'kla.com', LRCX: 'lamresearch.com',
  SNPS: 'synopsys.com', CDNS: 'cadence.com',
  // Internet / Media
  NFLX: 'netflix.com', PYPL: 'paypal.com', UBER: 'uber.com',
  LYFT: 'lyft.com', SNAP: 'snap.com', PINS: 'pinterest.com',
  TWTR: 'twitter.com', SPOT: 'spotify.com', ROKU: 'roku.com',
  ABNB: 'airbnb.com', DASH: 'doordash.com', RBLX: 'roblox.com',
  // Finance
  'BRK-B': 'berkshirehathaway.com', 'BRK-A': 'berkshirehathaway.com',
  JPM: 'jpmorganchase.com', BAC: 'bankofamerica.com', WFC: 'wellsfargo.com',
  GS: 'goldmansachs.com', MS: 'morganstanley.com', C: 'citigroup.com',
  V: 'visa.com', MA: 'mastercard.com', AXP: 'americanexpress.com',
  BLK: 'blackrock.com', SCHW: 'schwab.com', COF: 'capitalone.com',
  // Healthcare
  UNH: 'unitedhealthgroup.com', JNJ: 'jnj.com', LLY: 'lilly.com',
  PFE: 'pfizer.com', ABBV: 'abbvie.com', MRK: 'merck.com',
  TMO: 'thermofisher.com', DHR: 'danaher.com', ABT: 'abbott.com',
  MDT: 'medtronic.com', ISRG: 'intuitivesurgical.com', CVS: 'cvshealth.com',
  // Retail / Consumer
  WMT: 'walmart.com', COST: 'costco.com', HD: 'homedepot.com',
  TGT: 'target.com', LOW: 'lowes.com', SBUX: 'starbucks.com',
  MCD: 'mcdonalds.com', YUM: 'yum.com', CMG: 'chipotle.com',
  NKE: 'nike.com', LULU: 'lululemon.com', TJX: 'tjx.com',
  AMZN: 'amazon.com', EBAY: 'ebay.com', ETSY: 'etsy.com',
  // Energy
  XOM: 'exxonmobil.com', CVX: 'chevron.com', COP: 'conocophillips.com',
  SLB: 'slb.com', EOG: 'eogresources.com', PXD: 'pioneernaturalresources.com',
  OXY: 'oxy.com', PSX: 'phillipsspecialties.com', VLO: 'valero.com',
  // Industrial
  BA: 'boeing.com', CAT: 'caterpillar.com', GE: 'ge.com',
  MMM: '3m.com', HON: 'honeywell.com', RTX: 'rtx.com',
  LMT: 'lockheedmartin.com', NOC: 'northropgrumman.com', GD: 'gd.com',
  WM: 'wm.com', RSG: 'republicservices.com', FDX: 'fedex.com',
  UPS: 'ups.com', CSX: 'csx.com', UNP: 'up.com',
  // Auto
  F: 'ford.com', GM: 'gm.com', RIVN: 'rivian.com', LCID: 'lucidmotors.com',
  // Telecom
  T: 'att.com', VZ: 'verizon.com', TMUS: 'tmobile.com',
  CMCSA: 'comcast.com', CHTR: 'charter.com',
  // Materials / Mining / Steel
  MT: 'arcelormittal.com', NUE: 'nucor.com', STLD: 'steeldynamics.com',
  FCX: 'fcx.com', NEM: 'newmont.com', AA: 'alcoa.com',
  CF: 'cfindustries.com', MOS: 'mosaicco.com',
  // ETFs / Funds
  SPY: 'ssga.com', QQQ: 'invesco.com', IWM: 'ishares.com',
  VTI: 'vanguard.com', VOO: 'vanguard.com', ARKK: 'ark-funds.com',
  GLD: 'spdrgoldshares.com', SLV: 'ishares.com',
  // Other
  BABA: 'alibabagroup.com', TSM: 'tsmc.com', ASML: 'asml.com',
  SAP: 'sap.com', TM: 'toyota.com', SONY: 'sony.com',
}

// Async fetch logo domain from Yahoo Finance assetProfile (cached per session)
const _domainCache = new Map()

async function resolveDomain(symbol) {
  if (DOMAINS[symbol]) return DOMAINS[symbol]
  if (_domainCache.has(symbol)) return _domainCache.get(symbol)
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile`,
      { signal: AbortSignal.timeout(6000) }
    )
    const json = await r.json()
    const website = json?.quoteSummary?.result?.[0]?.assetProfile?.website
    if (website) {
      const domain = new URL(website).hostname.replace(/^www\./, '')
      _domainCache.set(symbol, domain)
      return domain
    }
  } catch {}
  _domainCache.set(symbol, null)
  return null
}

// Deterministic color per ticker
const PALETTE = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899']
export function tickerColor(sym) {
  const fixed = { AAPL:'#6366f1',MSFT:'#0ea5e9',GOOGL:'#10b981',AMZN:'#f59e0b',TSLA:'#ef4444',META:'#3b82f6',NVDA:'#8b5cf6',JPM:'#0891b2',V:'#1d4ed8',MA:'#e11d48',XOM:'#d97706',LLY:'#06b6d4' }
  if (fixed[sym]) return fixed[sym]
  let h = 0; for (const c of (sym || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return PALETTE[h % PALETTE.length]
}

// ─── StockLogo component ──────────────────────────────────────────────────────
export default function StockLogo({ symbol, size = 40 }) {
  const [logoUrl, setLogoUrl] = useState(null)
  const [imgError, setImgError] = useState(false)
  const color = tickerColor(symbol)
  const radius = Math.round(size * 0.28)

  useEffect(() => {
    let cancelled = false
    setImgError(false)
    resolveDomain(symbol).then(domain => {
      if (!cancelled && domain) {
        setLogoUrl(`https://logo.clearbit.com/${domain}?size=${size * 2}`)
      }
    })
    return () => { cancelled = true }
  }, [symbol, size])

  if (logoUrl && !imgError) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={logoUrl}
          alt={symbol}
          onError={() => setImgError(true)}
          style={{ width: '80%', height: '80%', objectFit: 'contain' }}
        />
      </div>
    )
  }

  // Fallback: colored circle with initial
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: color + '20', border: `1.5px solid ${color}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 900, color,
    }}>
      {symbol?.replace('-', '')[0]}
    </div>
  )
}
