// src/hooks/useAbortableFetch.js
import { useState, useEffect, useCallback } from 'react';

export const useAbortableFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async (url, options = {}, timeout = 10000) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out after 10 seconds');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  return { fetchData, isLoading, error, data };
};