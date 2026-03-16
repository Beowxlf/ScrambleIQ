import { useEffect, useState } from 'react';

import type { MatchAnalyticsSummary } from '@scrambleiq/shared';

import { MatchNotFoundError, type MatchesApi } from '../../matches-api';

interface UseMatchAnalyticsArgs {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
}

export function useMatchAnalytics({ api, matchId, refreshTrigger }: UseMatchAnalyticsArgs) {
  const [analytics, setAnalytics] = useState<MatchAnalyticsSummary | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);

      if (refreshTrigger === 0) {
        setAnalytics(null);
      }

      try {
        const fetchedAnalytics = await api.getMatchAnalytics(matchId);

        if (isMounted) {
          setAnalytics(fetchedAnalytics);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          return;
        }

        setAnalyticsError('Unable to load analytics summary right now.');
      } finally {
        if (isMounted) {
          setIsLoadingAnalytics(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [api, matchId, refreshTrigger]);

  return {
    analytics,
    analyticsError,
    isLoadingAnalytics,
  };
}
