import { useState, useEffect, useRef } from 'react';

const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const triggerTransition = async (callback, timeout = 5000) => {
    if (isTransitioning) return false;

    setIsTransitioning(true);
    setError(null);

    // Abort previous pending operations if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for the current transition
    abortControllerRef.current = new AbortController();

    try {
      // Wait for the transition to complete
      await new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          reject(new Error(`Transition timeout after ${timeout}ms`));
        }, timeout);

        // Execute the callback with abort signal
        const executeWithSignal = async () => {
          try {
            await callback({ signal: abortControllerRef.current.signal });
            clearTimeout(timeoutRef.current);
            resolve();
          } catch (err) {
            clearTimeout(timeoutRef.current);
            reject(err);
          }
        };

        executeWithSignal();
      });

      // Increment transition key to force remount
      setTransitionKey(prev => prev + 1);
      return true;
    } catch (err) {
      setError(err.message || 'Transition failed');
      setIsTransitioning(false);
      return false;
    } finally {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  };

  const cancelTransition = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTransitioning(false);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isTransitioning,
    transitionKey,
    error,
    triggerTransition,
    cancelTransition
  };
};

export default usePageTransition;