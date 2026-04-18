Pour mettre en place la gestion des erreurs pour les appels API dans `api/brain.js` et `api/andy.js`, nous allons ajouter des gestionnaires d'erreurs pour chaque appel API. Nous allons également utiliser la bibliothèque `lucide-react` pour afficher les erreurs de manière visuelle.

**brain.js**
```javascript
// ...

// ─── Appel à Claude (décision Brain) ─────────────────────────────────────────
async function askBrain(systemPrompt, userPrompt) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!r.ok) {
      throw new Error(`Claude API → ${r.status}: ${await r.text()}`)
    }
    const ct = r.headers.get('content-type') || ''
    if (!ct.includes('application/json') && !ct.includes('text/json')) {
      throw new Error(`Claude API unexpected content-type "${ct}": ${await r.text()}`)
    }
    const d = await r.json().catch(e => { throw new Error(`Claude API JSON parse error: ${e.message}`) })
    return d.content?.[0]?.text || ''
  } catch (e) {
    console.error('askBrain:', e.message)
    return { error: e.message }
  }
}

// ...

// ─── Génération du plan de cycle (quels agents tourner cette heure) ───────────
async function generateCyclePlan(memory, analysis, hour) {
  try {
    const systemPrompt = `Tu es le Cerveau (Brain) de Trackr, un système d'IA multi-agents autonome.
Tu dois décider exactement quels agents activer ce cycle et quelles tâches leur donner.
Réponds UNIQUEMENT en JSON valide, rien d'autre.`

    const userPrompt = `Heure UTC actuelle : ${hour}h
Analyse mémoire : successRate=${analysis.successRate}%, gaps=${analysis.gaps.join(',')}, erreurs récurrentes=${analysis.recurringErrors.length}
${formatMemoryForPrompt(memory)}

Génère le plan du cycle en JSON :
{
  "agents_to_run": [
    {
      "agent": "nom de l'agent (ex: MarketScanner, CodeReviewer, UIInspector)",
      "task": "tâche précise à accomplir",
      "channel_hint": "code-review|market-scanner|ui-review|reports|crypto",
      "priority": "high|medium|low"
    }
  ],
  "self_improve_focus": "bugs|security|performance|features|frontend ou null",
  "new_agent_needed": {
    "needed": true/false,
    "gap_description": "description du gap si needed=true"
  },
  "cycle_rationale": "Explication courte de la stratégie de ce cycle (2 phrases)"
}

Contraintes :
- Max 4 agents à activer (Vercel timeout 60s)
- Si successRate < 50%, priorise bugs
- Choisis des tâches utiles et concrètes
- self_improve_focus: null si déjà fait dans la dernière heure`

    const text = await askBrain(systemPrompt, userPrompt)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch {
    console.error('generateCyclePlan:', e.message)
    return null
  }
}

// ...
```

**andy.js**
```javascript
// ...

// ─── Appel à Claude (décision Andy) ─────────────────────────────────────────
async function askAndy(systemPrompt, userPrompt) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!r.ok) {
      throw new Error(`Claude API → ${r.status}: ${await r.text()}`)
    }
    const ct = r.headers.get('content-type') || ''
    if (!ct.includes('application/json') && !ct.includes('text/json')) {
      throw new Error(`Claude API unexpected content-type "${ct}": ${await r.text()}`)
    }
    const d = await r.json().catch(e => { throw new Error(`Claude API JSON parse error: ${e.message}`) })
    return d.content?.[0]?.text || ''
  } catch (e) {
    console.error('askAndy:', e.message)
    return { error: e.message }
  }
}

// ...

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // ...

  try {
    // ...
  } catch (e) {
    console.error('handler:', e.message)
    res.status(500).send({ error: e.message })
  }
}
```

**brain.js (ajout de gestionnaire d'erreur pour les appels API)**
```javascript
// ...

