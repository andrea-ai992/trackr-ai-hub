src/hooks/useAbortableFetch.js
```javascript
import { useState, useEffect, useCallback } from 'react';

const useAbortableFetch = (initialTimeout = 8000) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const fetchData = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    const timeoutId = setTimeout(() => {
      controller.abort();
      setError(new Error('Request timeout'));
      setLoading(false);
    }, options.timeout || initialTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }, [initialTimeout]);

  const abortFetch = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setError(new Error('Request aborted'));
      setAbortController(null);
    }
  }, [abortController]);

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return { data, error, loading, fetchData, abortFetch };
};

export default useAbortableFetch;