
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGlobalSearch } from '../hooks/useGlobalSearch'

const categoryConfig = {
  page: {
    label: 'Page',
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  market: {
    label: 'Market',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    )
  },
  asset: {
    label: 'Asset',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  }
}

function HighlightText({ text, query }) {
  if (!query || !text) return <span>{text}</span>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-violet-500/30 text-white rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

export default function GlobalSearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const { results, query, isLoading } = useGlobalSearch(inputValue)

  const openSearch = useCallback(() => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setInputValue('')
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          closeSearch()
        } else {
          openSearch()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        closeSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, openSearch, closeSearch])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeSearch()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeSearch])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleKeyNavigation = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = results[selectedIndex]
      if (selected) handleSelect(selected)
    }
  }

  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const items = listRef.current.querySelectorAll('[data-result-item]')
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex, results])

  const handleSelect = useCallback((item) => {
    closeSearch()
    if (item.path) {
      navigate(item.path)
    }
  }, [closeSearch, navigate])

  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const flatResults = Object.values(groupedResults).flat()

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="relative z-50"
        role="search"
        aria-label="Global search"
      >
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-white/50 hover:text-white/70 text-sm min-w-[180px] group"
          aria-label="Open search (Ctrl+K)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span className="flex-1 text-left hidden sm:block">Search...</span>
          <span className="hidden sm:flex items-center gap-0.5 ml-auto">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/30 group-hover:text-white/50 transition-colors">
              ⌘K
            </kbd>
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[min(520px,calc(100vw-32px))] bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
              style={{ transformOrigin: 'top center' }}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`flex-shrink-0 transition-colors duration-200 ${isLoading ? 'text-violet-400' : 'text-white/30'}`}
                >
                  {isLoading ? (
                    <motion.circle
                      cx="12" cy="12" r="10"
                      strokeDasharray="32"
                      animate={{ strokeDashoffset: [0, -64] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </>
                  )}
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyNavigation}
                  placeholder="Search pages, markets, assets..."
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-autocomplete="list"
                  aria-controls="search-results"
                  aria-activedescendant={results[selectedIndex] ? `result-${results[selectedIndex].id}` : undefined}
                />
                {inputValue && (
                  <button
                    onClick={() => setInputValue('')}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                    aria-label="Clear search"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
                <kbd
                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={closeSearch}
                >
                  ESC
                </kbd>
              </div>

              <div
                ref={listRef}
                id="search-results"
                role="listbox"
                className="max-h-[400px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
              >
                {!inputValue && (
                  <div className="px-4 py-8 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                    <p className="text-white/30 text-sm">Type to search across all content</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      {Object.entries(categoryConfig).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inputValue && isLoading && (
                  <div className="px-4 py-6 flex items-center justify-center gap-2 text-white/30 text-sm">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    </motion.div>
                    Searching...
                  </div>
                )}

                {inputValue && !isLoading && results.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                    <p className="text-white/30 text-sm">No results for</p>
                    <p className="text-white/50 text-sm font-medium mt-1">"{inputValue}"</p>
                  </div>
                )}

                {inputValue && !isLoading && results.length > 0 && (
                  <div className="py-2">
                    {Object.entries(groupedResults).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-4 py-1.5 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryConfig[category]?.color || 'bg-white/10 text-white/40 border-white/10'}`}>
                            {categoryConfig[category]?.icon}
                            {categoryConfig[category]?.label || category}
                          </span>
                          <div className="flex-1 h-px bg-white/[0.04]" />
                          <span className="text-[10px] text-white/20">{items.length}</span>
                        </div>
                        {items.map((item) => {
                          const flatIndex = flatResults.findIndex((r) => r.id === item.id)
                          const isSelected = flatIndex === selectedIndex
                          return (
                            <motion.button
                              key={item.id}
                              id={`result-${item.id}`}
                              data-result-item
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              initial={false}
                              animate={{
                                backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'rgba(0,0,0,0)'
                              }}
                              transition={{ duration: 0.1 }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left group relative"
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="search-selection"
                                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-white/[0.04]"
                                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                />
                              )}
                              <div className={`relative flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${categoryConfig[category]?.color || 'bg-white/5 text-white/30 border-white/10'}`}>
                                {item.icon || categoryConfig[category]?.icon}
                              </div>
                              <div className="relative flex-1 min-w-0">
                                <div className="text-sm text-white/90 font-medium truncate">
                                  <HighlightText text={item.title} query={query} />
                                </div>
                                {item.subtitle && (
                                  <div className="text-xs text-white/35 truncate mt-0.5">
                                    <HighlightText text={item.subtitle} query={query} />
                                  </div>
                                )}
                              </div>
                              {item.meta && (
                                <div className="relative flex-shrink-0 text-xs font-mono text-white/30 group-hover:text-white/50 transition-colors">
                                  {item.meta}
                                </div>
                              )}
                              {isSelected && (
                                <div className="relative flex-shrink-0">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400">
                                    <polyline points="9 18 15 12 9 6"/>
                                  </svg>
                                </div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-white/[0.06