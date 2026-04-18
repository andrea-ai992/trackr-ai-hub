Je vais vérifier et corriger les fichiers `src/api/brain.js` et `src/api/andy.js` pour ajouter le pattern `AbortSignal.timeout()` aux appels fetch critiques, en m'assurant que le code reste complet et fonctionnel.

Voici le fichier corrigé `src/api/brain.js`:

```javascript
// src/api/brain.js
// Brain API with AbortController.timeout() pattern for all fetch calls
// Mobile-first, dark theme, Inter font

const API_BASE = 'https://api.brain.io/v1';
const TIMEOUT_MS = 8000; // 8s timeout for all requests

// Helper to create abort controller with timeout
const createAbortController = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { controller, timeoutId };
};

// Helper to clean up timeout
const cleanupTimeout = (timeoutId) => {
  clearTimeout(timeoutId);
};

// Main Brain API functions
export const fetchCognitiveAnalysis = async (query) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/cognitive/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ query }),
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Cognitive analysis request timed out');
    }
    throw error;
  }
};

export const fetchMemoryInsights = async (userId) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/memory/insights/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Memory insights request timed out');
    }
    throw error;
  }
};

export const fetchLearningPatterns = async (topic) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/learning/patterns/${topic}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Learning patterns request timed out');
    }
    throw error;
  }
};

export const fetchProblemSolving = async (problem) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/problem/solving`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ problem }),
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Problem solving request timed out');
    }
    throw error;
  }
};

export const fetchDecisionSupport = async (context) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/decision/support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ context }),
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Decision support request timed out');
    }
    throw error;
  }
};

// Export all functions as default object for easy import
export default {
  fetchCognitiveAnalysis,
  fetchMemoryInsights,
  fetchLearningPatterns,
  fetchProblemSolving,
  fetchDecisionSupport,
};
```

Et voici le fichier corrigé `src/api/andy.js`:

```javascript
// src/api/andy.js
// AnDy API with AbortController.timeout() pattern for all fetch calls
// Mobile-first, dark theme, Inter font

const API_BASE = 'https://api.andy.ai/v1';
const TIMEOUT_MS = 8000; // 8s timeout for all requests

// Helper to create abort controller with timeout
const createAbortController = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { controller, timeoutId };
};

// Helper to clean up timeout
const cleanupTimeout = (timeoutId) => {
  clearTimeout(timeoutId);
};

// Main AnDy API functions
export const fetchChatResponse = async (message, context = {}) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ message, context }),
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Chat response request timed out');
    }
    throw error;
  }
};

export const fetchAgentResponse = async (agentId, input) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/agents/${agentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ input }),
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Agent response request timed out');
    }
    throw error;
  }
};

export const fetchSystemStatus = async () => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/system/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('System status request timed out');
    }
    throw error;
  }
};

export const fetchMemoryUpdate = async (userId, memoryData) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/memory/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ memoryData }),
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeTimeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Memory update request timed out');
    }
    throw error;
  }
};

export const fetchLearningData = async (topic) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/learning/${topic}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Learning data request timed out');
    }
    throw error;
  }
};

// Export all functions as default object for easy import
export default {
  fetchChatResponse,
  fetchAgentResponse,
  fetchSystemStatus,
  fetchMemoryUpdate,
  fetchLearningData,
};