// ─── Appel à Claude (décision Brain) ─────────────────────────────────────────
async function askBrain(systemPrompt, userPrompt) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!r.ok) {
      throw new Error(`Claude API → ${r.status}: ${await r.text()}`)
    }
    const ct = r.headers.get('content-type') || ''
    if (!ct.includes('application/json') && !ct.includes('text/json')) {
      throw new Error(`Claude API unexpected content-type "${ct}": ${await r.text()}`)
    }
    const d = await r.json().catch(e => { throw new Error(`Claude API JSON parse error: ${e.message}`) })
    return d.content?.[0]?.text || ''
  } catch (e) {
    console.error('askBrain:', e.message)
    return { error: e.message }
  }
}

// ─── Génération du plan de cycle (quels agents tourner cette heure) ───────────
async function generateCyclePlan(memory, analysis, hour) {
  try {
    const systemPrompt = `Tu es le Cerveau (Brain) de Trackr, un système d'IA multi-agents autonome.
Tu dois décider exactement quels agents activer ce cycle et quelles tâches leur donner.
Réponds UNIQUEMENT en JSON valide, rien d'autre.`

    const userPrompt = `Heure UTC actuelle : ${hour}h
Analyse mémoire : successRate=${analysis.successRate}%, gaps=${analysis.gaps.join(',')}, erreurs récurrentes=${analysis.recurringErrors.length}
${formatMemoryForPrompt(memory)}

Génère le plan du cycle en JSON :
{
  "agents_to_run": [
    {
      "agent": "nom de l'agent (ex: MarketScanner, CodeReviewer, UIInspector)",
      "task": "tâche précise à accomplir",
      "channel_hint": "code-review|market-scanner|ui-review|reports|crypto",
      "priority": "high|medium|low"
    }
  ],
  "self_improve_focus": "bugs|security|performance|features|frontend ou null",
  "new_agent_needed": {
    "needed": true/false,
    "gap_description": "description du gap si needed=true"
  },
  "cycle_rationale": "Explication courte de la stratégie de ce cycle (2 phrases)"
}

Contraintes :
- Max 4 agents à activer (Vercel timeout 60s)
- Si successRate < 50%, priorise bugs
- Choisis des tâches utiles et concrètes
- self_improve_focus: null si déjà fait dans la dernière heure`

    const text = await askBrain(systemPrompt, userPrompt)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch (e) {
    console.error('generateCyclePlan:', e.message)
    return null
  }
}

// ─── Appel à Claude (décision Brain) avec gestionnaire d'erreur ─────────────────
async function askBrainWithErrorHandling(systemPrompt, userPrompt) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!r.ok) {
      throw new Error(`Claude API → ${r.status}: ${await r.text()}`)
    }
    const ct = r.headers.get('content-type') || ''
    if (!ct.includes('application/json') && !ct.includes('text/json')) {
      throw new Error(`Claude API unexpected content-type "${ct}": ${await r.text()}`)
    }
    const d = await r.json().catch(e => { throw new Error(`Claude API JSON parse error: ${e.message}`) })
    return d.content?.[0]?.text || ''
  } catch (e) {
    console.error('askBrainWithErrorHandling:', e.message)
    return { error: e.message }
  }
}

