import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)
const KEY = 'trackr_settings_v2'

export const THEMES = {
  violet: { id: 'violet', name: 'Violet', primary: '#6366f1', secondary: '#8b5cf6' },
  emerald: { id: 'emerald', name: 'Émeraude', primary: '#10b981', secondary: '#059669' },
  rose: { id: 'rose', name: 'Rose', primary: '#f43f5e', secondary: '#ec4899' },
  cyan: { id: 'cyan', name: 'Cyan', primary: '#06b6d4', secondary: '#0891b2' },
  amber: { id: 'amber', name: 'Or', primary: '#f59e0b', secondary: '#d97706' },
  blue: { id: 'blue', name: 'Bleu', primary: '#3b82f6', secondary: '#1d4ed8' },
  lime: { id: 'lime', name: 'Lime', primary: '#84cc16', secondary: '#65a30d' },
  orange: { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
}

export const PATTERNS = {
  none: { id: 'none', name: 'Aucun', class: 'pattern-none' },
  dots: { id: 'dots', name: 'Points', class: 'pattern-dots' },
  grid: { id: 'grid', name: 'Grille', class: 'pattern-grid' },
  circuit: { id: 'circuit', name: 'Circuit', class: 'pattern-circuit' },
  hex: { id: 'hex', name: 'Hexagones', class: 'pattern-hex' },
}

const defaultSettings = {
  themeId: 'violet',
  patternId: 'dots',
  fontSize: 14, // px
  profileName: '',
  profilePhoto: null,
  notificationsEnabled: false,
  notificationPermission: 'default',
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(KEY)
      return s ? { ...defaultSettings, ...JSON.parse(s) } : defaultSettings
    } catch { return defaultSettings }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
    const t = THEMES[settings.themeId] || THEMES.violet
    document.documentElement.style.setProperty('--color-primary', t.primary)
    document.documentElement.style.setProperty('--color-secondary', t.secondary)
    document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px')
  }, [settings])

  useEffect(() => {
    const t = THEMES[settings.themeId] || THEMES.violet
    document.documentElement.style.setProperty('--color-primary', t.primary)
    document.documentElement.style.setProperty('--color-secondary', t.secondary)
    document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px')
  }, [])

  const upd = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  async function toggleNotifications() {
    if (settings.notificationsEnabled) {
      upd('notificationsEnabled', false)
      return
    }
    if (!('Notification' in window)) {
      alert("Votre navigateur ne supporte pas les notifications.")
      return
    }
    let perm = Notification.permission
    if (perm === 'default') {
      perm = await Notification.requestPermission()
    }
    if (perm === 'granted') {
      upd('notificationsEnabled', true)
      upd('notificationPermission', 'granted')
      new Notification('Trackr — Notifications activées ✓', {
        body: 'Vous recevrez les alertes de prix.',
        icon: '/icon-192.png',
      })
    } else {
      upd('notificationPermission', perm)
      if (perm === 'denied') {
        alert("Notifications bloquées. Allez dans Paramètres > Navigateur > Notifications pour les activer.")
      }
    }
  }

  function getStorageInfo() {
    try {
      let bytes = 0
      for (const k of Object.keys(localStorage)) bytes += (localStorage.getItem(k)?.length ?? 0) * 2
      const kb = (bytes / 1024).toFixed(1)
      const mb = (bytes / 1024 / 1024).toFixed(2)
      return { bytes, kb, mb, keys: Object.keys(localStorage).length }
    } catch { return { bytes: 0, kb: '0', mb: '0', keys: 0 } }
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      theme: THEMES[settings.themeId] || THEMES.violet,
      pattern: PATTERNS[settings.patternId] || PATTERNS.dots,
      setTheme: v => upd('themeId', v),
      setPattern: v => upd('patternId', v),
      setFontSize: v => upd('fontSize', v),
      setProfileName: v => upd('profileName', v),
      setProfilePhoto: v => upd('profilePhoto', v),
      toggleNotifications,
      getStorageInfo,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() { return useContext(SettingsContext) }
