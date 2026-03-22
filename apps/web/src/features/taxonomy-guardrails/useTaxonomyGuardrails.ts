import { useEffect, useState } from 'react';

import type { TaxonomyGuardrailResult } from '@scrambleiq/shared';

import { MatchNotFoundError, type MatchesApi } from '../../matches-api';

interface UseTaxonomyGuardrailsArgs {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
}

export function useTaxonomyGuardrails({ api, matchId, refreshTrigger }: UseTaxonomyGuardrailsArgs) {
  const [result, setResult] = useState<TaxonomyGuardrailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      if (!api.getTaxonomyGuardrails) {
        if (mounted) {
          setError('Taxonomy guardrails are unavailable for this workspace.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await api.getTaxonomyGuardrails(matchId);
        if (mounted) {
          setResult(response);
        }
      } catch (caught) {
        if (!mounted) {
          return;
        }

        if (caught instanceof MatchNotFoundError) {
          return;
        }

        setError('Unable to load taxonomy guardrails right now.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [api, matchId, refreshTrigger]);

  return {
    result,
    isLoading,
    error,
  };
}
