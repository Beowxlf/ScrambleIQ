import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MatchSummary } from '@scrambleiq/shared';

import type { MatchesApi } from '../matches-api';

interface UseMatchesOptions {
  api: MatchesApi;
}

export function useMatches({ api }: UseMatchesOptions) {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [competitorFilter, setCompetitorFilter] = useState('');
  const [hasVideoOnly, setHasVideoOnly] = useState(false);

  const loadMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    setMatchesError(null);

    try {
      const fetchedMatches = await api.listMatches({
        competitor: competitorFilter.trim() || undefined,
        hasVideo: hasVideoOnly ? true : undefined,
      });

      setMatches(fetchedMatches.matches);
    } catch {
      setMatchesError('Unable to load matches right now.');
    } finally {
      setIsLoadingMatches(false);
    }
  }, [api, competitorFilter, hasVideoOnly]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const filters = useMemo(
    () => ({
      competitorFilter,
      hasVideoOnly,
      setCompetitorFilter,
      setHasVideoOnly,
    }),
    [competitorFilter, hasVideoOnly],
  );

  return {
    matches,
    isLoadingMatches,
    matchesError,
    filters,
    refreshMatches: loadMatches,
  };
}
