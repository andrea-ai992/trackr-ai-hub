import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Stocks from './Stocks'
import Crypto from './Crypto'

export default function Markets() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'crypto' ? 'crypto' : 'stocks')

  useEffect(() => {
    setTab(params.get('tab') === 'crypto' ? 'crypto' : 'stocks')
  }, [params])

  function switchTab(id) {
    setTab(id)
    if (id === 'crypto') setParams({ tab: 'crypto' })
    else setParams({})
  }

  return (
    <div>
      {/* Sticky sub-tab header */}
      <div
        className="sticky top-0 z-20 border-b border-white/[0.06]"
        style={{ background: '#111', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex px-4">
          {[
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className="flex-1 pb-3 text-sm font-semibold transition-all"
              style={{
                color: tab === t.id ? 'white' : '#6b7280',
                borderBottom: `2px solid ${tab === t.id ? 'var(--color-primary)' : 'transparent'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'stocks' ? <Stocks inMarkets /> : <Crypto />}
    </div>
  )
}
