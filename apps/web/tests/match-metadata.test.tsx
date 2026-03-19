/* @vitest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MatchNotFoundError, type MatchesApi } from '../src/matches-api';
import { useMatchMetadata } from '../src/features/match-metadata/useMatchMetadata';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
    getMatch: async (id: string) => ({
      id,
      title: 'State Finals',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
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

describe('useMatchMetadata', () => {
  it('handles metadata edit CRUD updates and leaves edit mode after save', async () => {
    const updateMatch = vi.fn(async (id: string, payload) => ({
      id,
      title: payload.title,
      date: payload.date,
      ruleset: payload.ruleset,
      competitorA: payload.competitorA,
      competitorB: payload.competitorB,
      notes: payload.notes ?? '',
    }));

    const api = createMatchesApiMock({ updateMatch });

    const { result } = renderHook(() => useMatchMetadata({ api, matchId: 'match-1', onMatchDeleted: vi.fn() }));

    await waitFor(() => expect(result.current.isLoadingMatch).toBe(false));

    act(() => {
      result.current.startEdit();
      result.current.setEditValue('title', 'Updated Finals');
    });

    await act(async () => {
      await result.current.submitEdit({ preventDefault: vi.fn(), nativeEvent: new Event('submit') } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(updateMatch).toHaveBeenCalledWith('match-1', expect.objectContaining({ title: 'Updated Finals' }));
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.match?.title).toBe('Updated Finals');
  });

  it('treats missing match delete as completed deletion and signals page callback', async () => {
    const onMatchDeleted = vi.fn();
    const api = createMatchesApiMock({
      deleteMatch: vi.fn(async () => {
        throw new MatchNotFoundError('match-1');
      }),
    });

    const { result } = renderHook(() => useMatchMetadata({ api, matchId: 'match-1', onMatchDeleted }));

    await waitFor(() => expect(result.current.isLoadingMatch).toBe(false));

    await act(async () => {
      await result.current.deleteMatch();
    });

    expect(onMatchDeleted).toHaveBeenCalledTimes(1);
    expect(result.current.deleteError).toBeNull();
  });
});
