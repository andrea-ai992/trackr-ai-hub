// src/server/routes/api/andy.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { AbortController } from 'node-abort-controller';

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// SSE connection pool
const sseConnections = new Set();

router.get('/andy', async (req, res) => {
  try {
    const { query } = req;
    const { prompt, stream = false } = query;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (stream === 'true') {
      // SSE Response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Add connection to pool for potential cleanup
      sseConnections.add(res);

      // Create abort signal with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error('Request timeout after 30s'));
      }, 30000);

      try {
        // Process prompt with timeout
        const response = await processAndyPrompt(prompt, controller.signal);

        // Send initial data
        res.write(`data: ${JSON.stringify({ type: 'start', data: response.initial })}\n\n`);

        // Stream chunks
        for await (const chunk of response.stream) {
          res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
          res.flush();
        }

        // Send completion
        res.write(`data: ${JSON.stringify({ type: 'end', data: response.final })}\n\n`);
      } catch (error) {
        if (error.name === 'AbortError') {
          res.write(`data: ${JSON.stringify({ type: 'error', data: 'Request timed out' })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`);
        }
      } finally {
        clearTimeout(timeoutId);
        sseConnections.delete(res);
        res.end();
      }
    } else {
      // Regular JSON response with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(new Error('Request timeout after 30s'));
      }, 30000);

      try {
        const response = await processAndyPrompt(prompt, controller.signal);
        clearTimeout(timeoutId);
        return res.json(response);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          return res.status(408).json({ error: 'Request timeout' });
        }
        return res.status(500).json({ error: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function processAndyPrompt(prompt, signal) {
  // Simulate processing with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Processing timeout'));
  }, 25000);

  try {
    signal.addEventListener('abort', () => {
      controller.abort(signal.reason);
    });

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate response stream
    const response = {
      initial: `Processing your request: "${prompt}"`,
      stream: [
        'Analyzing context...',
        'Fetching relevant data...',
        'Generating response...',
        'Finalizing answer...'
      ],
      final: `Here's the response to: "${prompt}"`
    };

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Cleanup SSE connections on server shutdown
process.on('SIGTERM', () => {
  for (const res of sseConnections) {
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', data: 'Server shutting down' })}\n\n`);
      res.end();
    } catch (e) {
      // Ignore connection errors during shutdown
    }
  }
  sseConnections.clear();
});

process.on('SIGINT', () => {
  for (const res of sseConnections) {
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', data: 'Server shutting down' })}\n\n`);
      res.end();
    } catch (e) {
      // Ignore connection errors during shutdown
    }
  }
  sseConnections.clear();
});

export default router;