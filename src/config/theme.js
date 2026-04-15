// ─── White-label theme config ─────────────────────────────────────────────────
// Change these values to rebrand the app for a client/friend
// Then deploy a new Vercel project with VITE_APP_THEME=custom

const themes = {
  // Ton app (défaut)
  default: {
    appName:    'Trackr AI Hub',
    tagline:    '45 agents IA · 24/7',
    accentColor: '#6366f1',
    accentGlow:  'rgba(99,102,241,0.3)',
    andyColor:   '#8b5cf6',
    logo:        null,   // null = use Bot icon
    showAgents:  true,
    showMarkets: true,
    showFlights: true,
    showSneakers: true,
    primaryGradient: 'radial-gradient(circle, #6600ea 0%, transparent 70%)',
    secondaryGradient: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)',
  },

  // App pour ton pote — modifie ici
  friend: {
    appName:    'NexusAI',
    tagline:    'Ton assistant intelligent',
    accentColor: '#10b981',
    accentGlow:  'rgba(16,185,129,0.3)',
    andyColor:   '#06b6d4',
    logo:        null,
    showAgents:  true,
    showMarkets: true,
    showFlights: false,
    showSneakers: false,
    primaryGradient: 'radial-gradient(circle, #064e3b 0%, transparent 70%)',
    secondaryGradient: 'radial-gradient(circle, #0e7490 0%, transparent 70%)',
  },
}

const themeName = import.meta.env.VITE_APP_THEME || 'default'
export const theme = themes[themeName] || themes.default
export default theme
