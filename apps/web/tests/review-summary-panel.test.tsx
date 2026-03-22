/* @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MatchReviewSummaryPanel } from '../src/features/review-summary/MatchReviewSummaryPanel';
import type { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
    getMatch: async () => {
      throw new Error('getMatch was not mocked');
    },
    updateMatch: async () => {
      throw new Error('updateMatch was not mocked');
    },
    deleteMatch: async () => undefined,
    createTimelineEvent: async () => {
      throw new Error('createTimelineEvent was not mocked');
    },
    listTimelineEvents: async () => [],
    updateTimelineEvent: async () => {
      throw new Error('updateTimelineEvent was not mocked');
    },
    deleteTimelineEvent: async () => undefined,
    createPositionState: async () => {
      throw new Error('createPositionState was not mocked');
    },
    listPositionStates: async () => [],
    updatePositionState: async () => {
      throw new Error('updatePositionState was not mocked');
    },
    deletePositionState: async () => undefined,
    createMatchVideo: async () => {
      throw new Error('createMatchVideo was not mocked');
    },
    getMatchVideo: async () => {
      throw new Error('getMatchVideo was not mocked');
    },
    updateMatchVideo: async () => {
      throw new Error('updateMatchVideo was not mocked');
    },
    deleteMatchVideo: async () => undefined,
    getMatchAnalytics: async () => {
      throw new Error('getMatchAnalytics was not mocked');
    },
    getMatchReviewSummary: async (matchId: string) => ({
      match: {
        id: matchId,
        title: 'Review Target Match',
        date: '2026-03-01',
        ruleset: 'Folkstyle',
        competitorA: 'Alex Carter',
        competitorB: 'Sam Jordan',
        notes: '',
      },
      eventCount: 4,
      positionCount: 2,
      hasVideo: true,
      analytics: {
        matchId,
        totalEventCount: 4,
        eventCountsByType: {
          takedown_attempt: 2,
          guard_pass: 2,
        },
        totalPositionCount: 2,
        timeInPositionByTypeSeconds: {
          standing: 10,
          closed_guard: 8,
          open_guard: 0,
          half_guard: 0,
          side_control: 0,
          mount: 2,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        competitorTopTimeByPositionSeconds: {
          A: {
            standing: 7,
            closed_guard: 4,
            open_guard: 0,
            half_guard: 0,
            side_control: 0,
            mount: 2,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
          B: {
            standing: 3,
            closed_guard: 4,
            open_guard: 0,
            half_guard: 0,
            side_control: 0,
            mount: 0,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
        },
        totalTrackedPositionTimeSeconds: 20,
      },
      validation: {
        isValid: false,
        issueCount: 3,
        issueCountsBySeverity: {
          info: 1,
          warning: 1,
          error: 1,
        },
      },
    }),
    exportMatchDataset: async () => {
      throw new Error('exportMatchDataset was not mocked');
    },
    validateMatchDataset: async () => {
      throw new Error('validateMatchDataset was not mocked');
    },
    ...overrides,
  };
}

describe('MatchReviewSummaryPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders deterministic review summary content for coaches', async () => {
    const api = createMatchesApiMock();

    render(<MatchReviewSummaryPanel api={api} matchId="match-1" refreshTrigger={0} />);

    expect(await screen.findByRole('heading', { name: 'Single-Match Review Summary' })).toBeInTheDocument();
    expect(await screen.findByText('Event count: 4')).toBeInTheDocument();
    expect(screen.getByText('Position count: 2')).toBeInTheDocument();
    expect(screen.getByText('Video attached: Yes')).toBeInTheDocument();
    expect(screen.getByText('Validation ready: No')).toBeInTheDocument();
    expect(screen.getByText('Total validation issues: 3')).toBeInTheDocument();
    expect(screen.getByText('Issue severity counts: info 1, warning 1, error 1')).toBeInTheDocument();
  });

  it('renders load error when review summary fetch fails', async () => {
    const api = createMatchesApiMock({
      getMatchReviewSummary: async () => {
        throw new Error('network failed');
      },
    });

    render(<MatchReviewSummaryPanel api={api} matchId="match-1" refreshTrigger={0} />);

    expect(await screen.findByText('Unable to load match review summary right now.')).toBeInTheDocument();
  });
});
