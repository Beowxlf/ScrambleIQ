import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReviewTemplate, ReviewTemplateMetadata } from '@scrambleiq/shared';

import { App } from '../src/App';
import { HttpRequestError, MatchVideoNotFoundError, type MatchesApi, ReviewTemplateNotFoundError } from '../src/matches-api';

function templateMetadata(overrides: Partial<ReviewTemplateMetadata> = {}): ReviewTemplateMetadata {
  return {
    id: 'template-1',
    name: 'Post-match baseline',
    description: 'Coach-led review sequence',
    scope: 'single_match_review',
    checklistItemCount: 2,
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-20T00:00:00.000Z',
    ...overrides,
  };
}

function templateDetail(overrides: Partial<ReviewTemplate> = {}): ReviewTemplate {
  return {
    ...templateMetadata(),
    checklistItems: [
      { id: 'item-1', label: 'Opening exchange', isRequired: true, sortOrder: 0, description: 'first minute entries' },
      { id: 'item-2', label: 'Top pressure', isRequired: false, sortOrder: 1 },
    ],
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
      throw new MatchVideoNotFoundError('match-1');
    },
    updateMatchVideo: async () => {
      throw new Error('updateMatchVideo was not mocked');
    },
    deleteMatchVideo: async () => undefined,
    listReviewTemplates: async () => [templateMetadata()],
    getReviewTemplate: async () => templateDetail(),
    createReviewTemplate: async () => templateDetail({ id: 'template-2', name: 'Created template' }),
    updateReviewTemplate: async (id) => templateDetail({ id, name: 'Updated template' }),
    deleteReviewTemplate: async () => undefined,
    ...overrides,
  };
}

describe('Review template UI', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/matches/match-1');
  });

  afterEach(() => {
    cleanup();
  });

  it('supports create, list, edit, and delete flows', async () => {
    const createReviewTemplate = vi.fn(async () => templateDetail({ id: 'template-2', name: 'Created template' }));
    const updateReviewTemplate = vi.fn(async () => templateDetail({ id: 'template-1', name: 'Edited template' }));
    const deleteReviewTemplate = vi.fn(async () => undefined);

    const api = createMatchesApiMock({
      createReviewTemplate,
      updateReviewTemplate,
      deleteReviewTemplate,
      listReviewTemplates: async () => [templateMetadata()],
      getReviewTemplate: async (id) => templateDetail({ id }),
    });

    render(<App matchesApi={api} />);

    expect(await screen.findByRole('heading', { name: 'Review Templates' })).toBeInTheDocument();
    expect(await screen.findByText('Post-match baseline')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Review Template' }));
    fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Created template' } });
    fireEvent.change(screen.getByLabelText('Template Description'), { target: { value: 'new template notes' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Grip sequence' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

    await waitFor(() => expect(createReviewTemplate).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText('Created template')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Template' })[0]);
    fireEvent.change(await screen.findByLabelText('Template Name'), { target: { value: 'Edited template' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Template' }));

    await waitFor(() => expect(updateReviewTemplate).toHaveBeenCalledTimes(1));
    expect((await screen.findAllByText('Edited template')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Template' })[0]);
    await waitFor(() => expect(deleteReviewTemplate).toHaveBeenCalledTimes(1));
  });

  it('shows invalid input behavior for empty form values', async () => {
    const api = createMatchesApiMock();

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Review Templates' });
    fireEvent.click(screen.getByRole('button', { name: 'Create Review Template' }));
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

    expect(await screen.findByText('Template name is required.')).toBeInTheDocument();
    expect(screen.getByText('Checklist item label is required.')).toBeInTheDocument();
  });

  it('surfaces backend validation errors when template save fails', async () => {
    const api = createMatchesApiMock({
      createReviewTemplate: async () => {
        throw new HttpRequestError('Failed to create review template. name should not be empty', 400, ['name should not be empty']);
      },
    });

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Review Templates' });
    fireEvent.click(screen.getByRole('button', { name: 'Create Review Template' }));
    fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Any template' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Any checklist item' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

    expect(await screen.findByText('Failed to create review template. name should not be empty')).toBeInTheDocument();
  });

  it('handles not-found responses while loading selected template details', async () => {
    const api = createMatchesApiMock({
      getReviewTemplate: async () => {
        throw new ReviewTemplateNotFoundError('template-1');
      },
    });

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Review Templates' });
    fireEvent.click((await screen.findAllByRole('button', { name: 'View Template' }))[0]);

    expect(await screen.findByText('This template no longer exists. The template list has been refreshed.')).toBeInTheDocument();
  });

  it('applies a template into the match review workflow with manual checklist toggles', async () => {
    const api = createMatchesApiMock();

    render(<App matchesApi={api} />);

    await screen.findByRole('heading', { name: 'Review Templates' });
    fireEvent.click((await screen.findAllByRole('button', { name: 'Apply in Review Workflow' }))[0]);

    expect(await screen.findByText('Active template:')).toBeInTheDocument();
    const openingExchangeCheckbox = screen.getByRole('checkbox', { name: /Opening exchange/ });
    expect(openingExchangeCheckbox).not.toBeChecked();

    fireEvent.click(openingExchangeCheckbox);
    expect(openingExchangeCheckbox).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Applied Template' }));
    expect(await screen.findByText('No template applied to this review session.')).toBeInTheDocument();
  });
});
