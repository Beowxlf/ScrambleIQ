import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    createTimelineEvent: async () => ({ id: 'event-1', matchId: 'match-1', timestamp: 12, eventType: 'entry', competitor: 'A' }),
    listTimelineEvents: async () => [{ id: 'event-1', matchId: 'match-1', timestamp: 12, eventType: 'entry', competitor: 'A' }],
    updateTimelineEvent: async () => {
      throw new Error('updateTimelineEvent was not mocked');
    },
    deleteTimelineEvent: async () => undefined,
    createPositionState: async () => ({ id: 'position-1', matchId: 'match-1', position: 'closed_guard', competitorTop: 'A', timestampStart: 16, timestampEnd: 30 }),
    listPositionStates: async () => [{ id: 'position-1', matchId: 'match-1', position: 'closed_guard', competitorTop: 'A', timestampStart: 16, timestampEnd: 30 }],
    updatePositionState: async () => {
      throw new Error('updatePositionState was not mocked');
    },
    deletePositionState: async () => undefined,
    createMatchVideo: async () => {
      throw new Error('createMatchVideo was not mocked');
    },
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

describe('Video review UI', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/matches/match-1');
  });

  afterEach(() => {
    cleanup();
  });

  it('shows empty state when no video exists and supports attach/edit/delete flows', async () => {
    const createMatchVideo = vi.fn(async () => ({
      id: 'video-1',
      matchId: 'match-1',
      title: 'Main camera',
      sourceType: 'remote_url' as const,
      sourceUrl: 'https://cdn.example.com/match.mp4',
      durationSeconds: 180,
      notes: 'Round 1',
    }));
    const updateMatchVideo = vi.fn(async () => ({
      id: 'video-1',
      matchId: 'match-1',
      title: 'Main camera edited',
      sourceType: 'local_demo' as const,
      sourceUrl: 'https://cdn.example.com/match.mp4',
      durationSeconds: 200,
      notes: 'Updated',
    }));
    const deleteMatchVideo = vi.fn(async () => undefined);

    const matchesApi = createMatchesApiMock({ createMatchVideo, updateMatchVideo, deleteMatchVideo });

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('No video attached yet.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Attach Video' }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Main camera' } });
    fireEvent.change(screen.getByLabelText('Source Type'), { target: { value: 'remote_url' } });
    fireEvent.change(screen.getByLabelText('Source URL'), { target: { value: 'https://cdn.example.com/match.mp4' } });
    fireEvent.change(screen.getByLabelText('Duration (seconds)'), { target: { value: '180' } });
    fireEvent.click(screen.getByRole('button', { name: 'Attach Video' }));

    await waitFor(() => expect(createMatchVideo).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Title: Main camera')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Video' }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Main camera edited' } });
    fireEvent.change(screen.getByLabelText('Source Type'), { target: { value: 'local_demo' } });
    fireEvent.change(screen.getByLabelText('Duration (seconds)'), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Video' }));

    await waitFor(() => expect(updateMatchVideo).toHaveBeenCalledWith('video-1', expect.any(Object)));
    expect(await screen.findByText('Title: Main camera edited')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Video' }));
    await waitFor(() => expect(deleteMatchVideo).toHaveBeenCalledWith('video-1'));
    expect(await screen.findByText('No video attached yet.')).toBeInTheDocument();
  });

  it('seeks video when timeline items are clicked and shows validation errors', async () => {
    const matchesApi = createMatchesApiMock({
      getMatchVideo: async () => ({
        id: 'video-1',
        matchId: 'match-1',
        title: 'Main camera',
        sourceType: 'remote_url',
        sourceUrl: 'https://cdn.example.com/match.mp4',
      }),
    });

    render(<App matchesApi={matchesApi} />);

    const player = (await screen.findByTestId('match-video-player')) as HTMLVideoElement;
    Object.defineProperty(player, 'currentTime', { value: 0, writable: true });
    Object.defineProperty(player, 'play', { value: vi.fn(() => Promise.resolve()), writable: true });
    fireEvent.loadedMetadata(player);

    fireEvent.click(screen.getByRole('button', { name: '00:12 entry A' }));
    expect(player.currentTime).toBe(12);

    fireEvent.click(screen.getByRole('button', { name: '00:16 - 00:30 closed_guard top: A' }));
    expect(player.currentTime).toBe(16);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Video' }));
    fireEvent.change(screen.getByLabelText('Source URL'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Video' }));
    expect(await screen.findByText('Source URL is required.')).toBeInTheDocument();
  });
});
