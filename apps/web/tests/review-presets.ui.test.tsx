import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SavedReviewPreset, SavedReviewPresetMetadata } from '@scrambleiq/shared';

import { App } from '../src/App';
import {
  HttpRequestError,
  MatchVideoNotFoundError,
  SavedReviewPresetNotFoundError,
  type MatchesApi,
} from '../src/matches-api';

function presetMetadata(overrides: Partial<SavedReviewPresetMetadata> = {}): SavedReviewPresetMetadata {
  return {
    id: 'preset-1',
    name: 'Competition focus',
    description: 'Only key scoring exchanges',
    scope: 'match_detail',
    createdAt: '2026-03-21T00:00:00.000Z',
    updatedAt: '2026-03-21T00:00:00.000Z',
    ...overrides,
  };
}

function presetDetail(overrides: Partial<SavedReviewPreset> = {}): SavedReviewPreset {
  return {
    ...presetMetadata(),
    config: {
      eventTypeFilters: ['takedown'],
      competitorFilter: 'A',
      positionFilters: ['standing'],
      showOnlyValidationIssues: false,
    },
    ...overrides,
  };
}

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
    listTimelineEvents: async () => [
      { id: 'event-1', matchId: 'match-1', timestamp: 12, eventType: 'takedown', competitor: 'A' },
      { id: 'event-2', matchId: 'match-1', timestamp: 24, eventType: 'escape', competitor: 'B' },
    ],
    updateTimelineEvent: async () => {
      throw new Error('updateTimelineEvent was not mocked');
    },
    deleteTimelineEvent: async () => undefined,
    createPositionState: async () => {
      throw new Error('createPositionState was not mocked');
    },
    listPositionStates: async () => [
      {
        id: 'position-1',
        matchId: 'match-1',
        position: 'standing',
        competitorTop: 'A',
        timestampStart: 10,
        timestampEnd: 16,
      },
      {
        id: 'position-2',
        matchId: 'match-1',
        position: 'mount',
        competitorTop: 'B',
        timestampStart: 20,
        timestampEnd: 30,
      },
    ],
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
    getMatchAnalytics: async (matchId: string) => ({
      matchId,
      totalEventCount: 2,
      eventCountsByType: {},
      totalPositionCount: 2,
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
    listSavedReviewPresets: async () => [presetMetadata()],
    getSavedReviewPreset: async () => presetDetail(),
    createSavedReviewPreset: async () => presetDetail({ id: 'preset-2', name: 'Created preset' }),
    updateSavedReviewPreset: async (id) => presetDetail({ id, name: 'Edited preset' }),
    deleteSavedReviewPreset: async () => undefined,
    ...overrides,
  };
}

describe('Saved review presets UI', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/matches/match-1');
  });

  afterEach(() => {
    cleanup();
  });

  it('supports create, list, edit, and delete flows', async () => {
    const createSavedReviewPreset = vi.fn(async () => presetDetail({ id: 'preset-2', name: 'Created preset' }));
    const updateSavedReviewPreset = vi.fn(async () => presetDetail({ id: 'preset-1', name: 'Edited preset' }));
    const deleteSavedReviewPreset = vi.fn(async () => undefined);

    const api = createMatchesApiMock({
      createSavedReviewPreset,
      updateSavedReviewPreset,
      deleteSavedReviewPreset,
      listSavedReviewPresets: async () => [presetMetadata()],
      getSavedReviewPreset: async (id) => presetDetail({ id }),
    });

    render(<App matchesApi={api} />);

    expect(await screen.findByRole('heading', { name: 'Saved Review Presets' })).toBeInTheDocument();
    expect(await screen.findByText('Competition focus')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Saved Review Preset' }));
    fireEvent.change(screen.getByLabelText('Preset Name'), { target: { value: 'Created preset' } });
    fireEvent.change(screen.getByLabelText('Preset Description'), { target: { value: 'Preset notes' } });
    fireEvent.change(screen.getByLabelText('Event type filters (comma-separated)', { selector: '#preset-event-type-filters' }), { target: { value: 'sweep, pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Preset' }));

    await waitFor(() => expect(createSavedReviewPreset).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText('Created preset')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Preset' })[0]);
    fireEvent.change(await screen.findByLabelText('Preset Name'), { target: { value: 'Edited preset' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }));

    await waitFor(() => expect(updateSavedReviewPreset).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText('Edited preset')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Preset' })[0]);
    await waitFor(() => expect(deleteSavedReviewPreset).toHaveBeenCalledTimes(1));
  });

  it('shows invalid input behavior for empty form values', async () => {
    const api = createMatchesApiMock();

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Saved Review Presets' });
    fireEvent.click(screen.getByRole('button', { name: 'Create Saved Review Preset' }));
    fireEvent.change(screen.getByLabelText('Preset Name'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Preset' }));

    expect(await screen.findByText('Preset name is required.')).toBeInTheDocument();
  });

  it('surfaces backend validation errors when preset save fails', async () => {
    const api = createMatchesApiMock({
      createSavedReviewPreset: async () => {
        throw new HttpRequestError('Failed to create saved review preset. name should not be empty', 400, ['name should not be empty']);
      },
    });

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Saved Review Presets' });
    fireEvent.click(screen.getByRole('button', { name: 'Create Saved Review Preset' }));
    fireEvent.change(screen.getByLabelText('Preset Name'), { target: { value: 'Any preset' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Preset' }));

    expect(await screen.findByText('Failed to create saved review preset. name should not be empty')).toBeInTheDocument();
  });

  it('handles not-found responses while loading selected preset details', async () => {
    const api = createMatchesApiMock({
      getSavedReviewPreset: async () => {
        throw new SavedReviewPresetNotFoundError('preset-1');
      },
    });

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Saved Review Presets' });
    fireEvent.click((await screen.findAllByRole('button', { name: 'View Preset' }))[0]);

    expect(await screen.findByText('This saved preset no longer exists. The preset list has been refreshed.')).toBeInTheDocument();
  });

  it('applies a preset into the match review workflow by restoring visible review settings', async () => {
    const api = createMatchesApiMock();

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Saved Review Presets' });
    expect(await screen.findByRole('button', { name: '00:12 takedown A' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '00:24 escape B' })).toBeInTheDocument();

    fireEvent.click((await screen.findAllByRole('button', { name: 'Apply in Review Workflow' }))[0]);

    expect(await screen.findByText('Current settings are from preset: Competition focus.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '00:12 takedown A' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '00:24 escape B' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '00:10 - 00:16 standing top: A' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '00:20 - 00:30 mount top: B' })).not.toBeInTheDocument();
  });
});
