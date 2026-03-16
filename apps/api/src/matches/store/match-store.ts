import type { CreateMatchDto, Match } from '@scrambleiq/shared';

export interface MatchStore {
  create(input: CreateMatchDto): Match;
  findAll(): Match[];
  findById(id: string): Match | undefined;
}
