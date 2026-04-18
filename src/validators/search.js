// src/validators/search.js
import { z } from "zod";

export const SearchParamsSchema = z.object({
  query: z.string().min(1, "Le champ de recherche est requis").max(100, "Maximum 100 caractères"),
  category: z.enum([
    "all",
    "sports",
    "markets",
    "news",
    "crypto",
    "stocks",
    "nba",
    "nfl",
    "psg",
    "ufc",
    "realestate",
    "sneakers",
    "watches",
    "business",
    "flight",
    "patterns"
  ]).default("all"),
  sort: z.enum(["relevance", "date", "popularity"]).default("relevance"),
  timeframe: z.enum(["all", "day", "week", "month", "year"]).default("all"),
  minPrice: z.coerce.number().min(0).max(1000000).optional(),
  maxPrice: z.coerce.number().min(0).max(1000000).optional(),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(100).default(10)
});

export const parseSearchParams = (params) => {
  try {
    const validated = SearchParamsSchema.parse(params);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(firstError.message);
    }
    throw new Error("Validation des paramètres échouée");
  }
};

export const getDefaultSearchParams = () => ({
  query: "",
  category: "all",
  sort: "relevance",
  timeframe: "all",
  minPrice: undefined,
  maxPrice: undefined,
  brand: undefined,
  model: undefined,
  location: undefined,
  limit: 10
});
```

```javascript
// src/components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { parseSearchParams, getDefaultSearchParams } from "../validators/search";

export const SearchBar = ({
  initialParams = getDefaultSearchParams(),
  onSearch,
  placeholder = "Rechercher..."
}) => {
  const [params, setParams] = useState(initialParams);
  const [query, setQuery] = useState(initialParams.query || "");
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
    setQuery(value);

    if (name === "query" && value.length > 100) {
      setErrors(prev => ({ ...prev, query: "Maximum 100 caractères" }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.query;
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const validatedParams = parseSearchParams(params);
      onSearch(validatedParams);
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  const handleReset = () => {
    setParams(getDefaultSearchParams());
    setQuery("");
    setErrors({});
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleReset();
  };

  useEffect(() => {
    if (initialParams.query) {
      setQuery(initialParams.query);
    }
  }, [initialParams.query]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto mb-6"
      style={{
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-t3"
          style={{ color: "var(--t3)" }}
        />

        <input
          ref={inputRef}
          type="text"
          name="query"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 bg-bg2 border border-border rounded-lg text-t1 placeholder-t2 focus:outline-none focus:border-green transition-all duration-200"
          style={{
            backgroundColor: "var(--bg2)",
            borderColor: "var(--border)",
            color: "var(--t1)",
            border: "1px solid var(--border)"
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bg3 transition-colors"
            style={{ backgroundColor: "var(--bg3)" }}
            aria-label="Réinitialiser la recherche"
          >
            <X size={18} className="text-t3" style={{ color: "var(--t3)" }} />
          </button>
        )}
      </div>

      {errors.general && (
        <p className="mt-2 text-sm text-red-500" style={{ color: "#ff4444" }}>
          {errors.general}
        </p>
      )}

      {errors.query && (
        <p className="mt-2 text-sm text-red-500" style={{ color: "#ff4444" }}>
          {errors.query}
        </p>
      )}
    </form>
  );
};