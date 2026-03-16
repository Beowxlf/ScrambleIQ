import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EventPanel } from '../src/features/events/EventPanel';
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
    exportMatchDataset: async () => {
      throw new Error('exportMatchDataset was not mocked');
    },
    validateMatchDataset: async () => {
      throw new Error('validateMatchDataset was not mocked');
    },
    ...overrides,
  };
}

describe('EventPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders event list and click-to-seek interactions', async () => {
    const onSeekToTimestamp = vi.fn();
    const api = createMatchesApiMock({
      listTimelineEvents: async () => [
        { id: 'event-1', matchId: 'match-1', timestamp: 12, eventType: 'entry', competitor: 'A' as const },
        { id: 'event-2', matchId: 'match-1', timestamp: 42, eventType: 'guard_pass', competitor: 'B' as const, notes: 'from scramble' },
      ],
    });

    render(
      <EventPanel
        api={api}
        matchId="match-1"
        selectedEventId={null}
        onSeekToTimestamp={onSeekToTimestamp}
        onEventsMutated={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: '00:12 entry A' }));

    expect(onSeekToTimestamp).toHaveBeenCalledWith(12, 'event-1');
    expect(screen.getByText('Notes: from scramble')).toBeInTheDocument();
  });

  it('handles create, edit, and delete flows', async () => {
    const onEventsMutated = vi.fn(async () => undefined);
    const createTimelineEvent = vi.fn(async () => ({ id: 'event-2', matchId: 'match-1', timestamp: 24, eventType: 'sweep', competitor: 'B' as const }));
    const updateTimelineEvent = vi.fn(async () => ({ id: 'event-1', matchId: 'match-1', timestamp: 12, eventType: 'takedown', competitor: 'A' as const }));
    const deleteTimelineEvent = vi.fn(async () => undefined);

    const api = createMatchesApiMock({
      listTimelineEvents: async () => [{ id: 'event-1', matchId: 'match-1', timestamp: 12, eventType: 'entry', competitor: 'A' as const }],
      createTimelineEvent,
      updateTimelineEvent,
      deleteTimelineEvent,
    });

    render(
      <EventPanel
        api={api}
        matchId="match-1"
        selectedEventId={null}
        onSeekToTimestamp={vi.fn()}
        onEventsMutated={onEventsMutated}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Add Event' }));
    fireEvent.change(screen.getByLabelText('Timestamp (seconds)'), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'sweep' } });
    fireEvent.change(screen.getByLabelText('Competitor'), { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));

    await waitFor(() => expect(createTimelineEvent).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('button', { name: '00:24 sweep B' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Event' })[0]);
    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'takedown' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Event' }));

    await waitFor(() => expect(updateTimelineEvent).toHaveBeenCalledWith('event-1', expect.any(Object)));
    expect(await screen.findByRole('button', { name: '00:12 takedown A' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Event' })[0]);
    await waitFor(() => expect(deleteTimelineEvent).toHaveBeenCalledWith('event-1'));
    expect(onEventsMutated).toHaveBeenCalled();
  });

  it('shows validation errors for empty event form submission', async () => {
    const api = createMatchesApiMock();

    render(
      <EventPanel
        api={api}
        matchId="match-1"
        selectedEventId={null}
        onSeekToTimestamp={vi.fn()}
        onEventsMutated={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Add Event' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));

    expect(await screen.findByText('Timestamp is required.')).toBeInTheDocument();
    expect(screen.getByText('Event type is required.')).toBeInTheDocument();
    expect(screen.getByText('Competitor is required.')).toBeInTheDocument();
  });
});
