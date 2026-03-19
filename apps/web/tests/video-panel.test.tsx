import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VideoPanel } from '../src/features/video/VideoPanel';
import { HttpRequestError, MatchVideoNotFoundError } from '../src/matches-api';
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
      throw new MatchVideoNotFoundError('match-1');
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

describe('VideoPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders empty state when no metadata exists', async () => {
    const api = createMatchesApiMock();

    render(<VideoPanel api={api} matchId="match-1" seekRequest={null} onVideoMetadataMutated={() => undefined} />);

    expect(await screen.findByText('No video attached yet.')).toBeInTheDocument();
  });

  it('shows load error when video metadata request fails for non-not-found reasons', async () => {
    const api = createMatchesApiMock({
      getMatchVideo: async () => {
        throw new HttpRequestError('Failed to load match video. Internal server error', 500, ['Internal server error']);
      },
    });

    render(<VideoPanel api={api} matchId="match-1" seekRequest={null} onVideoMetadataMutated={() => undefined} />);

    expect(await screen.findByText('Failed to load match video. Internal server error')).toBeInTheDocument();
    expect(screen.queryByText('No video attached yet.')).not.toBeInTheDocument();
  });

  it('supports attach metadata flow', async () => {
    const createMatchVideo = vi.fn(async () => ({
      id: 'video-1',
      matchId: 'match-1',
      title: 'Main camera',
      sourceType: 'remote_url' as const,
      sourceUrl: 'https://cdn.example.com/match.mp4',
      durationSeconds: 180,
      notes: 'Round 1',
    }));
    const api = createMatchesApiMock({ createMatchVideo });

    render(<VideoPanel api={api} matchId="match-1" seekRequest={null} onVideoMetadataMutated={() => undefined} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Attach Video' }));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Main camera' } });
    fireEvent.change(screen.getByLabelText('Source Type'), { target: { value: 'remote_url' } });
    fireEvent.change(screen.getByLabelText('Source URL'), { target: { value: 'https://cdn.example.com/match.mp4' } });
    fireEvent.change(screen.getByLabelText('Duration (seconds)'), { target: { value: '180' } });
    fireEvent.click(screen.getByRole('button', { name: 'Attach Video' }));

    await waitFor(() => expect(createMatchVideo).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Title: Main camera')).toBeInTheDocument();
  });

  it('supports update and delete metadata flows', async () => {
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
    const api = createMatchesApiMock({
      getMatchVideo: async () => ({
        id: 'video-1',
        matchId: 'match-1',
        title: 'Main camera',
        sourceType: 'remote_url',
        sourceUrl: 'https://cdn.example.com/match.mp4',
        durationSeconds: 180,
        notes: 'Round 1',
      }),
      updateMatchVideo,
      deleteMatchVideo,
    });

    render(<VideoPanel api={api} matchId="match-1" seekRequest={null} onVideoMetadataMutated={() => undefined} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Video' }));
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

  it('seeks playback when timestamp request is provided', async () => {
    const api = createMatchesApiMock({
      getMatchVideo: async () => ({
        id: 'video-1',
        matchId: 'match-1',
        title: 'Main camera',
        sourceType: 'remote_url',
        sourceUrl: 'https://cdn.example.com/match.mp4',
      }),
    });

    const { rerender } = render(<VideoPanel api={api} matchId="match-1" seekRequest={null} onVideoMetadataMutated={() => undefined} />);

    const player = (await screen.findByTestId('match-video-player')) as HTMLVideoElement;
    Object.defineProperty(player, 'currentTime', { value: 0, writable: true });
    Object.defineProperty(player, 'play', { value: vi.fn(() => Promise.resolve()), writable: true });

    fireEvent.loadedMetadata(player);

    rerender(
      <VideoPanel
        api={api}
        matchId="match-1"
        seekRequest={{ timestamp: 22, requestId: 1 }}
        onVideoMetadataMutated={() => undefined}
      />,
    );

    await waitFor(() => {
      expect(player.currentTime).toBe(22);
    });
  });
});
