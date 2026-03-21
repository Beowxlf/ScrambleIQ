import type {
  CreateMatchDto,
  CreatePositionStateDto,
  CreateMatchVideoDto,
  CreateTimelineEventDto,
  DatasetValidationReport,
  Match,
  MatchAnalyticsSummary,
  MatchListResponse,
  MatchDatasetExport,
  MatchVideo,
  SavedReviewPreset,
  SavedReviewPresetMetadata,
  ReviewTemplate,
  ReviewTemplateMetadata,
  PositionState,
  TimelineEvent,
  UpdateMatchDto,
  UpdateMatchVideoDto,
  UpdatePositionStateDto,
  UpdateTimelineEventDto,
} from '@scrambleiq/shared';

export class MatchNotFoundError extends Error {
  constructor(matchId: string) {
    super(`Match with id ${matchId} was not found.`);
    this.name = 'MatchNotFoundError';
  }
}

export class HttpRequestError extends Error {
  readonly status: number;

  readonly details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = 'HttpRequestError';
    this.status = status;
    this.details = details;
  }
}

export class TimelineEventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Timeline event with id ${eventId} was not found.`);
    this.name = 'TimelineEventNotFoundError';
  }
}

export class PositionStateNotFoundError extends Error {
  constructor(positionId: string) {
    super(`Position state with id ${positionId} was not found.`);
    this.name = 'PositionStateNotFoundError';
  }
}


export class ReviewTemplateNotFoundError extends Error {
  constructor(templateId: string) {
    super(`Review template with id ${templateId} was not found.`);
    this.name = 'ReviewTemplateNotFoundError';
  }
}

export class SavedReviewPresetNotFoundError extends Error {
  constructor(presetId: string) {
    super(`Saved review preset with id ${presetId} was not found.`);
    this.name = 'SavedReviewPresetNotFoundError';
  }
}

export class MatchVideoNotFoundError extends Error {
  constructor(videoIdOrMatchId: string) {
    super(`Match video resource was not found for id ${videoIdOrMatchId}.`);
    this.name = 'MatchVideoNotFoundError';
  }
}
export interface MatchesApi {
  createMatch(payload: CreateMatchDto): Promise<Match>;
  listMatches(query?: { competitor?: string; dateFrom?: string; dateTo?: string; hasVideo?: boolean; limit?: number; offset?: number }): Promise<MatchListResponse>;
  getMatch(id: string): Promise<Match>;
  updateMatch(id: string, payload: UpdateMatchDto): Promise<Match>;
  deleteMatch(id: string): Promise<void>;
  createTimelineEvent(matchId: string, payload: CreateTimelineEventDto): Promise<TimelineEvent>;
  listTimelineEvents(matchId: string): Promise<TimelineEvent[]>;
  updateTimelineEvent(id: string, payload: UpdateTimelineEventDto): Promise<TimelineEvent>;
  deleteTimelineEvent(id: string): Promise<void>;
  createPositionState(matchId: string, payload: CreatePositionStateDto): Promise<PositionState>;
  listPositionStates(matchId: string): Promise<PositionState[]>;
  updatePositionState(id: string, payload: UpdatePositionStateDto): Promise<PositionState>;
  deletePositionState(id: string): Promise<void>;
  createMatchVideo(matchId: string, payload: CreateMatchVideoDto): Promise<MatchVideo>;
  getMatchAnalytics(matchId: string): Promise<MatchAnalyticsSummary>;
  exportMatchDataset(matchId: string): Promise<MatchDatasetExport>;
  validateMatchDataset(matchId: string): Promise<DatasetValidationReport>;
  getMatchVideo(matchId: string): Promise<MatchVideo>;
  updateMatchVideo(id: string, payload: UpdateMatchVideoDto): Promise<MatchVideo>;
  deleteMatchVideo(id: string): Promise<void>;
  createReviewTemplate?(payload: {
    name: string;
    description?: string;
    scope: 'single_match_review';
    checklistItems: Array<{
      label: string;
      description?: string;
      isRequired: boolean;
      sortOrder: number;
    }>;
  }): Promise<ReviewTemplate>;
  listReviewTemplates?(): Promise<ReviewTemplateMetadata[]>;
  getReviewTemplate?(id: string): Promise<ReviewTemplate>;
  updateReviewTemplate?(id: string, payload: {
    name?: string;
    description?: string;
    scope?: 'single_match_review';
    checklistItems?: Array<{
      label: string;
      description?: string;
      isRequired: boolean;
      sortOrder: number;
    }>;
  }): Promise<ReviewTemplate>;
  deleteReviewTemplate?(id: string): Promise<void>;
  createSavedReviewPreset?(payload: {
    name: string;
    description?: string;
    scope: 'match_detail';
    config: {
      eventTypeFilters?: string[];
      competitorFilter?: 'A' | 'B';
      positionFilters?: Array<
      | 'standing'
      | 'closed_guard'
      | 'open_guard'
      | 'half_guard'
      | 'side_control'
      | 'mount'
      | 'back_control'
      | 'north_south'
      | 'leg_entanglement'
      | 'scramble'
      >;
      showOnlyValidationIssues?: boolean;
    };
  }): Promise<SavedReviewPreset>;
  listSavedReviewPresets?(): Promise<SavedReviewPresetMetadata[]>;
  getSavedReviewPreset?(id: string): Promise<SavedReviewPreset>;
  updateSavedReviewPreset?(id: string, payload: {
    name?: string;
    description?: string;
    scope?: 'match_detail';
    config?: {
      eventTypeFilters?: string[];
      competitorFilter?: 'A' | 'B';
      positionFilters?: Array<
      | 'standing'
      | 'closed_guard'
      | 'open_guard'
      | 'half_guard'
      | 'side_control'
      | 'mount'
      | 'back_control'
      | 'north_south'
      | 'leg_entanglement'
      | 'scramble'
      >;
      showOnlyValidationIssues?: boolean;
    };
  }): Promise<SavedReviewPreset>;
  deleteSavedReviewPreset?(id: string): Promise<void>;
}

interface HttpMatchesApiOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

async function parseErrorDetails(response: Response): Promise<string[]> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(payload.message)) {
      return payload.message.filter((message): message is string => typeof message === 'string');
    }

    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return [payload.message];
    }

    return [];
  } catch {
    return [];
  }
}

function formatErrorMessage(defaultMessage: string, details: string[]): string {
  if (details.length === 0) {
    return defaultMessage;
  }

  return `${defaultMessage} ${details.join(' ')}`;
}

async function throwHttpRequestError(response: Response, defaultMessage: string): Promise<never> {
  const details = await parseErrorDetails(response);
  throw new HttpRequestError(formatErrorMessage(defaultMessage, details), response.status, details);
}

function resolveApiBaseUrl(override?: string): string {
  if (override) {
    return override;
  }

  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
}


function resolveApiAuthToken(): string {
  return import.meta.env.VITE_API_AUTH_TOKEN ?? 'scrambleiq-local-dev-token';
}

function mergeHeaders(init: RequestInit | undefined, authToken: string): HeadersInit {
  return {
    ...(init?.headers ?? {}),
    'x-api-key': authToken,
  };
}
export function createHttpMatchesApi(options: HttpMatchesApiOptions = {}): MatchesApi {
  const baseUrl = resolveApiBaseUrl(options.baseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;
  const authToken = resolveApiAuthToken();

  const authedFetch = (url: string, init?: RequestInit): Promise<Response> => fetchImpl(url, {
    ...init,
    headers: mergeHeaders(init, authToken),
  });

  return {
    async createMatch(payload: CreateMatchDto) {
      const response = await authedFetch(`${baseUrl}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to create match.');
      }

      return (await response.json()) as Match;
    },

    async listMatches(query) {
      const searchParams = new URLSearchParams();

      if (query?.competitor) {
        searchParams.set('competitor', query.competitor);
      }

      if (query?.dateFrom) {
        searchParams.set('dateFrom', query.dateFrom);
      }

      if (query?.dateTo) {
        searchParams.set('dateTo', query.dateTo);
      }

      if (query?.hasVideo !== undefined) {
        searchParams.set('hasVideo', String(query.hasVideo));
      }

      if (query?.limit !== undefined) {
        searchParams.set('limit', String(query.limit));
      }

      if (query?.offset !== undefined) {
        searchParams.set('offset', String(query.offset));
      }

      const queryString = searchParams.toString();
      const response = await authedFetch(`${baseUrl}/matches${queryString ? `?${queryString}` : ''}`);

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load matches.');
      }

      return (await response.json()) as MatchListResponse;
    },

    async getMatch(id) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        throw new MatchNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load match.');
      }

      return (await response.json()) as Match;
    },

    async updateMatch(id, payload) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new MatchNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to update match.');
      }

      return (await response.json()) as Match;
    },

    async deleteMatch(id) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new MatchNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to delete match.');
      }
    },

    async createTimelineEvent(matchId, payload) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to create timeline event.');
      }

      return (await response.json()) as TimelineEvent;
    },

    async listTimelineEvents(matchId) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/events`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load timeline events.');
      }

      return (await response.json()) as TimelineEvent[];
    },

    async updateTimelineEvent(id, payload) {
      const response = await authedFetch(`${baseUrl}/events/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new TimelineEventNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to update timeline event.');
      }

      return (await response.json()) as TimelineEvent;
    },

    async deleteTimelineEvent(id) {
      const response = await authedFetch(`${baseUrl}/events/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new TimelineEventNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to delete timeline event.');
      }
    },

    async createPositionState(matchId, payload) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/positions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to create position state.');
      }

      return (await response.json()) as PositionState;
    },

    async listPositionStates(matchId) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/positions`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load position states.');
      }

      return (await response.json()) as PositionState[];
    },

    async updatePositionState(id, payload) {
      const response = await authedFetch(`${baseUrl}/positions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new PositionStateNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to update position state.');
      }

      return (await response.json()) as PositionState;
    },

    async deletePositionState(id) {
      const response = await authedFetch(`${baseUrl}/positions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new PositionStateNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to delete position state.');
      }
    },

    async getMatchAnalytics(matchId) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/analytics`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load match analytics.');
      }

      return (await response.json()) as MatchAnalyticsSummary;
    },

    async createMatchVideo(matchId, payload) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to attach match video.');
      }

      return (await response.json()) as MatchVideo;
    },


    async exportMatchDataset(matchId) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/export`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to export match dataset.');
      }

      return (await response.json()) as MatchDatasetExport;
    },


    async validateMatchDataset(matchId) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/validate`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to validate match dataset.');
      }

      return (await response.json()) as DatasetValidationReport;
    },

    async getMatchVideo(matchId) {
      const response = await authedFetch(`${baseUrl}/matches/${encodeURIComponent(matchId)}/video`);

      if (response.status === 404) {
        throw new MatchVideoNotFoundError(matchId);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load match video.');
      }

      return (await response.json()) as MatchVideo;
    },

    async updateMatchVideo(id, payload) {
      const response = await authedFetch(`${baseUrl}/video/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new MatchVideoNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to update match video.');
      }

      return (await response.json()) as MatchVideo;
    },

    async deleteMatchVideo(id) {
      const response = await authedFetch(`${baseUrl}/video/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new MatchVideoNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to delete match video.');
      }
    },

    async createReviewTemplate(payload) {
      const response = await authedFetch(`${baseUrl}/review-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to create review template.');
      }

      return (await response.json()) as ReviewTemplate;
    },

    async listReviewTemplates() {
      const response = await authedFetch(`${baseUrl}/review-templates`);

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load review templates.');
      }

      return (await response.json()) as ReviewTemplateMetadata[];
    },

    async getReviewTemplate(id) {
      const response = await authedFetch(`${baseUrl}/review-templates/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        throw new ReviewTemplateNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load review template.');
      }

      return (await response.json()) as ReviewTemplate;
    },

    async updateReviewTemplate(id, payload) {
      const response = await authedFetch(`${baseUrl}/review-templates/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new ReviewTemplateNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to update review template.');
      }

      return (await response.json()) as ReviewTemplate;
    },

    async deleteReviewTemplate(id) {
      const response = await authedFetch(`${baseUrl}/review-templates/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new ReviewTemplateNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to delete review template.');
      }
    },

    async createSavedReviewPreset(payload) {
      const response = await authedFetch(`${baseUrl}/saved-review-presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to create saved review preset.');
      }

      return (await response.json()) as SavedReviewPreset;
    },

    async listSavedReviewPresets() {
      const response = await authedFetch(`${baseUrl}/saved-review-presets`);

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load saved review presets.');
      }

      return (await response.json()) as SavedReviewPresetMetadata[];
    },

    async getSavedReviewPreset(id) {
      const response = await authedFetch(`${baseUrl}/saved-review-presets/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        throw new SavedReviewPresetNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to load saved review preset.');
      }

      return (await response.json()) as SavedReviewPreset;
    },

    async updateSavedReviewPreset(id, payload) {
      const response = await authedFetch(`${baseUrl}/saved-review-presets/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new SavedReviewPresetNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to update saved review preset.');
      }

      return (await response.json()) as SavedReviewPreset;
    },

    async deleteSavedReviewPreset(id) {
      const response = await authedFetch(`${baseUrl}/saved-review-presets/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new SavedReviewPresetNotFoundError(id);
      }

      if (!response.ok) {
        await throwHttpRequestError(response, 'Failed to delete saved review preset.');
      }
    },
  };
}
