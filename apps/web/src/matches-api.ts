import type {
  CreateMatchDto,
  CreatePositionStateDto,
  CreateMatchVideoDto,
  CreateTimelineEventDto,
  Match,
  MatchVideo,
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


export class MatchVideoNotFoundError extends Error {
  constructor(videoIdOrMatchId: string) {
    super(`Match video resource was not found for id ${videoIdOrMatchId}.`);
    this.name = 'MatchVideoNotFoundError';
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
  createMatchVideo(matchId: string, payload: CreateMatchVideoDto): Promise<MatchVideo>;
  getMatchVideo(matchId: string): Promise<MatchVideo>;
  updateMatchVideo(id: string, payload: UpdateMatchVideoDto): Promise<MatchVideo>;
  deleteMatchVideo(id: string): Promise<void>;
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
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(id)}`);

      if (response.status === 404) {
        throw new MatchNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to load match.');
      }

      return (await response.json()) as Match;
    },

    async updateMatch(id, payload) {
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(id)}`, {
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
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(id)}`, {
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
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(matchId)}/events`, {
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
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(matchId)}/events`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        throw new Error('Failed to load timeline events.');
      }

      return (await response.json()) as TimelineEvent[];
    },

    async updateTimelineEvent(id, payload) {
      const response = await fetchImpl(`${baseUrl}/events/${encodeURIComponent(id)}`, {
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
      const response = await fetchImpl(`${baseUrl}/events/${encodeURIComponent(id)}`, {
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
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(matchId)}/positions`, {
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
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(matchId)}/positions`);

      if (response.status === 404) {
        throw new MatchNotFoundError(matchId);
      }

      if (!response.ok) {
        throw new Error('Failed to load position states.');
      }

      return (await response.json()) as PositionState[];
    },

    async updatePositionState(id, payload) {
      const response = await fetchImpl(`${baseUrl}/positions/${encodeURIComponent(id)}`, {
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
      const response = await fetchImpl(`${baseUrl}/positions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new PositionStateNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to delete position state.');
      }
    },

    async createMatchVideo(matchId, payload) {
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(matchId)}/video`, {
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
        throw new Error('Failed to attach match video.');
      }

      return (await response.json()) as MatchVideo;
    },

    async getMatchVideo(matchId) {
      const response = await fetchImpl(`${baseUrl}/matches/${encodeURIComponent(matchId)}/video`);

      if (response.status === 404) {
        throw new MatchVideoNotFoundError(matchId);
      }

      if (!response.ok) {
        throw new Error('Failed to load match video.');
      }

      return (await response.json()) as MatchVideo;
    },

    async updateMatchVideo(id, payload) {
      const response = await fetchImpl(`${baseUrl}/video/${encodeURIComponent(id)}`, {
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
        throw new Error('Failed to update match video.');
      }

      return (await response.json()) as MatchVideo;
    },

    async deleteMatchVideo(id) {
      const response = await fetchImpl(`${baseUrl}/video/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new MatchVideoNotFoundError(id);
      }

      if (!response.ok) {
        throw new Error('Failed to delete match video.');
      }
    },
  };
}
