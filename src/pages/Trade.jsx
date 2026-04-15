import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowUpDown, ChevronDown, Search,
  Loader2, CheckCircle, AlertCircle, ExternalLink,
  Wallet, RefreshCw, Settings, X, Shield,
} from 'lucide-react'

// ─── Token lists ──────────────────────────────────────────────────────────────
const SOL_TOKENS = [
  { mint: 'So11111111111111111111111111111111111111112', decimals: 9,  symbol: 'SOL',  name: 'Solana',         color: '#9945FF', logo: '◎', cgId: 'solana' },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, symbol: 'USDC', name: 'USD Coin',      color: '#2775CA', logo: '$', cgId: 'usd-coin' },
  { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, symbol: 'USDT', name: 'Tether',         color: '#26A17B', logo: '₮', cgId: 'tether' },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6,  symbol: 'JUP',  name: 'Jupiter',        color: '#C7F284', logo: '♃', cgId: 'jupiter-exchange-solana' },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, symbol: 'BONK', name: 'Bonk',          color: '#FC8C00', logo: '🐕', cgId: 'bonk' },
  { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, symbol: 'WIF',  name: 'dogwifhat',     color: '#E8834C', logo: '🎩', cgId: 'dogwifcoin' },
  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6, symbol: 'RAY',  name: 'Raydium',        color: '#5AC4BE', logo: '◈', cgId: 'raydium' },
  { mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6, symbol: 'PYTH', name: 'Pyth Network',   color: '#9B7DFF', logo: '🔮', cgId: 'pyth-network' },
  { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', decimals: 9, symbol: 'mSOL', name: 'Marinade SOL',   color: '#00B0CA', logo: '🧊', cgId: 'msol' },
  { mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', decimals: 9, symbol: 'jitoSOL', name: 'Jito SOL',  color: '#84CC16', logo: '🟢', cgId: 'jito-staked-sol' },
]

const ETH_TOKENS = [
  { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, symbol: 'ETH',   name: 'Ethereum',      color: '#627EEA', logo: 'Ξ',  cgId: 'ethereum' },
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6,  symbol: 'USDC',  name: 'USD Coin',      color: '#2775CA', logo: '$',  cgId: 'usd-coin' },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6,  symbol: 'USDT',  name: 'Tether',        color: '#26A17B', logo: '₮',  cgId: 'tether' },
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8,  symbol: 'WBTC',  name: 'Wrapped BTC',   color: '#F7931A', logo: '₿',  cgId: 'wrapped-bitcoin' },
  { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, symbol: 'LINK',  name: 'Chainlink',     color: '#375BD2', logo: '⬡',  cgId: 'chainlink' },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDAaDdC4201F984', decimals: 18, symbol: 'UNI',  name: 'Uniswap',       color: '#FF007A', logo: '🦄', cgId: 'uniswap' },
  { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18, symbol: 'AAVE',  name: 'Aave',          color: '#B6509E', logo: '👻', cgId: 'aave' },
  { address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18, symbol: 'stETH', name: 'Lido stETH',    color: '#00A3FF', logo: '🔷', cgId: 'staked-ether' },
  { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', decimals: 18, symbol: 'CRV',   name: 'Curve DAO',     color: '#ED1B41', logo: '↗',  cgId: 'curve-dao-token' },
  { address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', decimals: 18, symbol: 'ENS',   name: 'ENS',           color: '#5284FF', logo: '🔷', cgId: 'ethereum-name-service' },
]

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com'

// ─── Wallet helpers ───────────────────────────────────────────────────────────
async function connectPhantom() {
  if (!window.solana?.isPhantom) throw new Error('Phantom non installé. Installe l\'extension Phantom.')
  const res = await window.solana.connect()
  return res.publicKey.toString()
}

async function connectMetaMask() {
  if (!window.ethereum) throw new Error('MetaMask non installé. Installe l\'extension MetaMask.')
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts[0]
}

// ─── Balance helpers ──────────────────────────────────────────────────────────
async function getSolBalance(pk) {
  const r = await fetch(SOLANA_RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [pk] }) })
  const d = await r.json()
  return (d.result?.value || 0) / 1e9
}

