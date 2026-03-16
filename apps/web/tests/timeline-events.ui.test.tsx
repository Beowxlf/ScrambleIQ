import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TimelineEvent } from '@scrambleiq/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../src/App';
import { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
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
    exportMatchDataset: async () => {
      throw new Error('exportMatchDataset was not mocked');
    },
    validateMatchDataset: async (matchId: string) => ({
      matchId,
      isValid: true,
      issueCount: 0,
      issues: [],
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

function baseEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    id: 'event-1',
    matchId: 'match-1',
    timestamp: 12,
    eventType: 'takedown_attempt',
    competitor: 'A',
    ...overrides,
  };
}

describe('Timeline events UI', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/matches/match-1');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders event list sorted display', async () => {
    const matchesApi = createMatchesApiMock({
      listTimelineEvents: async () => [
        baseEvent({ id: 'event-2', timestamp: 42, eventType: 'guard_pass', competitor: 'B' }),
        baseEvent({ id: 'event-1', timestamp: 12, eventType: 'takedown_attempt', competitor: 'A' }),
      ],
    });

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('00:12 takedown_attempt A')).toBeInTheDocument();
    expect(screen.getByText('00:42 guard_pass B')).toBeInTheDocument();
  });

  it('handles event creation flow', async () => {
    const createTimelineEvent = vi.fn(async () => baseEvent());
    const matchesApi = createMatchesApiMock({ createTimelineEvent });

    render(<App matchesApi={matchesApi} />);

    await screen.findByText('No timeline events yet.');
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));
    fireEvent.change(screen.getByLabelText('Timestamp (seconds)'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'takedown_attempt' } });
    fireEvent.change(screen.getByLabelText('Competitor'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));

    await waitFor(() => expect(createTimelineEvent).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('00:12 takedown_attempt A')).toBeInTheDocument();
  });

  it('handles event edit flow', async () => {
    const updateTimelineEvent = vi.fn(async () => baseEvent({ eventType: 'takedown_completed' }));
    const matchesApi = createMatchesApiMock({
      listTimelineEvents: async () => [baseEvent()],
      updateTimelineEvent,
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Event' }));
    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'takedown_completed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Event' }));

    await waitFor(() => expect(updateTimelineEvent).toHaveBeenCalledWith('event-1', expect.any(Object)));
    expect(await screen.findByText('00:12 takedown_completed A')).toBeInTheDocument();
  });

  it('handles event delete flow', async () => {
    const deleteTimelineEvent = vi.fn(async () => undefined);
    const matchesApi = createMatchesApiMock({
      listTimelineEvents: async () => [baseEvent()],
      deleteTimelineEvent,
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Event' }));

    await waitFor(() => expect(deleteTimelineEvent).toHaveBeenCalledWith('event-1'));
    expect(await screen.findByText('No timeline events yet.')).toBeInTheDocument();
  });

  it('shows validation errors for event form', async () => {
    const matchesApi = createMatchesApiMock();

    render(<App matchesApi={matchesApi} />);

    await screen.findByText('No timeline events yet.');
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));

    expect(await screen.findByText('Timestamp is required.')).toBeInTheDocument();
    expect(screen.getByText('Event type is required.')).toBeInTheDocument();
    expect(screen.getByText('Competitor is required.')).toBeInTheDocument();
  });
});
