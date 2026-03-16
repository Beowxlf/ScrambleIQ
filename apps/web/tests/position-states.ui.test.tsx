import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PositionState } from '@scrambleiq/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../src/App';
import { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => [],
    getMatch: async (id) => ({
      id,
      title: 'Open Finals',
      date: '2026-03-10',
      ruleset: 'Freestyle',
      competitorA: 'Jordan Lee',
      competitorB: 'Chris Park',
      notes: '',
    }),
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
    getMatchVideo: async () => {
      throw new Error('Match video not found');
    },
    updateMatchVideo: async () => {
      throw new Error('updateMatchVideo was not mocked');
    },
    deleteMatchVideo: async () => undefined,
    ...overrides,
  };
}

function basePosition(overrides: Partial<PositionState> = {}): PositionState {
  return {
    id: 'position-1',
    matchId: 'match-1',
    position: 'closed_guard',
    competitorTop: 'A',
    timestampStart: 12,
    timestampEnd: 20,
    ...overrides,
  };
}

describe('Position states UI', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/matches/match-1');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders position list sorted display', async () => {
    const matchesApi = createMatchesApiMock({
      listPositionStates: async () => [
        basePosition({ id: 'position-2', timestampStart: 42, timestampEnd: 55, position: 'mount', competitorTop: 'B' }),
        basePosition({ id: 'position-1', timestampStart: 12, timestampEnd: 20, position: 'closed_guard', competitorTop: 'A' }),
      ],
    });

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('00:12 - 00:20 closed_guard top: A')).toBeInTheDocument();
    expect(screen.getByText('00:42 - 00:55 mount top: B')).toBeInTheDocument();
  });

  it('handles position creation flow', async () => {
    const createPositionState = vi.fn(async () => basePosition());
    const matchesApi = createMatchesApiMock({ createPositionState });

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add Position' }));
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'closed_guard' } });
    fireEvent.change(screen.getByLabelText('Top Competitor'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Start Timestamp (seconds)'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('End Timestamp (seconds)'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Position' }));

    await waitFor(() => expect(createPositionState).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('00:12 - 00:20 closed_guard top: A')).toBeInTheDocument();
  });

  it('handles position edit flow', async () => {
    const updatePositionState = vi.fn(async () => basePosition({ position: 'mount' }));
    const matchesApi = createMatchesApiMock({
      listPositionStates: async () => [basePosition()],
      updatePositionState,
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Position' }));
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'mount' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Position' }));

    await waitFor(() => expect(updatePositionState).toHaveBeenCalledWith('position-1', expect.any(Object)));
    expect(await screen.findByText('00:12 - 00:20 mount top: A')).toBeInTheDocument();
  });

  it('handles position delete flow', async () => {
    const deletePositionState = vi.fn(async () => undefined);
    const matchesApi = createMatchesApiMock({
      listPositionStates: async () => [basePosition()],
      deletePositionState,
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Position' }));

    await waitFor(() => expect(deletePositionState).toHaveBeenCalledWith('position-1'));
    expect(await screen.findByText('No position states yet.')).toBeInTheDocument();
  });

  it('shows validation errors for position form', async () => {
    const matchesApi = createMatchesApiMock();

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add Position' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Position' }));

    expect(await screen.findByText('Position is required.')).toBeInTheDocument();
    expect(screen.getByText('Top competitor is required.')).toBeInTheDocument();
    expect(screen.getByText('Start timestamp is required.')).toBeInTheDocument();
    expect(screen.getByText('End timestamp is required.')).toBeInTheDocument();
  });
});
