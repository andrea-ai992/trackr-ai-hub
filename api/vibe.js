// api/vibe.js
import { createClient } from '@supabase/supabase-js'

// Config Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Timeout pour les requêtes fetch
const DEFAULT_TIMEOUT_MS = 15000 // 15 secondes par défaut

/**
 * Wrapper fetch avec timeout robuste
 * @param {RequestInfo} input - URL ou requête
 * @param {RequestInit} init - Options fetch
 * @param {number} timeoutMs - Timeout en ms (défaut: DEFAULT_TIMEOUT_MS)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(input, init = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Gestion des streams SSE avec timeout et parsing .json() correct
 * @param {string} url - URL du stream
 * @param {Object} options - Options
 * @param {number} options.timeoutMs - Timeout pour le stream
 * @param {Object} options.headers - Headers supplémentaires
 * @returns {AsyncGenerator<Object>} Générateur d'objets parsés
 */
async function* sseStream(url, { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {} } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept': 'text/event-stream',
        ...headers
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`SSE stream failed with status ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body available')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Traiter les lignes complètes
      let lineEnd
      while ((lineEnd = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, lineEnd).trim()
        buffer = buffer.slice(lineEnd + 1)

        if (line.startsWith('data:')) {
          const dataStr = line.slice(5).trim()
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr)
              yield data
            } catch (error) {
              console.error('Failed to parse SSE data:', error)
              // Ignorer les données invalides mais continuer le stream
            }
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`SSE stream timed out after ${timeoutMs}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Handler principal pour /vibe endpoint
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    // Exemple: écouter les changements en temps réel avec Supabase
    const channel = supabase
      .channel('realtime-vibe')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vibes' },
        (payload) => {
          res.write(`data: ${JSON.stringify(payload)}\n\n`)
        }
      )
      .subscribe()

    // Nettoyer le channel à la fermeture de la connexion
    req.on('close', () => {
      supabase.removeChannel(channel)
      res.end()
    })

    // Heartbeat pour garder la connexion active
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n')
    }, 30000)

    req.on('close', () => {
      clearInterval(heartbeatInterval)
    })

  } catch (error) {
    console.error('Vibe endpoint error:', error)
    res.status(500).write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
    res.end()
  }
}

/**
 * Endpoint pour les requêtes proxy avec timeout
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function proxyHandler(req, res) {
  const { url, method = 'GET', headers = {}, body } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const response = await fetchWithTimeout(url, {
      method,
      headers: {
        ...headers,
        'User-Agent': 'Trackr-API-Proxy/1.0'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()

    res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(502).json({
      error: error.message,
      status: 'timeout' in error ? 'timeout' : 'fetch_error'
    })
  }
}