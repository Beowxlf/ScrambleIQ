import type { CreateMatchDto, Match, UpdateMatchDto } from '@scrambleiq/shared';

export class MatchNotFoundError extends Error {
  constructor(matchId: string) {
    super(`Match with id ${matchId} was not found.`);
    this.name = 'MatchNotFoundError';
  }
}

export interface MatchesApi {
  createMatch(payload: CreateMatchDto): Promise<Match>;
  listMatches(): Promise<Match[]>;
  getMatch(id: string): Promise<Match>;
  updateMatch(id: string, payload: UpdateMatchDto): Promise<Match>;
  deleteMatch(id: string): Promise<void>;
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
  };
}
