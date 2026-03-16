import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsPanel } from '../src/features/analytics/AnalyticsPanel';
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
    getMatchAnalytics: async (matchId: string) => ({
      matchId,
      totalEventCount: 0,
      eventCountsByType: {},
      totalPositionCount: 0,
      timeInPositionByTypeSeconds: {
        standing: 0,
        closed_guard: 0,
        open_guard: 0,
        half_guard: 0,
        side_control: 0,
        mount: 0,
        back_control: 0,
        north_south: 0,
        leg_entanglement: 0,
        scramble: 0,
      },
      competitorTopTimeByPositionSeconds: {
        A: {
          standing: 0,
          closed_guard: 0,
          open_guard: 0,
          half_guard: 0,
          side_control: 0,
          mount: 0,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        B: {
          standing: 0,
          closed_guard: 0,
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
      totalTrackedPositionTimeSeconds: 0,
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

describe('AnalyticsPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders analytics summary details after loading completes', async () => {
    const api = createMatchesApiMock({
      getMatchAnalytics: async (matchId: string) => ({
        matchId,
        totalEventCount: 3,
        eventCountsByType: { takedown: 2, sweep: 1 },
        totalPositionCount: 2,
        timeInPositionByTypeSeconds: {
          standing: 12,
          closed_guard: 8,
          open_guard: 0,
          half_guard: 0,
          side_control: 0,
          mount: 0,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        competitorTopTimeByPositionSeconds: {
          A: {
            standing: 8,
            closed_guard: 6,
            open_guard: 0,
            half_guard: 0,
            side_control: 0,
            mount: 0,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
          B: {
            standing: 4,
            closed_guard: 2,
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
      }),
    });

    render(<AnalyticsPanel api={api} matchId="match-1" refreshTrigger={0} />);

    expect(screen.getByText('Loading analytics summary...')).toBeInTheDocument();
    expect(await screen.findByText('Total events: 3')).toBeInTheDocument();
    expect(screen.getByText('takedown: 2')).toBeInTheDocument();
    expect(screen.getByText('standing: 12')).toBeInTheDocument();
    expect(screen.getByText('Competitor A')).toBeInTheDocument();
  });

  it('renders analytics error state when analytics fetch fails', async () => {
    const api = createMatchesApiMock({
      getMatchAnalytics: vi.fn(async () => {
        throw new Error('analytics unavailable');
      }),
    });

    render(<AnalyticsPanel api={api} matchId="match-1" refreshTrigger={0} />);

    expect(await screen.findByText('Unable to load analytics summary right now.')).toBeInTheDocument();
  });

  it('refreshes analytics when refresh trigger changes', async () => {
    const getMatchAnalytics = vi
      .fn()
      .mockResolvedValueOnce({
        matchId: 'match-1',
        totalEventCount: 0,
        eventCountsByType: {},
        totalPositionCount: 0,
        timeInPositionByTypeSeconds: {
          standing: 0,
          closed_guard: 0,
          open_guard: 0,
          half_guard: 0,
          side_control: 0,
          mount: 0,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        competitorTopTimeByPositionSeconds: {
          A: {
            standing: 0,
            closed_guard: 0,
            open_guard: 0,
            half_guard: 0,
            side_control: 0,
            mount: 0,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
          B: {
            standing: 0,
            closed_guard: 0,
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
        totalTrackedPositionTimeSeconds: 0,
      })
      .mockResolvedValueOnce({
        matchId: 'match-1',
        totalEventCount: 1,
        eventCountsByType: { takedown: 1 },
        totalPositionCount: 0,
        timeInPositionByTypeSeconds: {
          standing: 0,
          closed_guard: 0,
          open_guard: 0,
          half_guard: 0,
          side_control: 0,
          mount: 0,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        competitorTopTimeByPositionSeconds: {
          A: {
            standing: 0,
            closed_guard: 0,
            open_guard: 0,
            half_guard: 0,
            side_control: 0,
            mount: 0,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
          B: {
            standing: 0,
            closed_guard: 0,
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
        totalTrackedPositionTimeSeconds: 0,
      });

    const api = createMatchesApiMock({ getMatchAnalytics });
    const { rerender } = render(<AnalyticsPanel api={api} matchId="match-1" refreshTrigger={0} />);

    expect(await screen.findByText('Not enough annotation data yet. Add events or position states to generate analytics.')).toBeInTheDocument();

    rerender(<AnalyticsPanel api={api} matchId="match-1" refreshTrigger={1} />);

    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Total events: 1')).toBeInTheDocument();
  });
});
