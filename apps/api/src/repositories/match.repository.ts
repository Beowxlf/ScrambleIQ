import type { CreateMatchDto, Match, MatchSummary, UpdateMatchDto } from '@scrambleiq/shared';

export interface MatchRepository {
  create(input: CreateMatchDto): Promise<Match>;
  findAll(): Promise<Match[]>;
  findAllSummaries(): Promise<MatchSummary[]>;
  findById(id: string): Promise<Match | undefined>;
  update(id: string, input: UpdateMatchDto): Promise<Match | undefined>;
  delete(id: string): Promise<boolean>;
}

export const MATCH_REPOSITORY = Symbol('MATCH_REPOSITORY');
