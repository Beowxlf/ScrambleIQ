import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MatchSummary } from '@scrambleiq/shared';

import type { MatchesApi } from '../matches-api';

interface UseMatchesOptions {
  api: MatchesApi;
}

const DEFAULT_PAGE_SIZE = 25;

export function useMatches({ api }: UseMatchesOptions) {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [competitorFilter, setCompetitorFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [hasVideoOnly, setHasVideoOnly] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const latestRequestId = useRef(0);

  const loadMatches = useCallback(async () => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

    setIsLoadingMatches(true);
    setMatchesError(null);

    try {
      const fetchedMatches = await api.listMatches({
        competitor: competitorFilter.trim() || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
        hasVideo: hasVideoOnly ? true : undefined,
        limit,
        offset,
      });

      if (requestId !== latestRequestId.current) {
        return;
      }

      setMatches(fetchedMatches.matches);
      setTotal(fetchedMatches.total);
    } catch {
      if (requestId !== latestRequestId.current) {
        return;
      }

      setMatchesError('Unable to load matches right now.');
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoadingMatches(false);
      }
    }
  }, [api, competitorFilter, dateFromFilter, dateToFilter, hasVideoOnly, limit, offset]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const filters = useMemo(
    () => ({
      competitorFilter,
      dateFromFilter,
      dateToFilter,
      hasVideoOnly,
      limit,
      offset,
      total,
      setCompetitorFilter: (value: string) => {
        setCompetitorFilter(value);
        setOffset(0);
      },
      setDateFromFilter: (value: string) => {
        setDateFromFilter(value);
        setOffset(0);
      },
      setDateToFilter: (value: string) => {
        setDateToFilter(value);
        setOffset(0);
      },
      setHasVideoOnly: (value: boolean) => {
        setHasVideoOnly(value);
        setOffset(0);
      },
      setLimit: (value: number) => {
        setLimit(value);
        setOffset(0);
      },
      goToPreviousPage: () => {
        setOffset((current) => Math.max(0, current - limit));
      },
      goToNextPage: () => {
        setOffset((current) => current + limit);
      },
    }),
    [competitorFilter, dateFromFilter, dateToFilter, hasVideoOnly, limit, offset, total],
  );

  return {
    matches,
    isLoadingMatches,
    matchesError,
    filters,
    refreshMatches: loadMatches,
  };
}