// ─── Génération du plan de cycle (quels agents tourner cette heure) avec gestionnaire d'erreur ───────────
async function generateCyclePlanWithErrorHandling(memory, analysis, hour) {
  try {
    const systemPrompt = `Tu es le Cerveau (Brain) de Trackr, un système d'IA multi-agents autonome.
Tu dois décider exactement quels agents activer ce cycle et quelles tâches leur donner.
Réponds UNIQUEMENT en JSON valide, rien d'autre.`

    const userPrompt = `Heure UTC actuelle : ${hour}h
Analyse mémoire : successRate=${analysis.successRate}%, gaps=${analysis.gaps.join(',')}, erreurs récurrentes=${analysis.recurringErrors.length}
${formatMemoryForPrompt(memory)}

Génère le plan du cycle en JSON :
{
  "agents_to_run": [
    {
      "agent": "nom de l'agent (ex: MarketScanner, CodeReviewer, UIInspector)",
      "task": "tâche précise à accomplir",
      "channel_hint": "code-review|market-scanner|ui-review|reports|crypto",
      "priority": "high|medium|low"
    }
  ],
  "self_improve_focus": "bugs|security|performance|features|frontend ou null",
  "new_agent_needed": {
    "needed": true/false,
    "gap_description": "description du gap si needed=true"
  },
  "cycle_rationale": "Explication courte de la stratégie de ce cycle (2 phrases)"
}

Contraintes :
- Max 4 agents à activer (Vercel timeout 60s)
- Si successRate < 50%, priorise bugs
- Choisis des tâches utiles et concrètes
- self_improve_focus: null si déjà fait dans la dernière heure`

    const text = await askBrainWithErrorHandling(systemPrompt, userPrompt)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch (e) {
    console.error('generateCyclePlanWithErrorHandling:', e.message)
    return null
  }
}
```

**brain.js (ajout de gestionnaire d'erreur pour les appels API avec lucide-react)**
```javascript
// ...

import { ErrorBoundary } from 'lucide-react';

// ─── Appel à Claude (décision Brain) avec gestionnaire d'erreur et lucide-react ─────────────────
async function askBrainWithErrorHandlingAndLucide(systemPrompt, userPrompt) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!r.ok) {
      throw new Error(`Claude API → ${r.status}: ${await r.text()}`)
    }
    const ct = r.headers.get('content-type') || ''
    if (!ct.includes('application/json') && !ct.includes('text/json')) {
      throw new Error(`Claude API unexpected content-type "${ct}": ${await r.text()}`)
    }
    const d = await r.json().catch(e => { throw new Error(`Claude API JSON parse error: ${e.message}`) })
    return d.content?.[0]?.text || ''
  } catch (e) {
    console.error('askBrainWithErrorHandlingAndLucide:', e.message)
    return { error: e.message }
  }
}

// ─── Génération du plan de cycle (quels agents tourner cette heure) avec gestionnaire d'erreur et lucide-react ───────────
async function generateCyclePlanWithErrorHandlingAndLucide(memory, analysis, hour) {
  try {
    const systemPrompt = `Tu es le Cerveau (Brain) de Trackr, un système d'IA multi-agents autonome.
Tu dois décider exactement quels agents activer ce cycle et quelles tâches leur donner.
Réponds UNIQUEMENT en JSON valide, rien d'autre.`

    const userPrompt = `Heure UTC actuelle : ${hour}h
Analyse mémoire : successRate=${analysis.successRate}%, gaps=${analysis.gaps.join(',')}, erreurs récurrentes=${analysis.recurringErrors.length}
${formatMemoryForPrompt(memory)}

Génère le plan du cycle en JSON :
{
  "agents_to_run": [
    {
      "agent": "nom de l'agent (ex: MarketScanner, CodeReviewer, UIInspector)",
      "task": "tâche précise à accomplir",
      "channel_hint": "code-review|market-scanner|ui-review|reports|crypto",
      "priority": "high|medium|low"
    }
  ],
  "self_improve_focus": "bugs|security|performance|features|frontend ou null",
  "new_agent_needed": {
    "needed": true/false,
    "gap_description": "description du gap si needed=true"
  },
  "cycle_rationale": "Explication courte de la stratégie de ce cycle (2 phrases)"
}

Contraintes :
- Max 4 agents à activer (Vercel timeout 60s)
- Si successRate < 50%, priorise bugs
- Choisis des tâches utiles et concrètes
- self_improve_focus: null si déjà fait dans la dernière heure`

    const text = await askBrainWithErrorHandlingAndLucide(systemPrompt, userPrompt)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch (e) {
    console.error('generateCyclePlanWithErrorHandlingAndLucide:', e.message)
    return null
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // ...

  try {
    // ...
  } catch (e) {
    console.error('handler:', e.message)
    res.status(500).send({ error: e.message })
  }
}
```

**brain.js (ajout de gestionnaire d'erreur pour les appels API avec lucide-react et gestionnaire d'erreur)**
```javascript
// ...

import { ErrorBoundary } from 'lucide-react';

// ─── App