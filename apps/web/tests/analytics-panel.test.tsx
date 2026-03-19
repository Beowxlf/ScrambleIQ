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

  it('renders coach-focused analytics summaries after loading completes', async () => {
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
    expect(await screen.findByRole('heading', { name: 'Coach summary' })).toBeInTheDocument();
    expect(screen.getByText('Annotation coverage:')).toBeInTheDocument();
    expect(screen.getByText('Most frequent event:')).toBeInTheDocument();
    expect(screen.getByText('Most tracked position:')).toBeInTheDocument();
    expect(screen.getByText('Top-control leader:')).toBeInTheDocument();
    expect(screen.getByText((_content, element) => element?.textContent === 'standing: 12s (60%)')).toBeInTheDocument();
    expect(screen.getByText('Competitor A')).toBeInTheDocument();
    expect(screen.getByText((_content, element) => element?.textContent === 'Total top control time: 14s')).toBeInTheDocument();
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
          standing: 60,
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
            standing: 30,
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
            standing: 20,
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
        totalTrackedPositionTimeSeconds: 60,
      });

    const api = createMatchesApiMock({ getMatchAnalytics });
    const { rerender } = render(<AnalyticsPanel api={api} matchId="match-1" refreshTrigger={0} />);

    expect(await screen.findByText('Not enough annotation data yet. Add events or position states to generate analytics.')).toBeInTheDocument();

    rerender(<AnalyticsPanel api={api} matchId="match-1" refreshTrigger={1} />);

    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Competitor A led top control by 10 seconds.')).toBeInTheDocument();
  });

  it('classifies a substantial annotation set when event, position, and tracked time are high', async () => {
    const api = createMatchesApiMock({
      getMatchAnalytics: async (matchId: string) => ({
        matchId,
        totalEventCount: 16,
        eventCountsByType: { takedown: 6, pass: 5, sweep: 5 },
        totalPositionCount: 8,
        timeInPositionByTypeSeconds: {
          standing: 90,
          closed_guard: 80,
          open_guard: 60,
          half_guard: 40,
          side_control: 20,
          mount: 10,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        competitorTopTimeByPositionSeconds: {
          A: {
            standing: 120,
            closed_guard: 30,
            open_guard: 20,
            half_guard: 10,
            side_control: 0,
            mount: 0,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
          B: {
            standing: 40,
            closed_guard: 10,
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
        totalTrackedPositionTimeSeconds: 300,
      }),
    });

    render(<AnalyticsPanel api={api} matchId="match-2" refreshTrigger={0} />);

    expect(await screen.findByText('Substantial (24 total annotations)')).toBeInTheDocument();
    expect(screen.getByText('Competitor A led top control by 130 seconds.')).toBeInTheDocument();
  });
});
