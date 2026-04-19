import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)
const KEY = 'trackr_v3'

const defaultCategories = [
  { id: 'sneakers', name: 'Sneakers', icon: 'Footprints', color: '#6366f1', builtIn: true },
  { id: 'stocks', name: 'Actions', icon: 'TrendingUp', color: '#10b981', builtIn: true },
  { id: 'flights', name: 'Vols', icon: 'Plane', color: '#06b6d4', builtIn: true },
]

const defaultData = {
  categories: defaultCategories,
  sneakers: [],
  stocks: [],
  flights: [],
  cryptoHoldings: [], // { id, coinId, coinName, symbol, image, quantity, buyPrice, buyDate, salePrice, saleDate }
  stockWatchlist: [], // { symbol, name } — tracked without a position
  customItems: {},
  alerts: [], // { id, symbol, targetPrice, direction: 'above'|'below', triggered: false, name }
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem(KEY)
      const parsed = s ? JSON.parse(s) : defaultData
      if (!parsed.categories) parsed.categories = defaultCategories
      if (!parsed.customItems) parsed.customItems = {}
      if (!parsed.alerts) parsed.alerts = []
      if (!parsed.cryptoHoldings) parsed.cryptoHoldings = []
      if (!parsed.stockWatchlist) parsed.stockWatchlist = []
      if (!parsed.flights) parsed.flights = []
      // ensure flights category exists
      if (!parsed.categories.find(c => c.id === 'flights')) {
        parsed.categories.push({ id: 'flights', name: 'Vols', icon: 'Plane', color: '#06b6d4', builtIn: true })
      }
      return parsed
    } catch { return defaultData }
  })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)) }, [data])

  // CATEGORIES
  const addCategory = cat => setData(p => ({ ...p, categories: [...p.categories, { ...cat, id: 'cat_' + Date.now(), builtIn: false }], customItems: { ...p.customItems, ['cat_' + Date.now()]: [] } }))
  const updateCategory = (id, u) => setData(p => ({ ...p, categories: p.categories.map(c => c.id === id ? { ...c, ...u } : c) }))
  const deleteCategory = id => setData(p => { const { [id]: _, ...rest } = p.customItems; return { ...p, categories: p.categories.filter(c => c.id !== id), customItems: rest } })

  // SNEAKERS
  const addSneaker = i => setData(p => ({ ...p, sneakers: [...p.sneakers, { ...i, id: Date.now().toString() }] }))
  const updateSneaker = (id, u) => setData(p => ({ ...p, sneakers: p.sneakers.map(s => s.id === id ? { ...s, ...u } : s) }))
  const deleteSneaker = id => setData(p => ({ ...p, sneakers: p.sneakers.filter(s => s.id !== id) }))

  // STOCKS
  const addStock = i => setData(p => ({ ...p, stocks: [...p.stocks, { ...i, id: Date.now().toString() }] }))
  const updateStock = (id, u) => setData(p => ({ ...p, stocks: p.stocks.map(s => s.id === id ? { ...s, ...u } : s) }))
  const deleteStock = id => setData(p => ({ ...p, stocks: p.stocks.filter(s => s.id !== id) }))

  // CRYPTO HOLDINGS
  const addCryptoHolding = i => setData(p => ({ ...p, cryptoHoldings: [...p.cryptoHoldings, { ...i, id: Date.now().toString() }] }))
  const updateCryptoHolding = (id, u) => setData(p => ({ ...p, cryptoHoldings: p.cryptoHoldings.map(h => h.id === id ? { ...h, ...u } : h) }))
  const deleteCryptoHolding = id => setData(p => ({ ...p, cryptoHoldings: p.cryptoHoldings.filter(h => h.id !== id) }))

  // STOCK WATCHLIST
  const addToWatchlist = item => setData(p => ({
    ...p, stockWatchlist: p.stockWatchlist.find(w => w.symbol === item.symbol)
      ? p.stockWatchlist
      : [...p.stockWatchlist, { symbol: item.symbol, name: item.name || item.symbol }]
  }))
  const removeFromWatchlist = symbol => setData(p => ({
    ...p, stockWatchlist: p.stockWatchlist.filter(w => w.symbol !== symbol)
  }))

  // FLIGHTS
  const addFlight = i => setData(p => ({ ...p, flights: [...p.flights, { ...i, id: Date.now().toString() }] }))
  const updateFlight = (id, u) => setData(p => ({ ...p, flights: p.flights.map(f => f.id === id ? { ...f, ...u } : f) }))
  const deleteFlight = id => setData(p => ({ ...p, flights: p.flights.filter(f => f.id !== id) }))

  // CUSTOM
  const addCustomItem = (cid, i) => setData(p => ({ ...p, customItems: { ...p.customItems, [cid]: [...(p.customItems[cid] || []), { ...i, id: Date.now().toString() }] } }))
  const updateCustomItem = (cid, id, u) => setData(p => ({ ...p, customItems: { ...p.customItems, [cid]: (p.customItems[cid] || []).map(i => i.id === id ? { ...i, ...u } : i) } }))
  const deleteCustomItem = (cid, id) => setData(p => ({ ...p, customItems: { ...p.customItems, [cid]: (p.customItems[cid] || []).filter(i => i.id !== id) } }))

  // ALERTS
  const addAlert = a => setData(p => ({ ...p, alerts: [...p.alerts, { ...a, id: Date.now().toString(), triggered: false, createdAt: new Date().toISOString() }] }))
  const deleteAlert = id => setData(p => ({ ...p, alerts: p.alerts.filter(a => a.id !== id) }))
  const triggerAlert = id => setData(p => ({ ...p, alerts: p.alerts.map(a => a.id === id ? { ...a, triggered: true } : a) }))

  // EXPORT / IMPORT
  function exportData() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trackr-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  function importData(json) {
    try {
      const parsed = JSON.parse(json)
      if (!parsed.stocks && !parsed.sneakers) throw new Error('Invalid file')
      const merged = { ...defaultData, ...parsed }
      setData(merged)
      return true
    } catch { return false }
  }

  // RECENT SALES
  function getRecentSales(limit = 8) {
    const all = []
    const catMap = Object.fromEntries(data.categories.map(c => [c.id, c]))
    data.sneakers.filter(s => s.salePrice && s.saleDate).forEach(s =>
      all.push({ ...s, profit: s.salePrice - s.buyPrice, _cat: 'sneakers', _catName: 'Sneakers', _color: '#6366f1' }))
    data.stocks.filter(s => s.salePrice && s.saleDate).forEach(s =>
      all.push({ ...s, profit: (s.salePrice - s.buyPrice) * s.quantity, _cat: 'stocks', _catName: 'Actions', _color: '#10b981' }))
    Object.entries(data.customItems).forEach(([cid, items]) => {
      const cat = catMap[cid]; if (!cat) return
      items.filter(i => i.salePrice && i.saleDate).forEach(i =>
        all.push({ ...i, profit: (i.salePrice - i.buyPrice) * (i.quantity || 1), _cat: cid, _catName: cat.name, _color: cat.color }))
    })
    return all.sort((a, b) => a.saleDate < b.saleDate ? 1 : -1).slice(0, limit)
  }

  return (
    <AppContext.Provider value={{
      categories: data.categories, sneakers: data.sneakers, stocks: data.stocks,
      flights: data.flights, cryptoHoldings: data.cryptoHoldings, stockWatchlist: data.stockWatchlist,
      customItems: data.customItems, alerts: data.alerts,
      addToWatchlist, removeFromWatchlist,
      addCategory, updateCategory, deleteCategory,
      addSneaker, updateSneaker, deleteSneaker,
      addStock, updateStock, deleteStock,
      addFlight, updateFlight, deleteFlight,
      addCustomItem, updateCustomItem, deleteCustomItem,
      addCryptoHolding, updateCryptoHolding, deleteCryptoHolding,
      addAlert, deleteAlert, triggerAlert,
      getRecentSales, exportData, importData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
