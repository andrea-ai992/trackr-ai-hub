Je vais créer le hook `useAbortableFetch` pour gérer les timeouts sur les appels API dans ChartAnalysis. Voici le code complet et fonctionnel :

```javascript
import { useState, useEffect, useCallback } from 'react';

export const useAbortableFetch = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const fetchData = useCallback(async (url, options = {}) => {
    // Abort previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    setAbortController(controller);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request aborted');
      } else {
        setError(err.message);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [abortController]);

  const abortRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setError('Request aborted by user');
    }
  }, [abortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return {
    data,
    error,
    isLoading,
    fetchData,
    abortRequest,
  };
};