// ─── AgentCore — Système d'agents autonomes embarqué dans l'app ───────────────
// Phase 4 du prompt Antigravity + Phase 2 du prompt Agents Autonomes
// Observer (always) + Analyst (5min) + Developer (on-demand) + Tester (after changes)

const AgentCore = {
  sessionId: Math.random().toString(36).slice(2),
  memory: [],
  MAX_ENTRIES: 500,
  STORAGE_KEY: 'trackr_agent_log',

  // ── Init ──────────────────────────────────────────────────────────────────
  init() {
    this.memory = this._loadMemory()
    this.agents.observer.hookFetch()
    this.agents.observer.hookErrors()
    this.agents.observer.hookNavigation()

    // Analyst runs every 5 minutes
    setInterval(() => this.agents.analyst.analyze(), 5 * 60 * 1000)

    // Tester runs every 10 minutes
    setInterval(() => this.agents.tester.runChecks(), 10 * 60 * 1000)

    this.track('system', 'AgentCore initialized', { sessionId: this.sessionId })
    console.log('[AgentCore] Online — Observer active, Analyst scheduled 5min')
  },

  track(event, label, data = {}) {
    const entry = {
      id: Date.now().toString(36),
      event, label, data,
      ts: Date.now(),
      session: this.sessionId,
    }
    this.memory.push(entry)
    if (this.memory.length > this.MAX_ENTRIES) this.memory.shift()
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memory)) } catch {}
    return entry
  },

  _loadMemory() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]') } catch { return [] }
  },

  getRecent(n = 100) {
    return this.memory.slice(-n).reverse()
  },

  // ── AGENT 1 — Observer (always running) ──────────────────────────────────
  agents: {
    observer: {
      tabSwitchStart: null,
      apiCallCount: {},
      errorCount: {},

      hookFetch() {
        const orig = window.fetch
        window.fetch = async (...args) => {
          const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
          const start = performance.now()
          try {
            const res = await orig(...args)
            const ms = Math.round(performance.now() - start)
            const host = new URL(url, window.location.href).hostname

            // Track API call
            AgentCore.apiCallCount = AgentCore.apiCallCount || {}
            AgentCore.apiCallCount[host] = (AgentCore.apiCallCount[host] || 0) + 1

            if (ms > 2000) {
              AgentCore.track('slow_api', `Slow API: ${host}`, { url: url.slice(0, 80), ms, status: res.status })
            }

            // Rate limit awareness: track per host
            const counts = AgentCore.apiCallCount
            if (counts[host] && counts[host] % 50 === 0) {
              AgentCore.track('rate_warning', `Rate limit approaching: ${host}`, { count: counts[host] })
            }

            return res
          } catch (e) {
            const ms = Math.round(performance.now() - start)
            AgentCore.track('api_error', `API error: ${url.slice(0, 60)}`, { error: e.message, ms })
            throw e
          }
        }
      },

      hookErrors() {
        window.onerror = (msg, src, line, col, err) => {
          AgentCore.track('js_error', msg, { src, line, col, stack: err?.stack?.slice(0, 200) })
        }
        window.addEventListener('unhandledrejection', e => {
          AgentCore.track('unhandled_rejection', String(e.reason).slice(0, 100), {})
        })
      },

      hookNavigation() {
        // Track tab/route switches
        const orig = window.history.pushState.bind(window.history)
        window.history.pushState = (...args) => {
          const start = performance.now()
          orig(...args)
          requestAnimationFrame(() => {
            const ms = Math.round(performance.now() - start)
            const path = window.location.pathname
            AgentCore.track('tab_switch', `→ ${path}`, { path, ms })
            if (ms > 300) {
              AgentCore.track('slow_tab', `Slow tab switch: ${path} (${ms}ms)`, { path, ms })
            }
          })
        }

        // Track memory usage
        if (performance.memory) {
          setInterval(() => {
            const mb = Math.round(performance.memory.usedJSHeapSize / 1048576)
            if (mb > 100) {
              AgentCore.track('memory_high', `High memory: ${mb}MB`, { mb })
            }
          }, 60000)
        }
      },

      trackTabSwitch(path) {
        AgentCore.track('tab_usage', path, { path })
      },
    },

    // ── AGENT 2 — Analyst (every 5 min) ────────────────────────────────────
    analyst: {
      analyze() {
        const logs = AgentCore.memory
        const now = Date.now()
        const last5min = logs.filter(l => now - l.ts < 5 * 60 * 1000)

        const report = {
          ts: now,
          period: '5min',
          apiErrors: last5min.filter(l => l.event === 'api_error').length,
          slowApis: last5min.filter(l => l.event === 'slow_api').length,
          slowTabs: last5min.filter(l => l.event === 'slow_tab').length,
          jsErrors: last5min.filter(l => l.event === 'js_error').length,
          recommendations: [],
        }

        // Auto-generate recommendations
        if (report.slowApis > 3) {
          report.recommendations.push({ type: 'slow_api', msg: 'Plusieurs API lentes détectées — augmenter le cache TTL', severity: 'high' })
        }
        if (report.apiErrors > 5) {
          report.recommendations.push({ type: 'high_error_rate', msg: 'Taux d\'erreur API élevé — ajouter retry avec backoff exponentiel', severity: 'critical' })
        }
        if (report.jsErrors > 0) {
          report.recommendations.push({ type: 'js_error', msg: `${report.jsErrors} erreur(s) JS — inspecter le dev panel`, severity: 'high' })
        }
        if (report.slowTabs > 2) {
          report.recommendations.push({ type: 'slow_tab', msg: 'Transitions de tabs lentes — activer lazy loading', severity: 'medium' })
        }

        AgentCore.track('analyst_report', 'Analyst report', report)

        // Store in window for dev panel
        window.__agentReport = report
        return report
      },

      showDevPanel() {
        window.__showAgentDevPanel?.()
      },
    },

    // ── AGENT 3 — Developer (on-demand) ────────────────────────────────────
    developer: {
      fixTemplates: {
        slow_api:       'Implement TTL cache for {endpoint} — réduction latence estimée 80%',
        high_error_rate:'Add exponential backoff retry for {endpoint}',
        layout_shift:   'Add explicit height to {element} to prevent CLS',
        large_payload:  'Paginate {endpoint} — limiter à 20 items par requête',
        memory_high:    'Cleanup unused refs and event listeners in {component}',
        slow_tab:       'Implement React.lazy() + Suspense for {path} route',
      },

      suggestFix(issue) {
        const template = this.fixTemplates[issue.type]
        if (!template) return `Analyse manuelle requise pour: ${issue.type}`
        return template.replace(/\{(\w+)\}/g, (_, k) => issue[k] || `[${k}]`)
      },

      getTopIssues() {
        const recent = AgentCore.getRecent(200)
        const counts = {}
        recent.forEach(l => { counts[l.event] = (counts[l.event] || 0) + 1 })
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => ({ type, count, fix: this.suggestFix({ type }) }))
      },
    },

    // ── AGENT 4 — Tester (after each change) ───────────────────────────────
    tester: {
      async runChecks() {
        const results = []

        // Check 1: No JS errors in last 60 seconds
        const recentErrors = AgentCore.memory.filter(
          e => e.event === 'js_error' && Date.now() - e.ts < 60000
        )
        results.push({ check: 'js_errors', errors: recentErrors.length, pass: recentErrors.length === 0 })

        // Check 2: localStorage not full
        try {
          const storageUsed = JSON.stringify(localStorage).length
          results.push({ check: 'storage', bytes: storageUsed, pass: storageUsed < 4_000_000 })
        } catch {
          results.push({ check: 'storage', pass: false, error: 'localStorage full or unavailable' })
        }

        // Check 3: No slow APIs in last 5 min
        const slowApis = AgentCore.memory.filter(
          e => e.event === 'slow_api' && Date.now() - e.ts < 5 * 60 * 1000
        )
        results.push({ check: 'api_speed', slowCount: slowApis.length, pass: slowApis.length < 3 })

        // Check 4: Memory usage
        if (performance.memory) {
          const mb = Math.round(performance.memory.usedJSHeapSize / 1048576)
          results.push({ check: 'memory', mb, pass: mb < 150 })
        }

        const allPass = results.every(r => r.pass)
        AgentCore.track('tester_run', allPass ? 'All checks passed' : 'Issues detected', { results })
        window.__testerResults = results
        return results
      },
    },
  },

  // ── Orchestrator — route text commands ───────────────────────────────────
  orchestrator: {
    keywords: {
      performance: ['vitesse', 'lent', 'latence', 'slow', 'fast', 'speed', 'lag', 'render', 'cache'],
      security:    ['securite', 'security', 'key', 'cle', 'hack', 'auth', 'token', 'expose', 'xss'],
      design:      ['design', 'ui', 'ux', 'mobile', 'visuel', 'couleur', 'card', 'layout', 'animation'],
      report:      ['rapport', 'report', 'resume', 'summary', 'stats', 'metrics'],
      status:      ['status', 'etat', 'health', 'check', 'state'],
      memory:      ['memory', 'memoire', 'learned', 'appris', 'history', 'log'],
    },

    classify(input) {
      const lower = input.toLowerCase()
      for (const [intent, words] of Object.entries(this.keywords)) {
        if (words.some(w => lower.includes(w))) return intent
      }
      return 'generic'
    },

    process(input) {
      const intent = this.classify(input)
      AgentCore.track('command', input.slice(0, 100), { intent })

      switch (intent) {
        case 'status':   return AgentCore.orchestrator.getStatus()
        case 'memory':   return AgentCore.orchestrator.getMemorySummary()
        case 'report':   return AgentCore.orchestrator.getReport()
        default:         return AgentCore.orchestrator.getStatus()
      }
    },

    getStatus() {
      const recent = AgentCore.getRecent(50)
      const errors = recent.filter(l => l.event === 'api_error' || l.event === 'js_error')
      const slowApis = recent.filter(l => l.event === 'slow_api')
      const report = window.__agentReport || {}
      return {
        ok: errors.length === 0,
        errors: errors.length,
        slowApis: slowApis.length,
        lastAnalysis: report.ts ? new Date(report.ts).toLocaleTimeString() : 'pending',
        recommendations: report.recommendations || [],
        memoryEntries: AgentCore.memory.length,
      }
    },

    getMemorySummary() {
      const recent = AgentCore.getRecent(200)
      const issues = AgentCore.agents.developer.getTopIssues()
      return { total: AgentCore.memory.length, recent: recent.length, topIssues: issues }
    },

    getReport() {
      return {
        status: this.getStatus(),
        topIssues: AgentCore.agents.developer.getTopIssues(),
        testerResults: window.__testerResults || [],
      }
    },
  },
}

export default AgentCore
