/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TaxonomyGuardrailsPanel } from '../src/features/taxonomy-guardrails/TaxonomyGuardrailsPanel';
import type { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => { throw new Error('createMatch was not mocked'); },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
    getMatch: async () => { throw new Error('getMatch was not mocked'); },
    updateMatch: async () => { throw new Error('updateMatch was not mocked'); },
    deleteMatch: async () => undefined,
    createTimelineEvent: async () => { throw new Error('createTimelineEvent was not mocked'); },
    listTimelineEvents: async () => [],
    updateTimelineEvent: async () => { throw new Error('updateTimelineEvent was not mocked'); },
    deleteTimelineEvent: async () => undefined,
    createPositionState: async () => { throw new Error('createPositionState was not mocked'); },
    listPositionStates: async () => [],
    updatePositionState: async () => { throw new Error('updatePositionState was not mocked'); },
    deletePositionState: async () => undefined,
    createMatchVideo: async () => { throw new Error('createMatchVideo was not mocked'); },
    getMatchVideo: async () => { throw new Error('getMatchVideo was not mocked'); },
    updateMatchVideo: async () => { throw new Error('updateMatchVideo was not mocked'); },
    deleteMatchVideo: async () => undefined,
    getMatchAnalytics: async () => { throw new Error('getMatchAnalytics was not mocked'); },
    getMatchReviewSummary: async () => { throw new Error('getMatchReviewSummary was not mocked'); },
    exportMatchDataset: async () => { throw new Error('exportMatchDataset was not mocked'); },
    validateMatchDataset: async () => { throw new Error('validateMatchDataset was not mocked'); },
    getTaxonomyGuardrails: async () => ({
      hasWarnings: true,
      warningCount: 1,
      warnings: [{
        field: 'eventType',
        observedValue: 'Guard Pass',
        canonicalValue: 'guard_pass',
        severity: 'WARNING',
        message: 'Normalize "Guard Pass" to canonical "guard_pass" (1 event).',
      }],
    }),
    applyTaxonomyNormalization: async () => ({
      field: 'eventType',
      action: 'apply_canonical',
      matchId: 'match-1',
      fromValue: 'Guard Pass',
      toValue: 'guard_pass',
      updatedEventCount: 1,
    }),
    ...overrides,
  };
}

describe('TaxonomyGuardrailsPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders warning details and no-warning state', async () => {
    const api = createMatchesApiMock();

    const { rerender } = render(
      <TaxonomyGuardrailsPanel api={api} matchId="match-1" refreshTrigger={0} onTaxonomyNormalized={() => undefined} />,
    );

    expect(await screen.findByText(/event-type normalization warning detected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Normalize to guard_pass' })).toBeInTheDocument();

    rerender(
      <TaxonomyGuardrailsPanel
        api={createMatchesApiMock({
          getTaxonomyGuardrails: async () => ({ hasWarnings: false, warningCount: 0, warnings: [] }),
        })}
        matchId="match-1"
        refreshTrigger={1}
        onTaxonomyNormalized={() => undefined}
      />,
    );

    expect(await screen.findByText('No event-type taxonomy warnings found.')).toBeInTheDocument();
  });

  it('handles explicit normalization action and callback', async () => {
    const onTaxonomyNormalized = vi.fn();
    const api = createMatchesApiMock();

    render(<TaxonomyGuardrailsPanel api={api} matchId="match-1" refreshTrigger={0} onTaxonomyNormalized={onTaxonomyNormalized} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Normalize to guard_pass' }));

    await waitFor(() => {
      expect(onTaxonomyNormalized).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByRole('status')).toHaveTextContent('Normalized 1 event from "Guard Pass" to "guard_pass".');
  });

  it('renders error states for failed load and failed normalization action', async () => {
    const failingLoadApi = createMatchesApiMock({
      getTaxonomyGuardrails: async () => {
        throw new Error('network down');
      },
    });

    render(<TaxonomyGuardrailsPanel api={failingLoadApi} matchId="match-1" refreshTrigger={0} onTaxonomyNormalized={() => undefined} />);

    expect(await screen.findByText('Unable to load taxonomy guardrails right now.')).toBeInTheDocument();

    cleanup();

    const failingActionApi = createMatchesApiMock({
      applyTaxonomyNormalization: async () => {
        throw new Error('action failed');
      },
    });

    render(<TaxonomyGuardrailsPanel api={failingActionApi} matchId="match-1" refreshTrigger={0} onTaxonomyNormalized={() => undefined} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Normalize to guard_pass' }));

    expect(await screen.findByText('Unable to normalize "Guard Pass" right now.')).toBeInTheDocument();
  });
});