async function getSplTokenAccounts(pk) {
  const r = await fetch(SOLANA_RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenAccountsByOwner', params: [pk, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }] }) })
  const d = await r.json()
  return d.result?.value || []
}

async function getEthBalance(addr) {
  const r = await window.ethereum.request({ method: 'eth_getBalance', params: [addr, 'latest'] })
  return parseInt(r, 16) / 1e18
}

async function getErc20Balance(addr, tokenAddr, decimals) {
  const data = '0x70a08231' + addr.slice(2).padStart(64, '0')
  const r = await window.ethereum.request({ method: 'eth_call', params: [{ to: tokenAddr, data }, 'latest'] })
  return parseInt(r, 16) / Math.pow(10, decimals)
}

async function fetchTokenPrices(cgIds) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${[...new Set(cgIds)].join(',')}&vs_currencies=usd`)
    return await r.json()
  } catch { return {} }
}

// ─── Jupiter (Solana) ─────────────────────────────────────────────────────────
async function jupiterQuote(inputMint, outputMint, amountLamports, slippageBps) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`
  const r = await fetch(url)
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || 'Quote Jupiter indisponible') }
  return r.json()
}

async function jupiterSwap(quoteResponse, userPublicKey) {
  const r = await fetch('https://quote-api.jup.ag/v6/swap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quoteResponse, userPublicKey, wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true, prioritizationFeeLamports: 'auto' }) })
  const { swapTransaction, error } = await r.json()
  if (error) throw new Error(error)

  // Load @solana/web3.js from CDN (lazy)
  if (!window.solanaWeb3) {
    await new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/@solana/web3.js@1.95.8/lib/index.iife.min.js'
      s.onload = res; s.onerror = rej
      document.head.appendChild(s)
    })
  }
  const { VersionedTransaction, Connection } = window.solanaWeb3
  const conn = new Connection(SOLANA_RPC, 'confirmed')
  const txBytes = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0))
  const tx = VersionedTransaction.deserialize(txBytes)
  const { signature } = await window.solana.signAndSendTransaction(tx)
  await conn.confirmTransaction(signature, 'confirmed')
  return signature
}

// ─── Paraswap (Ethereum) ──────────────────────────────────────────────────────
async function paraswapQuote(srcToken, destToken, amount, srcDec, destDec, userAddress) {
  const url = `https://apiv5.paraswap.io/prices?srcToken=${srcToken}&destToken=${destToken}&amount=${amount}&srcDecimals=${srcDec}&destDecimals=${destDec}&network=1&userAddress=${userAddress}`
  const r = await fetch(url)
  if (!r.ok) throw new Error('Quote ETH indisponible')
  const d = await r.json()
  if (!d.priceRoute) throw new Error(d.error || 'Pas de route disponible')
  return d.priceRoute
}

async function paraswapSwap(priceRoute, userAddress, srcAmount, destAmount) {
  const r = await fetch('https://apiv5.paraswap.io/transactions/1?ignoreChecks=true', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ srcToken: priceRoute.srcToken, destToken: priceRoute.destToken, srcAmount, destAmount, priceRoute, userAddress, partner: 'trackr', slippage: 100 }) })
  const tx = await r.json()
  if (tx.error) throw new Error(tx.error)
  return window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: userAddress, to: tx.to, data: tx.data, value: tx.value || '0x0', gas: tx.gas }] })
}

