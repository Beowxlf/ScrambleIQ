import { useEffect, useState } from 'react';

import type { MatchReviewSummary } from '@scrambleiq/shared';

import { MatchNotFoundError, type MatchesApi } from '../../matches-api';

interface UseMatchReviewSummaryArgs {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
}

export function useMatchReviewSummary({ api, matchId, refreshTrigger }: UseMatchReviewSummaryArgs) {
  const [reviewSummary, setReviewSummary] = useState<MatchReviewSummary | null>(null);
  const [reviewSummaryError, setReviewSummaryError] = useState<string | null>(null);
  const [isLoadingReviewSummary, setIsLoadingReviewSummary] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviewSummary = async () => {
      setIsLoadingReviewSummary(true);
      setReviewSummaryError(null);

      if (!api.getMatchReviewSummary) {
        if (isMounted) {
          setReviewSummaryError('Review summary is unavailable for this workspace.');
          setIsLoadingReviewSummary(false);
        }
        return;
      }

      try {
        const fetchedSummary = await api.getMatchReviewSummary(matchId);

        if (isMounted) {
          setReviewSummary(fetchedSummary);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MatchNotFoundError) {
          return;
        }

        setReviewSummaryError('Unable to load match review summary right now.');
      } finally {
        if (isMounted) {
          setIsLoadingReviewSummary(false);
        }
      }
    };

    void loadReviewSummary();

    return () => {
      isMounted = false;
    };
  }, [api, matchId, refreshTrigger]);

  return {
    reviewSummary,
    reviewSummaryError,
    isLoadingReviewSummary,
  };
}
