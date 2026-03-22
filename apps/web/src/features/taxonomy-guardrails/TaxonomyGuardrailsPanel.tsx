import { useState } from 'react';

import type { TaxonomyGuardrailWarning } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import { useTaxonomyGuardrails } from './useTaxonomyGuardrails';

interface TaxonomyGuardrailsPanelProps {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
  onTaxonomyNormalized: () => void;
}

export function TaxonomyGuardrailsPanel({ api, matchId, refreshTrigger, onTaxonomyNormalized }: TaxonomyGuardrailsPanelProps) {
  const { result, isLoading, error } = useTaxonomyGuardrails({ api, matchId, refreshTrigger });
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [inFlightObservedValue, setInFlightObservedValue] = useState<string | null>(null);

  const applyNormalization = async (warning: TaxonomyGuardrailWarning) => {
    if (!api.applyTaxonomyNormalization) {
      setActionError('Taxonomy normalization is unavailable for this workspace.');
      return;
    }

    setInFlightObservedValue(warning.observedValue);
    setActionError(null);
    setActionStatus(null);

    try {
      const response = await api.applyTaxonomyNormalization(matchId, {
        field: warning.field,
        fromValue: warning.observedValue,
        toValue: warning.canonicalValue,
        action: 'apply_canonical',
      });
      setActionStatus(`Normalized ${response.updatedEventCount} event${response.updatedEventCount === 1 ? '' : 's'} from "${warning.observedValue}" to "${warning.canonicalValue}".`);
      onTaxonomyNormalized();
    } catch {
      setActionError(`Unable to normalize "${warning.observedValue}" right now.`);
    } finally {
      setInFlightObservedValue(null);
    }
  };

  return (
    <section aria-labelledby="taxonomy-guardrails-heading">
      <h2 id="taxonomy-guardrails-heading">Taxonomy Hygiene Guardrails</h2>
      <p>Event-type label hygiene checks for manual review consistency. Suggestions are visible and require explicit action.</p>

      {isLoading ? <p>Loading taxonomy guardrails...</p> : null}
      {error ? <p>{error}</p> : null}
      {actionStatus ? <p role="status">{actionStatus}</p> : null}
      {actionError ? <p className="status-error">{actionError}</p> : null}

      {!isLoading && !error && result ? (
        result.hasWarnings ? (
          <div>
            <p>{result.warningCount} event-type normalization warning{result.warningCount === 1 ? '' : 's'} detected.</p>
            <ul>
              {result.warnings.map((warning) => (
                <li key={`${warning.field}-${warning.observedValue}`}>
                  <p>{warning.message}</p>
                  <button
                    type="button"
                    onClick={() => applyNormalization(warning)}
                    disabled={inFlightObservedValue === warning.observedValue}
                  >
                    {inFlightObservedValue === warning.observedValue
                      ? 'Applying normalization...'
                      : `Normalize to ${warning.canonicalValue}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : <p>No event-type taxonomy warnings found.</p>
      ) : null}
    </section>
  );
}
