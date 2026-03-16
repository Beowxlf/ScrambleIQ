import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PositionPanel } from '../src/features/positions/PositionPanel';
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

describe('PositionPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders positions sorted and supports click-to-seek', async () => {
    const onSeekToTimestamp = vi.fn();
    const api = createMatchesApiMock({
      listPositionStates: async () => [
        {
          id: 'position-2',
          matchId: 'match-1',
          position: 'mount',
          competitorTop: 'B',
          timestampStart: 42,
          timestampEnd: 55,
        },
        {
          id: 'position-1',
          matchId: 'match-1',
          position: 'closed_guard',
          competitorTop: 'A',
          timestampStart: 12,
          timestampEnd: 20,
          notes: 'entry',
        },
      ],
    });

    render(
      <PositionPanel
        api={api}
        matchId="match-1"
        selectedPositionId={null}
        onSeekToTimestamp={onSeekToTimestamp}
        onPositionsMutated={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: '00:12 - 00:20 closed_guard top: A' }));

    expect(onSeekToTimestamp).toHaveBeenCalledWith(12, 'position-1');
    expect(screen.getByRole('button', { name: '00:42 - 00:55 mount top: B' })).toBeInTheDocument();
    expect(screen.getByText('Notes: entry')).toBeInTheDocument();
  });

  it('handles create, edit, and delete flows', async () => {
    const onPositionsMutated = vi.fn(async () => undefined);
    const createPositionState = vi.fn(async () => ({
      id: 'position-2',
      matchId: 'match-1',
      position: 'half_guard' as const,
      competitorTop: 'B' as const,
      timestampStart: 24,
      timestampEnd: 30,
    }));
    const updatePositionState = vi.fn(async () => ({
      id: 'position-1',
      matchId: 'match-1',
      position: 'mount' as const,
      competitorTop: 'A' as const,
      timestampStart: 12,
      timestampEnd: 20,
    }));
    const deletePositionState = vi.fn(async () => undefined);

    const api = createMatchesApiMock({
      listPositionStates: async () => [
        {
          id: 'position-1',
          matchId: 'match-1',
          position: 'closed_guard',
          competitorTop: 'A',
          timestampStart: 12,
          timestampEnd: 20,
        },
      ],
      createPositionState,
      updatePositionState,
      deletePositionState,
    });

    render(
      <PositionPanel
        api={api}
        matchId="match-1"
        selectedPositionId={null}
        onSeekToTimestamp={vi.fn()}
        onPositionsMutated={onPositionsMutated}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Add Position' }));
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'half_guard' } });
    fireEvent.change(screen.getByLabelText('Top Competitor'), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText('Start Timestamp (seconds)'), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText('End Timestamp (seconds)'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Position' }));

    await waitFor(() => expect(createPositionState).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('button', { name: '00:24 - 00:30 half_guard top: B' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Position' })[0]);
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'mount' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Position' }));

    await waitFor(() => expect(updatePositionState).toHaveBeenCalledWith('position-1', expect.any(Object)));
    expect(await screen.findByRole('button', { name: '00:12 - 00:20 mount top: A' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Position' })[0]);
    await waitFor(() => expect(deletePositionState).toHaveBeenCalledWith('position-1'));
    expect(onPositionsMutated).toHaveBeenCalled();
  });

  it('shows overlap rejection message when save fails', async () => {
    const api = createMatchesApiMock({
      createPositionState: vi.fn(async () => {
        throw new Error('Position overlap detected');
      }),
    });

    render(
      <PositionPanel
        api={api}
        matchId="match-1"
        selectedPositionId={null}
        onSeekToTimestamp={vi.fn()}
        onPositionsMutated={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Add Position' }));
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'closed_guard' } });
    fireEvent.change(screen.getByLabelText('Top Competitor'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Start Timestamp (seconds)'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('End Timestamp (seconds)'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Position' }));

    expect(await screen.findByText('Unable to save position state. Please try again.')).toBeInTheDocument();
  });
});
