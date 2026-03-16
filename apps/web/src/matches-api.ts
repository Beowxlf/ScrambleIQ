import type {
  CreateMatchDto,
  CreatePositionStateDto,
  CreateTimelineEventDto,
  Match,
  PositionState,
  TimelineEvent,
  UpdateMatchDto,
  UpdatePositionStateDto,
  UpdateTimelineEventDto,
} from '@scrambleiq/shared';

export class MatchNotFoundError extends Error {
  constructor(matchId: string) {
    super(`Match with id ${matchId} was not found.`);
    this.name = 'MatchNotFoundError';
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

export interface MatchesApi {
  createMatch(payload: CreateMatchDto): Promise<Match>;
  listMatches(): Promise<Match[]>;
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
}

interface HttpMatchesApiOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function resolveApiBaseUrl(override?: string): string {
  if (override) {
    return override;
  }

  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
}

export function createHttpMatchesApi(options: HttpMatchesApiOptions = {}): MatchesApi {
  const baseUrl = resolveApiBaseUrl(options.baseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async createMatch(payload: CreateMatchDto) {
      const response = await fetchImpl(`${baseUrl}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create match.');
      }

      return (await response.json()) as Match;
    },

    async listMatches() {
      const response = await fetchImpl(`${baseUrl}/matches`);

      if (!response.ok) {
        throw new Error('Failed to load matches.');
      }

      return (await response.json()) as Match[];
    },

    async getMatch(id) {
      const response = await fetchImpl(`${baseUrl}/matches/${id}`);

      if (response.status === 404) {
        throw new MatchNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to load match.');
      }

      return (await response.json()) as Match;
    },

    async updateMatch(id, payload) {
      const response = await fetchImpl(`${baseUrl}/matches/${id}`, {
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
        throw new Error('Failed to update match.');
      }

      return (await response.json()) as Match;
    },

    async deleteMatch(id) {
      const response = await fetchImpl(`${baseUrl}/matches/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new MatchNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to delete match.');
      }
    },

    async createTimelineEvent(matchId, payload) {
      const response = await fetchImpl(`${baseUrl}/matches/${matchId}/events`, {
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
        throw new Error('Failed to create timeline event.');
      }

      return (await response.json()) as TimelineEvent;
    },

    async listTimelineEvents(matchId) {
      const response = await fetchImpl(`${baseUrl}/matches/${matchId}/events`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        throw new Error('Failed to load timeline events.');
      }

      return (await response.json()) as TimelineEvent[];
    },

    async updateTimelineEvent(id, payload) {
      const response = await fetchImpl(`${baseUrl}/events/${id}`, {
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
        throw new Error('Failed to update timeline event.');
      }

      return (await response.json()) as TimelineEvent;
    },

    async deleteTimelineEvent(id) {
      const response = await fetchImpl(`${baseUrl}/events/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new TimelineEventNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to delete timeline event.');
      }
    },

    async createPositionState(matchId, payload) {
      const response = await fetchImpl(`${baseUrl}/matches/${matchId}/positions`, {
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
        throw new Error('Failed to create position state.');
      }

      return (await response.json()) as PositionState;
    },

    async listPositionStates(matchId) {
      const response = await fetchImpl(`${baseUrl}/matches/${matchId}/positions`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        throw new Error('Failed to load position states.');
      }

      return (await response.json()) as PositionState[];
    },

    async updatePositionState(id, payload) {
      const response = await fetchImpl(`${baseUrl}/positions/${id}`, {
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
        throw new Error('Failed to update position state.');
      }

      return (await response.json()) as PositionState;
    },

    async deletePositionState(id) {
      const response = await fetchImpl(`${baseUrl}/positions/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new PositionStateNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to delete position state.');
      }
    },
  };
}
