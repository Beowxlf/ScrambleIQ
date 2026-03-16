import type { CreateMatchDto, Match, UpdateMatchDto } from '@scrambleiq/shared';

export interface MatchStore {
  create(input: CreateMatchDto): Match;
  findAll(): Match[];
  findById(id: string): Match | undefined;
  update(id: string, input: UpdateMatchDto): Match | undefined;
}
