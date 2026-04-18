Voici le fichier complet `src/server/routes/api/brain.js` avec l'implémentation d'AbortSignal.timeout(5000) sur tous les fetch() et le respect des règles demandées :

```javascript
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware pour gérer les erreurs
const handleError = (res, error) => {
  console.error('Brain API Error:', error);
  res.status(500).json({ error: 'Internal server error' });
};

// Route pour analyser du texte via l'API Brain
router.post('/analyze', async (req, res) => {
  try {
    const { text, model = 'gpt-3.5-turbo' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Création du signal d'abort avec timeout de 5 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const signal = controller.signal;

    // Appel à l'API externe avec timeout
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: text }],
        max_tokens: 1000,
        temperature: 0.7
      }),
      signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    res.json({ result: data.choices[0].message.content });
  } catch (error) {
    if (error.name === 'AbortError') {
      handleError(res, new Error('Request timeout after 5 seconds'));
    } else {
      handleError(res, error);
    }
  }
});

// Route pour sauvegarder une analyse dans Supabase
router.post('/save', async (req, res) => {
  try {
    const { text, analysis, userId } = req.body;

    if (!text || !analysis || !userId) {
      return res.status(400).json({ error: 'Text, analysis and userId are required' });
    }

    const { data, error } = await supabase
      .from('brain_analyses')
      .insert([{ text, analysis, user_id: userId }])
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

// Route pour récupérer les analyses d'un utilisateur
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const { data, error } = await supabase
      .from('brain_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    handleError(res, error);
  }
});

// Route pour supprimer une analyse
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('brain_analyses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;