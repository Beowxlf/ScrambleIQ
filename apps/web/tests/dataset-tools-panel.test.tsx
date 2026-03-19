/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DatasetValidationReport, MatchDatasetExport } from '@scrambleiq/shared';

import { DatasetToolsPanel } from '../src/features/dataset/DatasetToolsPanel';
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
    validateMatchDataset: async (matchId: string) => ({
      matchId,
      isValid: true,
      issueCount: 0,
      issues: [],
    }),
    ...overrides,
  };
}

const datasetExportFixture: MatchDatasetExport = {
  match: {
    id: 'match-7',
    title: 'State Finals',
    date: '2026-03-01',
    ruleset: 'Folkstyle',
    competitorA: 'Alex Carter',
    competitorB: 'Sam Jordan',
    notes: '',
  },
  video: null,
  events: [],
  positions: [],
  analytics: {
    matchId: 'match-7',
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
  },
};

describe('DatasetToolsPanel', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('exports dataset JSON and preserves download filename convention', async () => {
    const exportMatchDataset = vi.fn(async () => datasetExportFixture);

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement');
    const clickSpy = vi.fn();
    const anchorMock = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;

    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchorMock;
      }

      return originalCreateElement(tagName);
    });

    const createObjectUrlSpy = vi.fn(() => 'blob:dataset');
    const revokeObjectUrlSpy = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectUrlSpy, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectUrlSpy, configurable: true });

    const api = createMatchesApiMock({ exportMatchDataset });

    render(<DatasetToolsPanel api={api} matchId="match-7" refreshTrigger={0} />);

    expect(screen.getByText(/deterministic JSON artifacts for downstream review and auditing/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Export artifact contents' })).toBeInTheDocument();
    expect(screen.getByText('Validation not run yet. Export is available for manual review, but readiness is unknown.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export Dataset JSON' }));

    await waitFor(() => expect(exportMatchDataset).toHaveBeenCalledWith('match-7'));
    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
    expect(anchorMock.download).toBe('match-match-7-dataset.json');
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:dataset');
  });

  it('shows validation loading and then renders grouped validation report content', async () => {
    const validationReport: DatasetValidationReport = {
      matchId: 'match-1',
      isValid: false,
      issueCount: 3,
      issues: [
        { severity: 'ERROR', type: 'MISSING_VIDEO', message: 'Video metadata missing', context: { field: 'sourceUrl' } },
        { severity: 'WARNING', type: 'ANALYTICS_MISMATCH', message: 'Few events detected' },
        { severity: 'INFO', type: 'EMPTY_MATCH', message: 'No match notes' },
      ],
    };

    const validateMatchDataset = vi.fn(async () => validationReport);

    const api = createMatchesApiMock({ validateMatchDataset });

    render(<DatasetToolsPanel api={api} matchId="match-1" refreshTrigger={0} />);

    fireEvent.click(screen.getByRole('button', { name: 'Validate Dataset' }));

    expect(screen.getByText('Validating dataset...')).toBeInTheDocument();
    expect(
      screen.getByText('Validation in progress. Wait for results before deciding whether this export is production-ready.'),
    ).toBeInTheDocument();

    expect(await screen.findByText('Validation status:')).toBeInTheDocument();
    expect(screen.getByText('Total issues:')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Blocking issues \(ERROR\)/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Warnings \(WARNING\)/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Informational notes \(INFO\)/ })).toBeInTheDocument();
    expect(screen.getByText(/Video metadata missing/)).toBeInTheDocument();
    expect(
      screen.getByText('Risky export: blocking validation issues were found. Export only for debugging or manual inspection.'),
    ).toBeInTheDocument();
  });

  it('shows export and validation error states when API calls fail', async () => {
    const api = createMatchesApiMock({
      exportMatchDataset: vi.fn(async () => {
        throw new Error('export failed');
      }),
      validateMatchDataset: vi.fn(async () => {
        throw new Error('validation failed');
      }),
    });

    render(<DatasetToolsPanel api={api} matchId="match-1" refreshTrigger={0} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export Dataset JSON' }));
    expect(await screen.findByText('Unable to export dataset right now. Please try again.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Validate Dataset' }));
    expect(await screen.findByText('Unable to validate dataset right now. Please try again.')).toBeInTheDocument();
    expect(
      screen.getByText('Validation unavailable. Export is still possible, but treat the artifact as risky until validation succeeds.'),
    ).toBeInTheDocument();
  });
});
