import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'

function Markets() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'crypto' ? 'crypto' : 'stocks')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTab(params.get('tab') === 'crypto' ? 'crypto' : 'stocks')
  }, [params])

  function switchTab(id) {
    setTab(id)
    if (id === 'crypto') setParams({ tab: 'crypto' })
    else setParams({})
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] font-[JetBrains_Mono] text-[var(--text-primary)]">
      {/* Sticky sub-tab header */}
      <div
        className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface-low)] px-4 py-2"
        style={{ paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex gap-1 rounded-full bg-[var(--surface)] p-1">
          {[
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all duration-200 ${tab === t.id ? 'bg-[var(--surface-high)] text-[var(--neon)] shadow-[0_0_8px_var(--neon)]' : 'text-[var(--text-secondary)]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="sticky top-[60px] z-10 bg-[var(--bg)] px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg bg-[var(--surface)] py-2 pl-10 pr-4 text-sm outline-none placeholder:text-[var(--text-muted)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {tab === 'stocks' ? <Stocks inMarkets search={search} /> : <Crypto search={search} />}
    </div>
  )
}

export default Markets