// ─── Token Selector Modal ─────────────────────────────────────────────────────
function TokenModal({ tokens, onSelect, onClose, balances, prices }) {
  const [q, setQ] = useState('')
  const filtered = tokens.filter(t => t.symbol.toLowerCase().includes(q.toLowerCase()) || t.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', maxHeight: '72vh', background: '#0d0d1a', borderRadius: '24px 24px 0 0', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={16} color="#4b5563" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Chercher un token…" autoFocus style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontFamily: 'inherit' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}><X size={18} /></button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(t => {
            const bal = balances?.[t.mint || t.address] || 0
            const price = prices?.[t.cgId]?.usd || 0
            return (
              <button key={t.symbol} onClick={() => { onSelect(t); onClose() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color + '22', border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{t.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{t.symbol}</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>{t.name}</div>
                </div>
                {bal > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{bal < 0.001 ? bal.toExponential(2) : bal.toFixed(4)}</div>
                    {price > 0 && <div style={{ fontSize: 11, color: '#4b5563' }}>${(bal * price).toFixed(2)}</div>}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Trade() {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState(null)
  const [network, setNetwork] = useState('solana')
  const [balances, setBalances] = useState({})
  const [prices, setPrices] = useState({})
  const [loadingBal, setLoadingBal] = useState(false)
  const [connectErr, setConnectErr] = useState(null)

  const [fromToken, setFromToken] = useState(SOL_TOKENS[0])
  const [toToken, setToToken] = useState(SOL_TOKENS[1])
  const [fromAmount, setFromAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const [showFrom, setShowFrom] = useState(false)
  const [showTo, setShowTo] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [showSlip, setShowSlip] = useState(false)

  const [txStatus, setTxStatus] = useState(null)
  const [txHash, setTxHash] = useState(null)
  const [txErr, setTxErr] = useState(null)

  const quoteTimer = useRef(null)
  const tokens = network === 'solana' ? SOL_TOKENS : ETH_TOKENS

  useEffect(() => {
    const tks = network === 'solana' ? SOL_TOKENS : ETH_TOKENS
    setFromToken(tks[0]); setToToken(tks[1])
    setQuote(null); setFromAmount('')
  }, [network])

  useEffect(() => {
    if (wallet) loadBalances()
  }, [wallet, network])

  async function loadBalances() {
    setLoadingBal(true)
    try {
      const bals = {}, cgIds = []
      if (network === 'solana') {
        bals[SOL_TOKENS[0].mint] = await getSolBalance(wallet.address)
        cgIds.push('solana')
        const accs = await getSplTokenAccounts(wallet.address)
        for (const acc of accs) {
          const { mint, tokenAmount } = acc.account.data.parsed.info
          const tok = SOL_TOKENS.find(t => t.mint === mint)
          if (tok && tokenAmount.uiAmount > 0) { bals[mint] = tokenAmount.uiAmount; if (!cgIds.includes(tok.cgId)) cgIds.push(tok.cgId) }
        }
      } else {
        bals[ETH_TOKENS[0].address] = await getEthBalance(wallet.address)
        cgIds.push('ethereum')
        for (const tok of ETH_TOKENS.slice(1, 6)) {
          try { const b = await getErc20Balance(wallet.address, tok.address, tok.decimals); if (b > 0) { bals[tok.address] = b; cgIds.push(tok.cgId) } } catch {}
        }
      }
      setBalances(bals)
      const p = await fetchTokenPrices(cgIds)
      setPrices(p)
    } catch (e) { console.error(e) } finally { setLoadingBal(false) }
  }

  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current)
    if (!fromAmount || !fromToken || !toToken || !wallet) { setQuote(null); return }
    quoteTimer.current = setTimeout(fetchQuote, 700)
    return () => clearTimeout(quoteTimer.current)
  }, [fromAmount, fromToken, toToken])

  async function fetchQuote() {
    const amt = parseFloat(fromAmount)
    if (!amt || amt <= 0) return
    setQuoteLoading(true)
    try {
      const slipBps = Math.round(slippage * 100)
      if (network === 'solana') {
        const lamports = Math.round(amt * Math.pow(10, fromToken.decimals))
        const q = await jupiterQuote(fromToken.mint, toToken.mint, lamports, slipBps)
        setQuote({ outAmount: parseInt(q.outAmount) / Math.pow(10, toToken.decimals), priceImpact: q.priceImpactPct, raw: q })
      } else {
        const amtRaw = BigInt(Math.round(amt * Math.pow(10, fromToken.decimals))).toString()
        const pr = await paraswapQuote(fromToken.address, toToken.address, amtRaw, fromToken.decimals, toToken.decimals, wallet.address)
        setQuote({ outAmount: parseInt(pr.destAmount) / Math.pow(10, toToken.decimals), gasCostUSD: pr.gasCostUSD, raw: pr })
      }
    } catch (e) { setQuote({ error: e.message }) } finally { setQuoteLoading(false) }
  }

  async function handleConnect(type) {
    setConnectErr(null)
    try {
      const address = type === 'phantom' ? await connectPhantom() : await connectMetaMask()
      setWallet({ type, address })
      setNetwork(type === 'phantom' ? 'solana' : 'ethereum')
    } catch (e) { setConnectErr(e.message) }
  }

  async function handleSwap() {
    if (!quote || quote.error || !fromAmount) return
    setTxStatus('pending'); setTxErr(null); setTxHash(null)
    try {
      let hash
      if (network === 'solana') {
        hash = await jupiterSwap(quote.raw, wallet.address)
      } else {
        const amtRaw = BigInt(Math.round(parseFloat(fromAmount) * Math.pow(10, fromToken.decimals))).toString()
        const minOut = BigInt(Math.round(quote.outAmount * (1 - slippage / 100) * Math.pow(10, toToken.decimals))).toString()
        hash = await paraswapSwap(quote.raw, wallet.address, amtRaw, minOut)
      }
      setTxHash(hash); setTxStatus('success')
      setFromAmount(''); setQuote(null)
      setTimeout(loadBalances, 4000)
    } catch (e) { setTxErr(e.message); setTxStatus('error') }
  }

  function flip() { const t = fromToken; setFromToken(toToken); setToToken(t); setFromAmount(''); setQuote(null) }

  const fromBal = balances[fromToken?.mint || fromToken?.address] || 0
  const toBal = balances[toToken?.mint || toToken?.address] || 0
  const fromPrice = prices[fromToken?.cgId]?.usd || 0
  const fromUSD = parseFloat(fromAmount || 0) * fromPrice
  const explorerBase = network === 'solana' ? 'https://solscan.io/tx/' : 'https://etherscan.io/tx/'
  const canSwap = quote && !quote.error && !quoteLoading && fromAmount && txStatus !== 'pending'

  return (
    <div style={{ minHeight: '100dvh', background: '#07070f', color: '#e2e8f0', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', paddingTop: 'max(14px, env(safe-area-inset-top, 0px))', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex' }}><ArrowLeft size={22} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Trade</div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>Jupiter · Paraswap · DEX aggregators</div>
        </div>
        {wallet && (
          <button onClick={() => setShowSlip(s => !s)} style={{ background: showSlip ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: '#9ca3af', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Settings size={13} /> {slippage}%
          </button>
        )}
      </div>

      <div style={{ padding: '0 16px', maxWidth: 480, margin: '0 auto' }}>

        {/* ── NOT CONNECTED ── */}
        {!wallet && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Wallet size={28} style={{ color: '#818cf8' }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 6 }}>Connecte ton wallet</div>
              <div style={{ fontSize: 14, color: '#4b5563' }}>Trading décentralisé — tes clés restent chez toi</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { id: 'phantom', emoji: '👻', label: 'Phantom', sub: 'Solana · SOL, USDC, JUP, BONK, WIF…', border: 'rgba(153,69,255,0.3)', bg: 'rgba(153,69,255,0.08)', sub_color: '#9945FF' },
                { id: 'metamask', emoji: '🦊', label: 'MetaMask', sub: 'Ethereum · ETH, USDC, USDT, WBTC…', border: 'rgba(245,130,0,0.3)', bg: 'rgba(245,130,0,0.08)', sub_color: '#f59e0b' },
              ].map(w => (
                <button key={w.id} onClick={() => handleConnect(w.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 20, background: w.bg, border: `1px solid ${w.border}`, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{w.emoji}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{w.label}</div>
                    <div style={{ fontSize: 12, color: w.sub_color, marginTop: 2 }}>{w.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {connectErr && <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>⚠️ {connectErr}</div>}

            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
              <Shield size={13} style={{ color: '#374151', marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>Tes clés privées ne quittent jamais ton wallet. Trackr n'y a pas accès. Les swaps sont exécutés directement par Jupiter (Solana) et Paraswap (Ethereum).</div>
            </div>
          </div>
        )}

        {/* ── CONNECTED ── */}
        {wallet && (
          <>
            {/* Wallet bar */}
            <div style={{ marginTop: 14, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{wallet.type === 'phantom' ? '👻' : '🦊'}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{wallet.type === 'phantom' ? 'Phantom' : 'MetaMask'}</div>
                  <div style={{ fontSize: 11, color: '#4b5563', fontFamily: 'monospace' }}>{wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={loadBalances} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>
                  {loadingBal ? <Loader2 size={12} style={{ animation: 'andySpin 1s linear infinite' }} /> : <RefreshCw size={12} />}
                </button>
                <button onClick={() => { setWallet(null); setBalances({}); setQuote(null) }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0 10px', height: 28, cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 600 }}>Déco</button>
              </div>
            </div>

            {/* Slippage panel */}
            {showSlip && (
              <div style={{ marginBottom: 12, padding: 14, borderRadius: 14, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 10, letterSpacing: '0.06em' }}>SLIPPAGE MAX</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0.1, 0.5, 1.0, 3.0].map(s => (
                    <button key={s} onClick={() => { setSlippage(s); setShowSlip(false) }} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: slippage === s ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)', background: slippage === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: slippage === s ? '#818cf8' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Balance strip */}
            {Object.keys(balances).length > 0 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
                {tokens.filter(t => (balances[t.mint || t.address] || 0) > 0).map(t => {
                  const b = balances[t.mint || t.address] || 0
                  const p = prices[t.cgId]?.usd || 0
                  return (
                    <div key={t.symbol} style={{ flexShrink: 0, padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: 10, color: t.color, fontWeight: 700 }}>{t.symbol}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{b < 0.01 ? b.toExponential(2) : b.toFixed(3)}</div>
                      {p > 0 && <div style={{ fontSize: 10, color: '#4b5563' }}>${(b * p).toFixed(2)}</div>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Swap box */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 14, marginBottom: 14 }}>

              {/* FROM */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>Tu vends</span>
                  {fromBal > 0 && <button onClick={() => setFromAmount(String(fromBal))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 11, fontWeight: 700 }}>MAX {fromBal.toFixed(4)}</button>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setShowFrom(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 12px', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: (fromToken?.color || '#fff') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{fromToken?.logo}</div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{fromToken?.symbol}</span>
                    <ChevronDown size={13} color="#4b5563" />
                  </button>
                  <input type="number" inputMode="decimal" value={fromAmount} onChange={e => setFromAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 22, fontWeight: 700, textAlign: 'right', fontFamily: 'inherit' }} />
                </div>
                {fromUSD > 0.01 && <div style={{ textAlign: 'right', fontSize: 12, color: '#4b5563', marginTop: 4 }}>≈ ${fromUSD.toFixed(2)}</div>}
              </div>

              {/* Flip */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-6px 0', position: 'relative', zIndex: 1 }}>
                <button onClick={flip} style={{ width: 34, height: 34, borderRadius: '50%', background: '#0d0d1a', border: '2px solid rgba(99,102,241,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <ArrowUpDown size={15} />
                </button>
              </div>

              {/* TO */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600 }}>Tu reçois</span>
                  {toBal > 0 && <span style={{ fontSize: 11, color: '#4b5563' }}>Solde: {toBal.toFixed(4)}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setShowTo(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 12px', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: (toToken?.color || '#fff') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{toToken?.logo}</div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{toToken?.symbol}</span>
                    <ChevronDown size={13} color="#4b5563" />
                  </button>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    {quoteLoading
                      ? <Loader2 size={18} style={{ color: '#4b5563', animation: 'andySpin 1s linear infinite', marginLeft: 'auto' }} />
                      : quote && !quote.error
                        ? <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{quote.outAmount < 0.0001 ? quote.outAmount.toExponential(4) : quote.outAmount.toFixed(Math.min(6, toToken?.decimals || 6))}</div>
                        : <div style={{ fontSize: 22, fontWeight: 700, color: '#374151' }}>—</div>}
                  </div>
                </div>
              </div>

              {/* Quote details */}
              {quote && !quote.error && (
                <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#4b5563' }}>Taux</span>
                    <span style={{ color: '#9ca3af' }}>1 {fromToken?.symbol} = {(quote.outAmount / parseFloat(fromAmount || 1)).toFixed(4)} {toToken?.symbol}</span>
                  </div>
                  {quote.priceImpact != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#4b5563' }}>Impact prix</span>
                      <span style={{ color: parseFloat(quote.priceImpact) > 2 ? '#ef4444' : parseFloat(quote.priceImpact) > 0.5 ? '#f59e0b' : '#10b981' }}>
                        {parseFloat(quote.priceImpact) < 0.01 ? '<0.01' : parseFloat(quote.priceImpact).toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {quote.gasCostUSD && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#4b5563' }}>Gas estimé</span>
                      <span style={{ color: '#9ca3af' }}>${parseFloat(quote.gasCostUSD).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {quote?.error && (
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 12 }}>
                  ⚠️ {quote.error}
                </div>
              )}
            </div>

            {/* Swap button */}
            <button onClick={handleSwap} disabled={!canSwap} style={{ width: '100%', padding: '17px', borderRadius: 20, border: 'none', background: canSwap ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.06)', color: canSwap ? 'white' : '#374151', fontSize: 16, fontWeight: 700, cursor: canSwap ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 200ms', marginBottom: 12 }}>
              {txStatus === 'pending'
                ? <><Loader2 size={18} style={{ animation: 'andySpin 1s linear infinite' }} /> Confirme dans ton wallet…</>
                : quoteLoading ? <><Loader2 size={18} style={{ animation: 'andySpin 1s linear infinite' }} /> Calcul…</>
                : !fromAmount ? 'Entre un montant'
                : !quote || quote.error ? 'Quote indisponible'
                : `Swapper ${fromToken?.symbol} → ${toToken?.symbol}`}
            </button>

            {/* TX result */}
            {txStatus === 'success' && (
              <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Swap réussi !</div>
                  {txHash && <div style={{ fontSize: 11, color: '#065f46', fontFamily: 'monospace', marginTop: 2 }}>{txHash.slice(0, 24)}…</div>}
                </div>
                {txHash && <a href={explorerBase + txHash} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', display: 'flex' }}><ExternalLink size={15} /></a>}
              </div>
            )}
            {txStatus === 'error' && (
              <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>Transaction échouée</div>
                  {txErr && <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 2 }}>{txErr}</div>}
                </div>
              </div>
            )}

            <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8 }}>
              <Shield size={12} style={{ color: '#374151', marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>
                {network === 'solana' ? 'Jupiter Aggregator — meilleur prix Solana · Phantom garde tes clés' : 'Paraswap — multi-DEX Ethereum · MetaMask garde tes clés'}
              </div>
            </div>
          </>
        )}
      </div>

      {showFrom && <TokenModal tokens={tokens} onSelect={t => { setFromToken(t); setQuote(null) }} onClose={() => setShowFrom(false)} balances={balances} prices={prices} />}
      {showTo && <TokenModal tokens={tokens} onSelect={t => { setToToken(t); setQuote(null) }} onClose={() => setShowTo(false)} balances={balances} prices={prices} />}

      <style>{`@keyframes andySpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
