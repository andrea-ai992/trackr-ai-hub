src/hooks/useCryptoFilters.js

import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

const VALID_SORT_BY = ['market_cap', 'price', 'change'];
const VALID_FILTER_BY = ['all', 'gainers', 'losers'];
const VALID_SORT_DIR = ['asc', 'desc'];

export function useCryptoFilters(coins = []) {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const filterBy = VALID_FILTER_BY.includes(searchParams.get('filter'))
    ? searchParams.get('filter')
    : 'all';
  const sortBy = VALID_SORT_BY.includes(searchParams.get('sort'))
    ? searchParams.get('sort')
    : 'market_cap';
  const sortDir = VALID_SORT_DIR.includes(searchParams.get('dir'))
    ? searchParams.get('dir')
    : 'desc';

  const setQuery = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value && value.trim()) {
          next.set('q', value.trim());
        } else {
          next.delete('q');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setFilterBy = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== 'all') {
          next.set('filter', value);
        } else {
          next.delete('filter');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setSortBy = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== 'market_cap') {
          next.set('sort', value);
        } else {
          next.delete('sort');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setSortDir = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== 'desc') {
          next.set('dir', value);
        } else {
          next.delete('dir');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const toggleSortDir = useCallback(() => {
    setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
  }, [sortDir, setSortDir]);

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const filteredAndSorted = useMemo(() => {
    if (!Array.isArray(coins)) return [];

    let result = [...coins];

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (coin) =>
          (coin.name && coin.name.toLowerCase().includes(lowerQuery)) ||
          (coin.symbol && coin.symbol.toLowerCase().includes(lowerQuery))
      );
    }

    if (filterBy === 'gainers') {
      result = result.filter((coin) => {
        const change =
          coin.price_change_percentage_24h ??
          coin.change_24h ??
          coin.priceChangePercent ??
          0;
        return Number(change) > 0;
      });
    } else if (filterBy === 'losers') {
      result = result.filter((coin) => {
        const change =
          coin.price_change_percentage_24h ??
          coin.change_24h ??
          coin.priceChangePercent ??
          0;
        return Number(change) < 0;
      });
    }

    result.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      if (sortBy === 'market_cap') {
        aVal =
          a.market_cap ??
          a.marketCap ??
          a.market_cap_usd ??
          0;
        bVal =
          b.market_cap ??
          b.marketCap ??
          b.market_cap_usd ??
          0;
      } else if (sortBy === 'price') {
        aVal =
          a.current_price ??
          a.price ??
          a.priceUsd ??
          0;
        bVal =
          b.current_price ??
          b.price ??
          b.priceUsd ??
          0;
      } else if (sortBy === 'change') {
        aVal =
          a.price_change_percentage_24h ??
          a.change_24h ??
          a.priceChangePercent ??
          0;
        bVal =
          b.price_change_percentage_24h ??
          b.change_24h ??
          b.priceChangePercent ??
          0;
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;

      if (sortDir === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });

    return result;
  }, [coins, query, filterBy, sortBy, sortDir]);

  const stats = useMemo(() => {
    if (!Array.isArray(coins)) {
      return { total: 0, gainers: 0, losers: 0, neutral: 0, filtered: 0 };
    }

    const gainers = coins.filter((coin) => {
      const change =
        coin.price_change_percentage_24h ??
        coin.change_24h ??
        coin.priceChangePercent ??
        0;
      return Number(change) > 0;
    }).length;

    const losers = coins.filter((coin) => {
      const change =
        coin.price_change_percentage_24h ??
        coin.change_24h ??
        coin.priceChangePercent ??
        0;
      return Number(change) < 0;
    }).length;

    return {
      total: coins.length,
      gainers,
      losers,
      neutral: coins.length - gainers - losers,
      filtered: filteredAndSorted.length,
    };
  }, [coins, filteredAndSorted]);

  const hasActiveFilters = useMemo(
    () =>
      query !== '' ||
      filterBy !== 'all' ||
      sortBy !== 'market_cap' ||
      sortDir !== 'desc',
    [query, filterBy, sortBy, sortDir]
  );

  return {
    query,
    filterBy,
    sortBy,
    sortDir,
    setQuery,
    setFilterBy,
    setSortBy,
    setSortDir,
    toggleSortDir,
    resetFilters,
    filteredAndSorted,
    stats,
    hasActiveFilters,
  };
}