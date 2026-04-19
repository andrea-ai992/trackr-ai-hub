import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string()
    .max(100, "La recherche ne doit pas dépasser 100 caractères")
    .regex(/^[a-zA-Z0-9\s\-_@.]+$/, "Caractères non autorisés dans la recherche"),
});

function SearchBar({ onSearch, debounceTime = 300 }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const debouncedSearch = useCallback(
    useCallback((value) => {
      try {
        const validated = searchSchema.parse({ query: value });
        setError('');
        onSearch(validated.query);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
        }
      }
    }, [onSearch]),
    [onSearch]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, debounceTime);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceTime, debouncedSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full font-[JetBrains Mono]"
    >
      <div className="flex items-center bg-[var(--surface-low)] rounded-md p-2 w-full">
        <input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Recherche (symboles, noms)..."
          className="bg-transparent outline-none p-2 text-[var(--text-primary)] w-full font-[JetBrains Mono]"
          aria-label="Rechercher des actifs"
        />
        <button
          type="submit"
          className="bg-[var(--neon)] h-8 w-8 rounded-full ml-2 flex items-center justify-center"
          aria-label="Rechercher"
        >
          <FaSearch className="text-[var(--bg)]" />
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 px-2 font-[JetBrains Mono]" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default SearchBar;