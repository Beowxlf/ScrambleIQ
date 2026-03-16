import { Match, MatchFormValues } from './match';

export interface MatchesApi {
  createMatch(payload: MatchFormValues): Promise<Match>;
  listMatches(): Promise<Match[]>;
}

interface HttpMatchesApiOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export function createHttpMatchesApi(options: HttpMatchesApiOptions = {}): MatchesApi {
  const baseUrl = options.baseUrl ?? 'http://localhost:3000';
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async createMatch(payload) {
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
  };
}
